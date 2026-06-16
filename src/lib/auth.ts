import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("bigstar_admin")?.value;
  return Boolean(token && token === process.env.ADMIN_SESSION_TOKEN);
}

export async function requireAdmin() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect("/admin/login");
}
