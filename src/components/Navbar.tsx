import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#005340]/10 bg-[#F4EEDA]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/brand/flogo.png"
            alt="Big Star Cafe Logo"
            width={148}
            height={48}
            // className="transparent-img"
            background-color="transparent"
          />  
          {/* <div>
            <p className="text-xl font-black tracking-wide text-[#005340]">
              BIG STAR
            </p>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#005340]/80">
              Handcrafted coffee, artisan bakes
            </p>
          </div> */}
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold text-[#005340]">
          <Link href="/menu">Menu</Link>
          <Link href="/order?table=1">QR Order</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}