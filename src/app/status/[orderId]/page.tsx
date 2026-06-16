import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CallWaiterButton from "@/components/CallWaiterButton";
import AutoRefresh from "@/components/AutoRefresh";

export default async function OrderStatusPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      session: {
        include: {
          orders: {
            include: { items: true },
            orderBy: { createdAt: "asc" }
          }
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  const sessionOrders = order.session?.orders ?? [order];

  const activeOrders = sessionOrders.filter(
    (item) => item.status !== "CANCELLED"
  );

  const sessionTotal = activeOrders.reduce(
    (total, item) => total + item.totalAmount,
    0
  );

  return (
    <main className="bg-[#F4EEDA]">
      <AutoRefresh interval={5000} />
      <div className="mx-auto max-w-5xl px-5 py-12">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Table Session Status
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Table {order.tableNumber}
          </h1>

          <p className="mt-4 text-white/80">
            Session status:{" "}
            <span className="font-black text-[#F4EEDA]">
              {order.session?.status ?? "ACTIVE"}
            </span>
          </p>
        </section>

        <section className="mt-6">
          <CallWaiterButton tableNumber={order.tableNumber} />
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                Active Table Bill
              </p>

              <p className="mt-2 text-sm font-bold text-[#10251F]/70">
                This includes all active orders placed for this table session.
              </p>
            </div>

            <div className="rounded-full bg-[#F4EEDA] px-5 py-3 font-black text-[#005340]">
              Total ₹{sessionTotal}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {sessionOrders.map((sessionOrder, index) => (
              <div
                key={sessionOrder.id}
                className="rounded-3xl border border-[#005340]/10 bg-[#FFFDF7] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#C8A85A]">
                      Order #{index + 1}
                    </p>

                    <p className="mt-1 break-all text-xs font-bold text-[#10251F]/55">
                      {sessionOrder.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                      {sessionOrder.status}
                    </span>

                    <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                      ₹{sessionOrder.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {sessionOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-[#F4EEDA] p-4"
                    >
                      <div>
                        <p className="font-black text-[#10251F]">
                          {item.itemName}
                        </p>

                        <p className="text-sm text-[#10251F]/60">
                          ₹{item.unitPrice} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-black text-[#005340]">
                        ₹{item.lineTotal}
                      </p>
                    </div>
                  ))}
                </div>

                {sessionOrder.notes && (
                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-sm font-black text-[#005340]">Notes</p>
                    <p className="mt-2 text-sm text-[#10251F]/70">
                      {sessionOrder.notes}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-xs text-[#10251F]/50">
                  Ordered at: {sessionOrder.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {order.session?.status === "CLOSED" ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              This table session is closed. Please scan the table QR again for a
              new session.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-[#F4EEDA] p-4">
              <p className="text-sm font-semibold leading-6 text-[#10251F]/70">
                Want to add more items? Your current table bill will stay saved.
                New items will be added under the same active table session.
              </p>

              <Link
                href={`/order?table=${order.tableNumber}`}
                className="mt-4 inline-flex rounded-full bg-[#005340] px-6 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]"
              >
                Order More Items
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}