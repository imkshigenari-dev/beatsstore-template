"use client";

import { useEffect, useState } from "react";

export default function StripeConnectStatus() {
  const [status, setStatus] = useState(null);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("stripe_connect_account_id");
    if (!saved) { setStatus({ connected: false }); return; }
    setAccountId(saved);
    fetch("/api/stripe/connect/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: saved }),
    })
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ connected: false }));
  }, []);

  if (!status) return <span style={{ fontSize: 12 }}>Stripe確認中...</span>;
  if (status.chargesEnabled && status.payoutsEnabled) return <span style={{ fontSize: 12 }}>Stripe連携済み ✓</span>;
  if (status.detailsSubmitted) return <span style={{ fontSize: 12 }}>Stripe審査・設定中</span>;
  return <span style={{ fontSize: 12 }}>Stripe未連携</span>;
}
