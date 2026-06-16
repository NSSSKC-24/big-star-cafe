"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CallWaiterButton from "@/components/CallWaiterButton";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  menuItems: MenuItem[];
};

type CartItem = MenuItem & { quantity: number };

type OrderClientProps = {
  categories: Category[];
  initialTable: string;
};

export default function OrderClient({
  categories,
  initialTable
}: OrderClientProps) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [tableNumber] = useState(initialTable);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");
  const [latestOrderId, setLatestOrderId] = useState("");
  const [latestTableNumber, setLatestTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cartItems = Object.values(cart);

  useEffect(() => {
    const savedOrderId = localStorage.getItem("latestOrderId") ?? "";
    const savedTableNumber = localStorage.getItem("latestTableNumber") ?? "";

    setLatestOrderId(savedOrderId);
    setLatestTableNumber(savedTableNumber);
  }, []);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  function addItem(item: MenuItem) {
    setSuccessOrderId("");

    setCart((current) => ({
      ...current,
      [item.id]: {
        ...item,
        quantity: (current[item.id]?.quantity ?? 0) + 1
      }
    }));
  }

  function decreaseItem(itemId: string) {
    setCart((current) => {
      const existing = current[itemId];

      if (!existing) return current;

      if (existing.quantity === 1) {
        const updated = { ...current };
        delete updated[itemId];
        return updated;
      }

      return {
        ...current,
        [itemId]: {
          ...existing,
          quantity: existing.quantity - 1
        }
      };
    });
  }

  async function submitOrder() {
    setErrorMessage("");
    setSuccessOrderId("");

    if (!tableNumber.trim()) {
      setErrorMessage("Table number is missing. Please scan the table QR again.");
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Add at least one item before placing the order.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tableNumber,
        customerName,
        customerPhone,
        notes,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.error ?? "Unable to place order.");
      return;
    }

    localStorage.setItem("latestOrderId", data.orderId);
    localStorage.setItem("latestTableNumber", tableNumber);

    setLatestOrderId(data.orderId);
    setLatestTableNumber(tableNumber);

    setCart({});
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setSuccessOrderId(data.orderId);
  }

  return (
    <main className="bg-[#F4EEDA]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_390px]">
        <section>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b4a3a]/95 via-[#0a5a46]/90 to-[#08362b]/95 p-8 text-white shadow-[0_30px_100px_rgba(0,83,64,0.35)]">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4EEDA]">
              QR Table Ordering
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Order for Table {tableNumber || "—"}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-white/80">
              Your table number is detected from the QR code. Browse the live
              cafe menu and place your order directly.
            </p>
          </div>

          {latestOrderId && (
            <section className="mt-6 rounded-[2rem] border border-[#005340]/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,83,64,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C8A85A]">
                    Already ordered?
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#005340]">
                    Check your latest order status
                  </h2>

                  <p className="mt-2 text-sm text-[#10251F]/65">
                    Latest saved order
                    {latestTableNumber ? ` for Table ${latestTableNumber}` : ""}.
                  </p>
                </div>

                <Link
                  href={`/status/${latestOrderId}`}
                  className="rounded-full bg-[#005340] px-5 py-3 text-sm font-black text-[#F4EEDA] transition hover:bg-[#042c23]"
                >
                  Check Status
                </Link>
              </div>
            </section>
          )}

          <div className="mt-8 space-y-10">
            {categories.map((category) => (
              <section key={category.id}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#005340]">
                    {category.name}
                  </h2>

                  <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#005340] shadow-sm">
                    {category.menuItems.length} items
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {category.menuItems.map((item) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-3xl border border-[#005340]/10 bg-white shadow-[0_18px_60px_rgba(0,83,64,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,83,64,0.16)]"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-[#F4EEDA]">
                        {item.videoUrl ? (
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={item.imageUrl ?? undefined}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          >
                            <source src={item.videoUrl} type="video/mp4" />
                          </video>
                        ) : item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-bold text-[#005340]/60">
                            No media available
                          </div>
                        )}

                        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#005340] shadow-sm backdrop-blur">
                          {category.name}
                        </div>

                        <span
                          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black shadow-sm backdrop-blur ${
                            item.isVeg
                              ? "bg-green-100/95 text-green-700"
                              : "bg-red-100/95 text-red-700"
                          }`}
                        >
                          {item.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-black text-[#10251F]">
                          {item.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#10251F]/65">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <p className="text-xl font-black text-[#005340]">
                            ₹{item.price}
                          </p>

                          <button
                            onClick={() => addItem(item)}
                            className="rounded-full bg-[#005340] px-5 py-2 text-sm font-black text-[#F4EEDA] transition hover:bg-[#042c23]"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-[#005340]/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,83,64,0.12)] lg:sticky lg:top-24">
          <h2 className="text-2xl font-black text-[#005340]">Your Order</h2>

          <div className="mt-5 grid gap-3">
            <label className="text-sm font-bold text-[#10251F]/75">
              Table Number
            </label>

            <input
              value={`Table ${tableNumber}`}
              readOnly
              className="cursor-not-allowed rounded-2xl border border-[#005340]/15 bg-[#F4EEDA] px-4 py-3 font-black text-[#005340] outline-none"
            />

            {tableNumber && <CallWaiterButton tableNumber={tableNumber} />}

            <label className="mt-2 text-sm font-bold text-[#10251F]/75">
              Name
            </label>

            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Optional"
              className="rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition placeholder:text-[#10251F]/40 focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
            />

            <label className="mt-2 text-sm font-bold text-[#10251F]/75">
              Phone
            </label>

            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Optional"
              className="rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition placeholder:text-[#10251F]/40 focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
            />
          </div>

          <div className="mt-6 space-y-3">
            {cartItems.length === 0 && (
              <p className="rounded-2xl bg-[#F4EEDA] p-4 text-sm text-[#10251F]/65">
                Cart is empty. Add items from the menu.
              </p>
            )}

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-[#F4EEDA] p-3"
              >
                <div>
                  <p className="font-bold text-[#10251F]">{item.name}</p>

                  <p className="text-sm text-[#10251F]/60">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseItem(item.id)}
                    className="h-8 w-8 rounded-full bg-white font-black text-[#005340] shadow-sm"
                  >
                    −
                  </button>

                  <button
                    onClick={() => addItem(item)}
                    className="h-8 w-8 rounded-full bg-white font-black text-[#005340] shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="mt-5 block text-sm font-bold text-[#10251F]/75">
            Order Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Less spicy, no onion, extra sugar..."
            className="mt-2 min-h-24 w-full rounded-2xl border border-[#005340]/15 bg-[#FFFDF7] px-4 py-3 outline-none transition placeholder:text-[#10251F]/40 focus:border-[#005340] focus:ring-4 focus:ring-[#005340]/10"
          />

          <div className="mt-5 flex items-center justify-between border-t border-[#005340]/10 pt-5">
            <p className="text-lg font-black text-[#10251F]">Total</p>

            <p className="text-2xl font-black text-[#005340]">
              ₹{totalAmount}
            </p>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {successOrderId && (
            <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              <p>Order placed successfully.</p>

              <Link
                href={`/status/${successOrderId}`}
                className="mt-3 inline-flex rounded-full bg-[#005340] px-4 py-2 text-xs font-black text-[#F4EEDA] transition hover:bg-[#042c23]"
              >
                Check Order Status
              </Link>
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={isSubmitting}
            className="mt-5 w-full rounded-2xl bg-[#005340] px-6 py-4 font-black text-[#F4EEDA] transition hover:bg-[#042c23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </main>
  );
}