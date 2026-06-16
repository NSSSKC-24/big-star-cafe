import Link from "next/link";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";

const TABLE_COUNT = 10;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function AdminQrPage() {
  await requireAdmin();

  const baseUrl = getBaseUrl();

  const qrCodes = await Promise.all(
    Array.from({ length: TABLE_COUNT }, async (_, index) => {
      const tableNumber = index + 1;
      const orderUrl = `${baseUrl}/order?table=${tableNumber}`;

      const qrDataUrl = await QRCode.toDataURL(orderUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#005340",
          light: "#F4EEDA"
        }
      });

      return {
        tableNumber,
        orderUrl,
        qrDataUrl
      };
    })
  );

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Table QR Codes
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Print QR codes for each table.
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/80">
            Each QR code opens the ordering page with the correct table number
            already attached.
          </p>
        </section>

        <div className="mt-6 flex justify-between">
          <Link
            href="/admin"
            className="rounded-full border border-[#005340]/20 px-5 py-3 font-black text-[#005340] transition hover:bg-white"
          >
            Back to Dashboard
          </Link>

          <button
            onClick={undefined}
            className="hidden rounded-full bg-[#005340] px-5 py-3 font-black text-[#F4EEDA]"
          >
            Print
          </button>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qr) => (
            <article
              key={qr.tableNumber}
              className="rounded-[2rem] border border-[#005340]/10 bg-white p-6 text-center shadow-[0_24px_80px_rgba(0,83,64,0.12)]"
            >
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                Big Star Cafe
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#005340]">
                Table {qr.tableNumber}
              </h2>

              <div className="mx-auto mt-5 flex max-w-xs justify-center rounded-3xl bg-[#F4EEDA] p-5">
                <img
                  src={qr.qrDataUrl}
                  alt={`QR code for Table ${qr.tableNumber}`}
                  className="h-56 w-56"
                />
              </div>

              <p className="mt-4 break-all text-xs font-semibold text-[#10251F]/60">
                {qr.orderUrl}
              </p>

              <p className="mt-4 rounded-2xl bg-[#F4EEDA] p-3 text-sm font-bold text-[#005340]">
                Scan to order from Table {qr.tableNumber}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}