"use client";

import { useState } from "react";

type CallWaiterButtonProps = {
  tableNumber: string;
};

export default function CallWaiterButton({ tableNumber }: CallWaiterButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [message, setMessage] = useState("");

  async function callWaiter() {
    setIsCalling(true);
    setMessage("");

    const response = await fetch("/api/waiter-calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tableNumber,
        message: `Table ${tableNumber} needs assistance.`
      })
    });

    const data = await response.json();
    setIsCalling(false);

    if (!response.ok) {
      setMessage(data.error ?? "Unable to call waiter.");
      return;
    }

    setMessage(data.message ?? "Waiter has been called.");
  }

  return (
    <div className="mt-4 rounded-2xl bg-[#F4EEDA] p-4">
      <p className="text-sm font-bold text-[#10251F]/70">
        Need help from staff?
      </p>

      <button
        onClick={callWaiter}
        disabled={isCalling}
        className="mt-3 w-full rounded-full bg-[#C8A85A] px-5 py-3 font-black text-[#10251F] transition hover:bg-[#b99a4d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCalling ? "Calling Waiter..." : "🔔 Call Waiter"}
      </button>

      {message && (
        <p className="mt-3 text-sm font-bold text-[#005340]">{message}</p>
      )}
    </div>
  );
}