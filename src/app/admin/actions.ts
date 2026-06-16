"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("bigstar_admin", process.env.ADMIN_SESSION_TOKEN ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("bigstar_admin");
  redirect("/admin/login");
}

export async function createMenuItem(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const price = Number(formData.get("price"));
  const isVeg = formData.get("isVeg") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  if (!name || !description || !categoryId || !Number.isFinite(price) || price <= 0) {
    redirect("/admin/menu?error=invalid");
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now()}`;

  await db.menuItem.create({
    data: {
      name,
      slug,
      description,
      price,
      isVeg,
      isFeatured,
      categoryId
    }
  });

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/order");
  redirect("/admin/menu?success=created");
}

export async function updateMenuAvailability(formData: FormData) {
  await requireAdmin();
  const itemId = String(formData.get("itemId") ?? "");
  const nextAvailability = String(formData.get("nextAvailability")) === "true";

  await db.menuItem.update({
    where: { id: itemId },
    data: { isAvailable: nextAvailability }
  });

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/order");
  revalidatePath("/admin/menu");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "PENDING") as
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  await db.order.update({
    where: { id: orderId },
    data: { status }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

export async function resolveWaiterCall(formData: FormData) {
  await requireAdmin();

  const waiterCallId = String(formData.get("waiterCallId") ?? "");

  if (!waiterCallId) return;

  await db.waiterCall.update({
    where: { id: waiterCallId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date()
    }
  });

  revalidatePath("/admin/kitchen");
  revalidatePath("/admin");
}