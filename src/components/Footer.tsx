export default function Footer() {
  return (
    <footer className="bg-[#042c23] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          
          <div>
            <h3 className="text-2xl font-black">
              BIG STAR CAFE
            </h3>

            <p className="mt-4 text-sm text-white/70 leading-7">
              Handcrafted coffee, artisan bakes,
              comfort food, and premium café
              experiences in Financial District,
              Hyderabad.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2 text-white/70">
              <li>Home</li>
              <li>Menu</li>
              <li>QR Ordering</li>
              <li>Featured Items</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">
              Contact
            </h4>

            <ul className="space-y-3 text-white/70">
              <li>📍 Financial District, Hyderabad</li>
              <li>📞 +91 90329 66682</li>
              <li>✉ hello@bigstarcafe.com</li>
              <li>🕒 9:00 AM - 11:30 PM</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">
              Follow Us
            </h4>

            <ul className="space-y-2 text-white/70">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>Google Maps</li>
              <li>WhatsApp</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/60">
          © 2026 Big Star Cafe. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}