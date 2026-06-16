import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import MenuCard from "@/components/MenuCard";

function HeroMotionGraphic() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/hero/Bg.png"
        alt=""
        fill
        priority
        className="hero-bg-motion"
      />

      <Image
        src="/hero/coffee-cup.png"
        alt=""
        width={1200}
        height={1200}
        priority
        className="hero-cup-motion"
      />

      <Image src="/hero/coffee-beans.png" alt="" width={70} height={70} className="hero-bean bean-one" />
      <Image src="/hero/coffee-beans.png" alt="" width={58} height={58} className="hero-bean bean-two" />
      <Image src="/hero/coffee-beans.png" alt="" width={62} height={62} className="hero-bean bean-three" />
      <Image src="/hero/coffee-beans.png" alt="" width={54} height={54} className="hero-bean bean-four" />
      <Image src="/hero/coffee-beans.png" alt="" width={64} height={64} className="hero-bean bean-five" />
      <Image src="/hero/coffee-beans.png" alt="" width={54} height={54} className="hero-bean bean-six" />

      <Image src="/hero/leaf_group.png" alt="" width={530} height={550} className="hero-leaf leaf-one" />
      <Image src="/hero/bottom_leaf.png" alt="" width={710} height={730} className="hero-leaf leaf-two" />
      <Image src="/hero/Leaves.png" alt="" width={590} height={520} className="hero-single-leaf leaf-three" />
      <Image src="/hero/bottom_leaf.png" alt="" width={510} height={530} className="hero-single-leaf leaf-four" />
    </div>
  );
}

export default async function HomePage() {
  const cafe = await db.cafe.findUnique({
    where: { slug: "the-big-star-cafe" },
  });

  const featuredItems = await db.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  const [menuCount, orderCount] = await Promise.all([
    db.menuItem.count({ where: { isAvailable: true } }),
    db.order.count(),
  ]);

  return (
    <main className="bg-[#F4EEDA] text-[#10251F]">
      <section className="relative overflow-hidden border-b border-[#005340]/10 text-white bg-[#003F31]">
        <HeroMotionGraphic />

        <div className="relative z-20 mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="relative z-30">
            <p className="mb-5 inline-flex rounded-full bg-[#F4EEDA]/15 px-5 py-2 text-sm font-black text-[#F4EEDA] ring-1 ring-[#F4EEDA]/20 backdrop-blur-sm">
              Dynamic QR Ordering Demo • Hyderabad
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-[#FFFDF7] drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)] md:text-7xl">
              {cafe?.heroTitle ??
                "Fresh coffee, artisan bakes, quick table ordering."}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#F4EEDA]/90">
              {cafe?.heroSubtitle ??
                "A branded digital cafe platform for menu browsing, QR table ordering, and order management."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/order?table=1"
                className="rounded-full bg-[#F4EEDA] px-7 py-4 font-black text-[#005340] transition hover:scale-105 hover:bg-white"
              >
                Start Table Order
              </Link>

              <Link
                href="/menu"
                className="rounded-full border border-[#F4EEDA]/45 px-7 py-4 font-black text-[#F4EEDA] transition hover:bg-[#F4EEDA] hover:text-[#005340]"
              >
                View Menu
              </Link>
            </div>
          </div>

          <div className="relative z-40 rounded-[2rem] bg-white/8 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-md">
            <div className="rounded-[1.5rem] bg-[#FFF8EA] p-6 text-[#10251F] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005340]">
                Cafe Snapshot
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#005340]">
                {cafe?.name ?? "The Big Star Cafe"}
              </h2>

              <p className="mt-3 leading-7 text-[#10251F]/75">
                {cafe?.description ??
                  "A modern Hyderabad cafe experience with handcrafted coffee, artisan bakes, quick bites, desserts, and QR table ordering."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#F4EEDA] p-4">
                  <p className="text-3xl font-black text-[#005340]">
                    {menuCount}
                  </p>
                  <p className="text-sm font-bold text-[#10251F]/65">
                    Active menu items
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F4EEDA] p-4">
                  <p className="text-3xl font-black text-[#005340]">
                    {orderCount}
                  </p>
                  <p className="text-sm font-bold text-[#10251F]/65">
                    Orders in system
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#005340]/15 bg-white/40 p-4 text-sm leading-6 text-[#10251F]/75">
                <p>
                  <strong>Address:</strong>{" "}
                  {cafe?.address ?? "Financial District, Hyderabad, Telangana"}
                </p>
                <p>
                  <strong>Hours:</strong>{" "}
                  {cafe?.openingHours ?? "Mon - Sun, 9:00 AM - 11:00 PM"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {cafe?.phone ?? "+91 90000 00000"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C8A85A]">
              Featured Menu
            </p>

            <h2 className="mt-2 text-4xl font-black text-[#005340]">
              Best picks for today
            </h2>
          </div>

          <Link
            href="/menu"
            className="font-black text-[#005340] hover:text-[#003f31]"
          >
            Explore all →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}