import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus, resolveWaiterCall } from "../actions";
import AutoRefresh from "@/components/AutoRefresh";

export default async function KitchenDisplayPage() {
  await requireAdmin();

  const [orders, waiterCalls] = await Promise.all([
    db.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PREPARING", "READY"]
        },
        session: {
          status: "ACTIVE"
        }
      },
      include: {
        items: true,
        session: true
      },
      orderBy: {
        createdAt: "asc"
      }
    }),

    db.waiterCall.findMany({
      where: {
        status: "OPEN"
      },
      orderBy: {
        createdAt: "asc"
      }
    })
  ]);

  const groupedOrders = {
    PENDING: orders.filter((order) => order.status === "PENDING"),
    PREPARING: orders.filter((order) => order.status === "PREPARING"),
    READY: orders.filter((order) => order.status === "READY")
  };

  return (
    <main className="min-h-screen bg-[#F4EEDA]">
        <AutoRefresh interval={5000} />
      <div className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Kitchen Display
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Live food preparation queue
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/80">
            Kitchen staff can move orders from Pending to Preparing to Ready.
            Waiter calls appear here separately.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex rounded-full bg-white px-5 py-3 font-black text-[#005340] transition hover:bg-[#F4EEDA]"
            >
              ← Back to Admin Dashboard
            </Link>

            <Link
              href="/admin/orders"
              className="inline-flex rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10"
            >
              Manage Table Sessions
            </Link>
          </div>
        </section>

        {waiterCalls.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-[#C8A85A]/30 bg-white p-5 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#005340]">
                🔔 Waiter Calls
              </h2>

              <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                {waiterCalls.length} open
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {waiterCalls.map((call) => (
                <article
                  key={call.id}
                  className="rounded-3xl border border-[#C8A85A]/30 bg-[#FFFDF7] p-5"
                >
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                    Table {call.tableNumber}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-[#10251F]">
                    Customer needs assistance
                  </h3>

                  {call.message && (
                    <p className="mt-2 text-sm font-semibold text-[#10251F]/70">
                      {call.message}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-[#10251F]/50">
                    Called at: {call.createdAt.toLocaleString()}
                  </p>

                  <form action={resolveWaiterCall} className="mt-4">
                    <input type="hidden" name="waiterCallId" value={call.id} />

                    <button className="w-full rounded-xl bg-[#005340] px-4 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
                      Mark Resolved
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {(["PENDING", "PREPARING", "READY"] as const).map((status) => (
            <div
              key={status}
              className="rounded-[2rem] border border-[#005340]/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,83,64,0.12)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#005340]">
                  {status}
                </h2>

                <span className="rounded-full bg-[#F4EEDA] px-4 py-2 text-sm font-black text-[#005340]">
                  {groupedOrders[status].length}
                </span>
              </div>

              <div className="space-y-4">
                {groupedOrders[status].map((order) => (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-[#005340]/10 bg-[#FFFDF7] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                          Table {order.tableNumber}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-[#10251F]">
                          Order {order.id.slice(-6).toUpperCase()}
                        </h3>

                        <p className="mt-1 text-xs text-[#10251F]/50">
                          {order.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#F4EEDA] px-3 py-1 text-xs font-black text-[#005340]">
                        {order.items.length} items
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-[#F4EEDA] p-4"
                        >
                          <p className="text-lg font-black text-[#10251F]">
                            {item.quantity} × {item.itemName}
                          </p>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C8A85A]">
                          Notes
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#10251F]/75">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    <form action={updateOrderStatus} className="mt-5">
                      <input type="hidden" name="orderId" value={order.id} />

                      <div className="flex gap-2">
                        <select
                          name="status"
                          defaultValue={order.status}
                          className="w-full rounded-xl border border-[#005340]/15 bg-white px-3 py-3 font-bold text-[#10251F] outline-none focus:border-[#005340]"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        <button className="rounded-xl bg-[#005340] px-4 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
                          Update
                        </button>
                      </div>
                    </form>
                  </article>
                ))}

                {groupedOrders[status].length === 0 && (
                  <div className="rounded-3xl bg-[#F4EEDA] p-6 text-center text-sm font-bold text-[#10251F]/55">
                    No {status.toLowerCase()} orders.
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}