import { db } from "@/lib/db";
import MenuCard from "@/components/MenuCard";

export default async function MenuPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category ?? "all";

  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" }
  });

  const items = await db.menuItem.findMany({
    where: {
      isAvailable: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {}),
      ...(category !== "all"
        ? {
            category: {
              slug: category
            }
          }
        : {})
    },
    include: {
      category: true
    },
    orderBy: [
      {
        category: {
          displayOrder: "asc"
        }
      },
      {
        name: "asc"
      }
    ]
  });

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto max-w-7xl px-5 py-12">
        {/* HERO SECTION */}

        <section
          className="
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-br
            from-[#0b4a3a]/95
            via-[#0a5a46]/90
            to-[#08362b]/95
            backdrop-blur-xl
            p-8
            text-white
            shadow-[0_30px_100px_rgba(0,83,64,0.35)]
            md:p-12
          "
        >
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
            Live Menu
          </p>

          <h1 className="mt-3 max-w-5xl text-4xl font-black leading-tight text-white md:text-6xl">
            Search, filter, and order from the cafe menu.
          </h1>

          <p className="mt-5 max-w-3xl leading-8 text-white/80">
            Browse handcrafted coffee, burgers, pizzas, pasta, desserts,
            milkshakes, bakery items, and signature Big Star specials.
          </p>
        </section>

        {/* FILTERS */}

        <form className="mt-8 grid gap-4 rounded-3xl border border-[#005340]/10 bg-white/90 p-5 shadow-[0_18px_60px_rgba(0,83,64,0.08)] backdrop-blur md:grid-cols-[1fr_260px_auto]">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search coffee, burger, pasta..."
            className="rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 text-[#10251F] outline-none transition placeholder:text-[#10251F]/45 focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
          />

          <select
            name="category"
            defaultValue={category}
            className="rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 text-[#10251F] outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
          >
            <option value="all">All categories</option>

            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-[#005340] px-6 py-3 font-black text-[#F4EEDA] transition duration-300 hover:bg-[#042c23]"
          >
            Apply Filter
          </button>
        </form>

        {/* MENU GRID */}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* EMPTY STATE */}

        {items.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-[0_24px_80px_rgba(0,83,64,0.10)]">
            <h2 className="text-2xl font-black text-[#005340]">
              No items found
            </h2>

            <p className="mt-2 text-[#10251F]/65">
              Try another search term or category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}