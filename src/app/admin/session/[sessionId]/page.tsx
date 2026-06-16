import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

async function closeTableSession(formData: FormData) {
  "use server";

  await requireAdmin();

  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) return;

  await db.tableSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      orders: {
        updateMany: {
          where: {
            status: {
              notIn: ["CANCELLED", "COMPLETED"]
            }
          },
          data: {
            status: "COMPLETED"
          }
        }
      }
    }
  });

  revalidatePath(`/admin/session/${sessionId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export default async function AdminSessionBillPage({
  params
}: {
  params: Promise<{ sessionId: string }>;
}) {
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
    notFound();
  }

  const billableOrders = session.orders.filter(
    (order) => order.status !== "CANCELLED"
  );

  const subtotal = billableOrders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const grandTotal = subtotal + cgst + sgst;

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Session Bill
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Table {session.tableNumber}
          </h1>

          <p className="mt-4 text-white/80">
            Session status:{" "}
            <span className="font-black text-[#F4EEDA]">
              {session.status}
            </span>
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                Big Star Cafe Bill
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#005340]">
                Grand Total ₹{grandTotal.toFixed(2)}
              </h2>

              <p className="mt-2 text-sm text-[#10251F]/60">
                Started: {session.createdAt.toLocaleString()}
              </p>

              {session.closedAt && (
                <p className="mt-1 text-sm text-[#10251F]/60">
                  Closed: {session.closedAt.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/orders"
                className="rounded-xl border border-[#005340]/20 px-5 py-3 font-black text-[#005340] transition hover:bg-[#F4EEDA]"
              >
                Back to Sessions
              </Link>

              {session.status === "ACTIVE" && (
                <form action={closeTableSession}>
                  <input type="hidden" name="sessionId" value={session.id} />

                  <button className="rounded-xl bg-[#005340] px-5 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
                    Mark Paid & Close Table
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {session.orders.map((order, orderIndex) => (
              <div
                key={order.id}
                className="rounded-3xl border border-[#005340]/10 bg-[#FFFDF7] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#C8A85A]">
                      Order #{orderIndex + 1}
                    </p>

                    <p className="mt-1 break-all text-xs font-bold text-[#10251F]/55">
                      {order.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                      {order.status}
                    </span>

                    <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#005340]/10 text-[#10251F]/55">
                        <th className="py-3">Item</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#005340]/5"
                        >
                          <td className="py-3 font-bold text-[#10251F]">
                            {item.itemName}
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{item.unitPrice}</td>
                          <td className="font-black text-[#005340]">
                            ₹{item.lineTotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-xs text-[#10251F]/50">
                  Ordered at: {order.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-[#F4EEDA] p-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-bold text-[#10251F]/70">Subtotal</span>
                <span className="font-black text-[#10251F]">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold text-[#10251F]/70">CGST 2.5%</span>
                <span className="font-black text-[#10251F]">
                  ₹{cgst.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold text-[#10251F]/70">SGST 2.5%</span>
                <span className="font-black text-[#10251F]">
                  ₹{sgst.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-[#005340]/10 pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-black text-[#005340]">
                    Grand Total
                  </span>
                  <span className="font-black text-[#005340]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}