import { db } from "@/lib/db";
import OrderClient from "./OrderClient";

export default async function OrderPage({
  searchParams
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const params = await searchParams;
  const table = params.table ?? "1";

  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: "asc" }
      }
    }
  });

  return <OrderClient categories={JSON.parse(JSON.stringify(categories))} initialTable={table} />;
}
