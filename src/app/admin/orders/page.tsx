import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "../actions";
import AutoRefresh from "@/components/AutoRefresh";

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

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const status = params.status ?? "ACTIVE";

  const sessions = await db.tableSession.findMany({
    where:
      status === "all"
        ? {}
        : {
            status: status as "ACTIVE" | "CLOSED"
          },
    include: {
      orders: {
        include: {
          items: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <main className="bg-[#F4EEDA]">
      <AutoRefresh interval={5000} />

      <div className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Table Sessions
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Manage active tables and billing
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/80">
            Each table can have multiple orders under one session. Close the
            table only after payment is completed.
          </p>

          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border border-[#005340]/20 bg-white px-5 py-3 font-black text-[#005340] transition hover:bg-[#F4EEDA]"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </section>

        <form className="mt-6 flex gap-3 rounded-3xl border border-[#005340]/10 bg-white p-4 shadow-[0_18px_60px_rgba(0,83,64,0.08)]">
          <select
            name="status"
            defaultValue={status}
            className="rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#005340]"
          >
            {["ACTIVE", "CLOSED", "all"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button className="rounded-2xl bg-[#005340] px-6 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
            Filter
          </button>
        </form>

        <section className="mt-8 space-y-6">
          {sessions.map((session) => {
            const activeOrders = session.orders.filter(
              (order) => order.status !== "CANCELLED"
            );

            const sessionTotal = activeOrders.reduce(
              (total, order) => total + order.totalAmount,
              0
            );

            return (
              <article
                key={session.id}
                className="rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                      Table {session.tableNumber}
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-[#005340]">
                      ₹{sessionTotal}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <span className="rounded-full bg-[#F4EEDA] px-3 py-1 font-bold text-[#005340]">
                        {session.status}
                      </span>

                      <span className="rounded-full bg-[#F4EEDA] px-3 py-1 font-bold text-[#005340]">
                        {session.orders.length} Orders
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#10251F]/60">
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
                      href={`/admin/session/${session.id}`}
                      className="rounded-xl border border-[#005340]/20 px-5 py-3 font-black text-[#005340] transition hover:bg-[#F4EEDA]"
                    >
                      View Bill
                    </Link>

                    <Link
                      href={`/admin/session/${session.id}/bill/pdf`}
                      target="_blank"
                      className="rounded-xl bg-[#C8A85A] px-5 py-3 font-black text-[#10251F] transition hover:bg-[#b99a4d]"
                    >
                      Download PDF Bill
                    </Link>

                    {session.status === "ACTIVE" && (
                      <form action={closeTableSession}>
                        <input
                          type="hidden"
                          name="sessionId"
                          value={session.id}
                        />

                        <button className="rounded-xl bg-[#005340] px-5 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
                          Close Table / Mark Paid
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {session.orders.map((order, index) => (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-[#005340]/10 bg-[#FFFDF7] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#C8A85A]">
                            Order #{index + 1}
                          </p>

                          <p className="mt-1 break-all text-xs font-bold text-[#10251F]/55">
                            {order.id}
                          </p>

                          <h3 className="mt-2 text-xl font-black text-[#005340]">
                            ₹{order.totalAmount}
                          </h3>

                          <p className="mt-2 text-sm text-[#10251F]/60">
                            {order.createdAt.toLocaleString()}
                          </p>

                          {(order.customerName || order.customerPhone) && (
                            <p className="mt-2 text-sm text-[#10251F]/75">
                              Customer: {order.customerName ?? "Walk-in"}{" "}
                              {order.customerPhone
                                ? `• ${order.customerPhone}`
                                : ""}
                            </p>
                          )}

                          {order.notes && (
                            <p className="mt-2 rounded-2xl bg-[#F4EEDA] p-3 text-sm text-[#10251F]/75">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>

                        <form action={updateOrderStatus} className="flex gap-2">
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />

                          <select
                            name="status"
                            defaultValue={order.status}
                            className="rounded-xl border border-[#005340]/15 bg-white px-3 py-2 outline-none focus:border-[#005340]"
                          >
                            {[
                              "PENDING",
                              "PREPARING",
                              "READY",
                              "COMPLETED",
                              "CANCELLED"
                            ].map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>

                          <button className="rounded-xl bg-[#005340] px-4 py-2 font-bold text-[#F4EEDA] transition hover:bg-[#042c23]">
                            Update
                          </button>
                        </form>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-[#F4EEDA] p-4"
                          >
                            <p className="font-black text-[#10251F]">
                              {item.itemName}
                            </p>

                            <p className="text-sm text-[#10251F]/60">
                              ₹{item.unitPrice} × {item.quantity}
                            </p>

                            <p className="mt-2 font-black text-[#005340]">
                              ₹{item.lineTotal}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}

          {sessions.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
              <h2 className="text-2xl font-black text-[#005340]">
                No table sessions found
              </h2>

              <p className="mt-2 text-[#10251F]/60">
                New customer orders will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}