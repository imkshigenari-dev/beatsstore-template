"use client";

import { useState } from "react";

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false);

  async function connectStripe() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Stripe連携に失敗しました");
      window.location.href = data.url;
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  }

  return (
    <button type="button" className="buy-button" onClick={connectStripe} disabled={loading}>
      {loading ? "Stripeへ接続中..." : "Stripeを連携する"}
    </button>
  );
}
