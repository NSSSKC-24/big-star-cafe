import { loginAdmin } from "../actions";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-xl items-center px-5 py-12">
        <section className="w-full rounded-[2rem] border border-[#005340]/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,83,64,0.12)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C8A85A]">
            Admin Login
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#005340]">
            Cafe Control Panel
          </h1>

          <p className="mt-3 leading-7 text-[#10251F]/65">
            Demo credentials are stored in your .env file. Change them before
            deployment.
          </p>

          {params.error === "invalid" && (
            <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
              Invalid email or password.
            </p>
          )}

          <form action={loginAdmin} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-[#10251F]/75">
                Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue="admin@bigstarcafe.local"
                className="mt-2 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#10251F]/75">
                Password
              </label>
              <input
                name="password"
                type="password"
                defaultValue="admin123"
                className="mt-2 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
              />
            </div>

            <button className="w-full rounded-2xl bg-[#005340] px-6 py-4 font-black text-[#F4EEDA] transition hover:bg-[#042c23]">
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}