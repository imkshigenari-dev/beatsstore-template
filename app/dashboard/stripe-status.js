"use client";

import { useEffect, useState } from "react";
import StripeConnectButton from "./stripe-connect-button";

export default function StripeStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/stripe/connect/status", { method: "POST" })
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  if (!status) return <div style={{ fontSize: 12, opacity: .55 }}>Stripe接続状況を確認中…</div>;

  const ready = status.connected && status.detailsSubmitted && status.chargesEnabled && status.payoutsEnabled;
  return (
    <div style={{ padding: 18, border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .55, margin: "0 0 6px" }}>PAYMENTS / STRIPE</p>
          <strong>{ready ? "Stripe 接続済み・販売可能" : status.connected ? "Stripe 接続済み・設定を完了してください" : "Stripe 未接続"}</strong>
          {status.connected && <p style={{ fontSize: 10, opacity: .45, margin: "6px 0 0", fontFamily: "IBM Plex Mono" }}>{status.accountId}</p>}
        </div>
        {!ready && <StripeConnectButton />}
      </div>
      {status.connected && (
        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, opacity: .7, fontFamily: "IBM Plex Mono", flexWrap: "wrap" }}>
          <span>本人確認: {status.detailsSubmitted ? "OK" : "未完了"}</span>
          <span>決済: {status.chargesEnabled ? "有効" : "未有効"}</span>
          <span>振込: {status.payoutsEnabled ? "有効" : "未有効"}</span>
        </div>
      )}
      {!status.connected && <p style={{ fontSize: 11, opacity: .55, margin: "10px 0 0" }}>Stripeの秘密鍵を共有する必要はありません。Stripe側の画面で事業者情報を登録します。</p>}
    </div>
  );
}
