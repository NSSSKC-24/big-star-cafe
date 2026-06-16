import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logoutAdmin, updateOrderStatus } from "./actions";
import AutoRefresh from "@/components/AutoRefresh";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    activeSessions,
    todayOrders,
    todayRevenue,
    totalRevenue,
    latestOrders,
    menuItems,
    topItemsRaw,
    waiterCalls
  ] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PREPARING" } }),
    db.order.count({ where: { status: "READY" } }),
    db.order.count({ where: { status: "COMPLETED" } }),
    db.tableSession.count({ where: { status: "ACTIVE" } }),

    db.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        },
        status: {
          not: "CANCELLED"
        }
      }
    }),

    db.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        },
        status: {
          not: "CANCELLED"
        }
      }
    }),

    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } }
    }),

    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true, session: true }
    }),

    db.menuItem.count(),

    db.orderItem.groupBy({
      by: ["itemName"],
      _sum: {
        quantity: true,
        lineTotal: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 5
    }),

    db.waiterCall.count({
      where: {
        status: "OPEN"
      }
    })
  ]);

  const todayRevenueValue = todayRevenue._sum.totalAmount ?? 0;
  const totalRevenueValue = totalRevenue._sum.totalAmount ?? 0;

  const stats = [
    ["Today Revenue", `₹${todayRevenueValue}`],
    ["Today Orders", todayOrders],
    ["Active Tables", activeSessions],
    ["Pending", pendingOrders],
    ["Preparing", preparingOrders],
    ["Ready", readyOrders],
    ["Completed", completedOrders],
    ["Open Waiter Calls", waiterCalls],
    ["Menu Items", menuItems]
  ];

  const statusStats = [
    ["Pending", pendingOrders],
    ["Preparing", preparingOrders],
    ["Ready", readyOrders],
    ["Completed", completedOrders]
  ];

  const maxStatusCount = Math.max(
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    1
  );

  const topItems = topItemsRaw.map((item) => ({
    name: item.itemName,
    quantity: item._sum.quantity ?? 0,
    revenue: item._sum.lineTotal ?? 0
  }));

  return (
    <main className="bg-[#F4EEDA]">
      <AutoRefresh interval={5000} />

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C8A85A]">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-black text-[#005340]">
              Analytics & Operations Control
            </h1>

            <p className="mt-2 text-sm font-semibold text-[#10251F]/60">
              Live overview of sales, table activity, order flow, and best
              selling items.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="rounded-full bg-[#005340] px-5 py-3 font-black text-[#F4EEDA] transition hover:bg-[#042c23]"
            >
              Manage Table Sessions
            </Link>

            <Link
              href="/admin/kitchen"
              className="rounded-full bg-[#F4EEDA] px-5 py-3 font-black text-[#005340] ring-1 ring-[#005340]/20 transition hover:bg-white"
            >
              Kitchen Display
            </Link>

            <Link
              href="/admin/qr"
              className="rounded-full bg-[#C8A85A] px-5 py-3 font-black text-[#10251F] transition hover:bg-[#b99a4d]"
            >
              Table QR Codes
            </Link>

            <Link
              href="/admin/menu"
              className="rounded-full bg-[#10251F] px-5 py-3 font-black text-white transition hover:bg-[#042c23]"
            >
              Manage Menu
            </Link>

            <form action={logoutAdmin}>
              <button className="rounded-full border border-[#005340]/20 px-5 py-3 font-black text-[#10251F] transition hover:bg-white">
                Logout
              </button>
            </form>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-[#005340]/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,83,64,0.08)]"
            >
              <p className="text-sm font-bold text-[#10251F]/55">{label}</p>
              <p className="mt-2 text-3xl font-black text-[#005340]">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-6 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
              Revenue Snapshot
            </p>

            <p className="mt-2 text-5xl font-black">₹{todayRevenueValue}</p>

            <p className="mt-2 text-white/80">Today&apos;s revenue</p>

            <div className="mt-6 rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-white/70">All-time revenue</p>
              <p className="mt-1 text-3xl font-black">
                ₹{totalRevenueValue}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#005340]/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,83,64,0.08)]">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
              Order Status Mix
            </p>

            <div className="mt-5 space-y-4">
              {statusStats.map(([label, value]) => {
                const percentage = Math.round(
                  (Number(value) / maxStatusCount) * 100
                );

                return (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm font-bold text-[#10251F]/70">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-[#F4EEDA]">
                      <div
                        className="h-full rounded-full bg-[#005340]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[#005340]">
                Top Selling Items
              </h2>
            </div>

            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="rounded-3xl bg-[#F4EEDA] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                        #{index + 1}
                      </p>

                      <h3 className="mt-1 font-black text-[#10251F]">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#10251F]/60">
                        Sold quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-black text-[#005340]">
                      ₹{item.revenue}
                    </p>
                  </div>
                </div>
              ))}

              {topItems.length === 0 && (
                <div className="rounded-2xl bg-[#F4EEDA] p-5 text-center text-sm font-semibold text-[#10251F]/65">
                  No item sales yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#005340]">
                Latest Orders
              </h2>

              <Link href="/admin/orders" className="font-bold text-[#005340]">
                View all sessions →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#005340]/10 text-[#10251F]/55">
                    <th className="py-3">Time</th>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Session</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {latestOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#005340]/5 align-top"
                    >
                      <td className="py-4 font-semibold text-[#10251F]/75">
                        {order.createdAt.toLocaleString()}
                      </td>

                      <td className="max-w-[160px] break-all text-xs font-bold text-[#10251F]/60">
                        {order.id}
                      </td>

                      <td className="font-bold text-[#10251F]">
                        {order.tableNumber}
                      </td>

                      <td className="max-w-[140px] break-all text-xs text-[#10251F]/55">
                        {order.sessionId ?? "—"}
                      </td>

                      <td className="text-[#10251F]/70">
                        {order.items.map((item) => (
                          <p key={item.id}>
                            {item.itemName} × {item.quantity}
                          </p>
                        ))}
                      </td>

                      <td className="font-black text-[#005340]">
                        ₹{order.totalAmount}
                      </td>

                      <td className="font-semibold text-[#10251F]/75">
                        {order.status}
                      </td>

                      <td>
                        <form
                          action={updateOrderStatus}
                          className="flex gap-2"
                        >
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />

                          <select
                            name="status"
                            defaultValue={order.status}
                            className="rounded-xl border border-[#005340]/15 bg-[#FFFDF7] px-3 py-2 outline-none focus:border-[#005340]"
                          >
                            {[
                              "PENDING",
                              "PREPARING",
                              "READY",
                              "COMPLETED",
                              "CANCELLED"
                            ].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <button className="rounded-xl bg-[#005340] px-4 py-2 font-bold text-[#F4EEDA] transition hover:bg-[#042c23]">
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {latestOrders.length === 0 && (
              <div className="mt-6 rounded-2xl bg-[#F4EEDA] p-5 text-center text-sm font-semibold text-[#10251F]/65">
                No orders yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}