import type { Metadata } from "next";
import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "The Big Star Cafe | Dynamic Cafe Ordering Website",
  description:
    "A dynamic cafe website with menu browsing, QR table ordering, and admin order management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
