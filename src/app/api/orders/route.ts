import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type IncomingOrderItem = {
  menuItemId: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tableNumber = String(body.tableNumber ?? "").trim();
    const customerName = body.customerName ? String(body.customerName).trim() : null;
    const customerPhone = body.customerPhone ? String(body.customerPhone).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const items = Array.isArray(body.items) ? (body.items as IncomingOrderItem[]) : [];

    if (!tableNumber) {
      return NextResponse.json({ error: "Table number is required." }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item." }, { status: 400 });
    }

    const cleanedItems = items
      .map((item) => ({
        menuItemId: String(item.menuItemId),
        quantity: Number(item.quantity)
      }))
      .filter(
        (item) =>
          item.menuItemId &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 20
      );

    if (cleanedItems.length !== items.length) {
      return NextResponse.json({ error: "Invalid order item data." }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      let session = await tx.tableSession.findFirst({
        where: {
          tableNumber,
          status: "ACTIVE"
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (!session) {
        session = await tx.tableSession.create({
          data: {
            tableNumber,
            status: "ACTIVE"
          }
        });
      }

      const menuIds = cleanedItems.map((item) => item.menuItemId);

      const menuItems = await tx.menuItem.findMany({
        where: {
          id: { in: menuIds },
          isAvailable: true
        }
      });

      if (menuItems.length !== menuIds.length) {
        throw new Error("Some menu items are unavailable.");
      }

      const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

      const orderItems = cleanedItems.map((item) => {
        const menuItem = menuItemMap.get(item.menuItemId);

        if (!menuItem) {
          throw new Error("Menu item not found during order creation.");
        }

        return {
          menuItemId: menuItem.id,
          itemName: menuItem.name,
          unitPrice: menuItem.price,
          quantity: item.quantity,
          lineTotal: menuItem.price * item.quantity
        };
      });

      const totalAmount = orderItems.reduce(
        (total, item) => total + item.lineTotal,
        0
      );

      const order = await tx.order.create({
        data: {
          tableNumber,
          customerName,
          customerPhone,
          notes,
          totalAmount,
          sessionId: session.id,
          items: {
            create: orderItems
          }
        }
      });

      const sessionOrders = await tx.order.findMany({
        where: {
          sessionId: session.id,
          status: {
            not: "CANCELLED"
          }
        }
      });

      const sessionTotal = sessionOrders.reduce(
        (total, item) => total + item.totalAmount,
        0
      );

      return {
        orderId: order.id,
        sessionId: session.id,
        orderTotal: order.totalAmount,
        sessionTotal
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message === "Some menu items are unavailable."
        ? error.message
        : "Unable to place order right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}