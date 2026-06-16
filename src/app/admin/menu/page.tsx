import { db } from "@/lib/db";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createMenuItem, updateMenuAvailability } from "../actions";

export default async function AdminMenuPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const [categories, items] = await Promise.all([
    db.category.findMany({ orderBy: { displayOrder: "asc" } }),
    db.menuItem.findMany({
      include: { category: true },
      orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }]
    })
  ]);

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Menu Management
          </p>
          <h1 className="mt-3 text-4xl font-black">
            Add, hide, and manage cafe items.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/80">
            Staff can update the public menu without touching frontend code.
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

        {params.success === "created" && (
          <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
            Menu item created successfully.
          </p>
        )}

        {params.error === "invalid" && (
          <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            Please fill all required fields correctly.
          </p>
        )}

        <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <form
            action={createMenuItem}
            className="h-fit rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]"
          >
            <h2 className="text-2xl font-black text-[#005340]">
              Create Menu Item
            </h2>

            <div className="mt-5 space-y-4">
              {[
                ["Name", "name", "text"],
                ["Price", "price", "number"]
              ].map(([label, name, type]) => (
                <div key={name}>
                  <label className="text-sm font-bold text-[#10251F]/75">
                    {label}
                  </label>
                  <input
                    name={name}
                    type={type}
                    min={name === "price" ? "1" : undefined}
                    step={name === "price" ? "1" : undefined}
                    className="mt-2 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-bold text-[#10251F]/75">
                  Description
                </label>
                <textarea
                  name="description"
                  className="mt-2 min-h-24 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#10251F]/75">
                  Category
                </label>
                <select
                  name="categoryId"
                  className="mt-2 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 font-bold text-[#10251F]/75">
                <input name="isVeg" type="checkbox" defaultChecked />
                Veg item
              </label>

              <label className="flex items-center gap-3 font-bold text-[#10251F]/75">
                <input name="isFeatured" type="checkbox" />
                Featured on homepage
              </label>

              <button className="w-full rounded-2xl bg-[#005340] px-6 py-4 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
                Add Item
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
            <h2 className="text-2xl font-black text-[#005340]">
              Current Menu Items
            </h2>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#005340]/10 text-[#10251F]/55">
                    <th className="py-3">Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Availability</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#005340]/5 align-top"
                    >
                      <td className="py-4">
                        <p className="font-black text-[#10251F]">
                          {item.name}
                        </p>
                        <p className="mt-1 max-w-sm text-[#10251F]/60">
                          {item.description}
                        </p>
                      </td>
                      <td>{item.category.name}</td>
                      <td className="font-black text-[#005340]">
                        ₹{item.price}
                      </td>
                      <td>{item.isVeg ? "Veg" : "Non-Veg"}</td>
                      <td>{item.isAvailable ? "Available" : "Hidden"}</td>
                      <td>
                        <form action={updateMenuAvailability}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            type="hidden"
                            name="nextAvailability"
                            value={String(!item.isAvailable)}
                          />
                          <button className="rounded-xl bg-[#005340] px-4 py-2 font-bold text-[#F4EEDA] transition hover:bg-[#042c23]">
                            {item.isAvailable ? "Hide" : "Show"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}