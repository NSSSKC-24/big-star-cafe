const PDFDocument = require("pdfkit/js/pdfkit.standalone.js");
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const CAFE_NAME = "Big Star Cafe";
const GST_NUMBER = "ADD_GST_NUMBER_HERE";
const SERVICE_CHARGE_PERCENT = 0;
const CGST_PERCENT = 2.5;
const SGST_PERCENT = 2.5;

function formatCurrency(amount: number) {
  return `Rs.${amount.toFixed(2)}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await requireAdmin();

    const { sessionId } = await params;

    const session = await db.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const activeOrders = session.orders.filter(
      (order) => order.status !== "CANCELLED"
    );

    const subtotal = activeOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    const serviceCharge = (subtotal * SERVICE_CHARGE_PERCENT) / 100;
    const taxableAmount = subtotal + serviceCharge;
    const cgst = (taxableAmount * CGST_PERCENT) / 100;
    const sgst = (taxableAmount * SGST_PERCENT) / 100;
    const grandTotal = taxableAmount + cgst + sgst;

    const billNumber = `BILL-${session.id.slice(-8).toUpperCase()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${session.id
      .slice(-6)
      .toUpperCase()}`;

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(24).text(CAFE_NAME, 45, 40);
      doc.fontSize(10).text("Restaurant Bill / Tax Invoice", 45, 70);
      doc.text(`GST No: ${GST_NUMBER}`, 45, 86);

      doc
        .roundedRect(445, 38, 95, 55, 8)
        .stroke()
        .fontSize(10)
        .text("CAFE LOGO", 465, 60);

      doc.moveTo(45, 110).lineTo(550, 110).stroke();

      doc.fontSize(10);
      doc.text(`Bill No: ${billNumber}`, 45, 125);
      doc.text(`Invoice No: ${invoiceNumber}`, 45, 142);
      doc.text(`Date & Time: ${new Date().toLocaleString()}`, 45, 159);
      doc.text(`Table No: ${session.tableNumber}`, 340, 125);
      doc.text(`Session Status: ${session.status}`, 340, 142);

      doc.moveTo(45, 185).lineTo(550, 185).stroke();

      let y = 205;

      doc.fontSize(10).text("Item", 45, y);
      doc.text("Qty", 300, y);
      doc.text("Rate", 360, y);
      doc.text("Amount", 455, y);

      y += 15;
      doc.moveTo(45, y).lineTo(550, y).stroke();
      y += 12;

      activeOrders.forEach((order, orderIndex) => {
        doc.fontSize(9).text(`Order #${orderIndex + 1}`, 45, y);
        y += 14;

        order.items.forEach((item) => {
          if (y > 680) {
            doc.addPage();
            y = 60;
          }

          doc.fontSize(9).text(item.itemName, 45, y, { width: 240 });
          doc.text(String(item.quantity), 305, y);
          doc.text(formatCurrency(item.unitPrice), 360, y);
          doc.text(formatCurrency(item.lineTotal), 455, y);

          y += 18;
        });

        y += 8;
      });

      doc.moveTo(45, y).lineTo(550, y).stroke();
      y += 16;

      doc.fontSize(10);
      doc.text("Subtotal", 360, y);
      doc.text(formatCurrency(subtotal), 455, y);
      y += 16;

      if (SERVICE_CHARGE_PERCENT > 0) {
        doc.text(`Service Charge (${SERVICE_CHARGE_PERCENT}%)`, 360, y);
        doc.text(formatCurrency(serviceCharge), 455, y);
        y += 16;
      }

      doc.text(`CGST (${CGST_PERCENT}%)`, 360, y);
      doc.text(formatCurrency(cgst), 455, y);
      y += 16;

      doc.text(`SGST (${SGST_PERCENT}%)`, 360, y);
      doc.text(formatCurrency(sgst), 455, y);
      y += 20;

      doc.fontSize(14).text("Grand Total", 360, y);
      doc.text(formatCurrency(grandTotal), 455, y);

      doc.fontSize(10).text("Thank you for visiting Big Star Cafe.", 45, 760, {
        align: "center"
      });

      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${billNumber}.pdf"`
      }
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}