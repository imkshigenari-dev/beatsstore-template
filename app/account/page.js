import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer, getCustomerOrderIds } from "../../lib/customer-auth";
import { getOrder } from "../../lib/orders";
import { licenseBodyText } from "../../lib/email";
import { PLANS } from "../../lib/beats";
import ProfileForm from "./profile-form";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");

  const ids = await getCustomerOrderIds(customer.email);
  const orders = (await Promise.all(ids.map((id) => getOrder(id)))).filter((order) => order?.status === "paid").reverse();

  return (
    <main className="account-page">
      <div className="dashboard-top">
        <div>
          <p>WINO® / CUSTOMER AREA</p>
          <h1>MY ACCOUNT</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/" className="admin-track__delete" style={{ textDecoration: "none" }}>BEATS</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card__label">ACCOUNT</div>
          <div className="admin-card__value" style={{ fontSize: 18, wordBreak: "break-word" }}>{customer.email}</div>
          <p style={{ color: "#666", fontSize: 10, lineHeight: 1.7 }}>購入履歴とライセンス情報はこのアカウントに紐づきます。</p>
        </section>
        <section className="admin-card">
          <div className="admin-card__label">PURCHASES</div>
          <div className="admin-card__value">{String(orders.length).padStart(2, "0")}</div>
        </section>
      </div>

      <section className="admin-card" style={{ marginTop: 10 }}>
        <div className="admin-card__label">PROFILE / CONTRACT INFORMATION</div>
        <ProfileForm customer={customer} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="section-head"><h2>PURCHASE HISTORY</h2><div className="section-head__meta">{String(orders.length).padStart(2, "0")} ORDERS</div></div>
        {orders.length === 0 ? (
          <p style={{ color: "#666", fontSize: 11, padding: "22px 0" }}>購入履歴はまだありません。ビートを購入するとここに追加されます。</p>
        ) : (
          <div className="tracklist">
            {orders.map((order) => (
              <div key={order.id} className="admin-track">
                <div className="track__index">PAID</div>
                <div>
                  <div className="track__title">{order.beatTitle}</div>
                  <div className="track__meta">{order.planId.toUpperCase()} · {order.purchasedAt} · {order.id}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/api/download/${order.id}`} className="admin-track__delete" style={{ textDecoration: "none", color: "#95a696" }}>DOWNLOAD {order.planId === "rental" ? "MP3" : "WAV"}</Link>
                    <Link href={`/beat/${order.beatId}`} className="admin-track__delete" style={{ textDecoration: "none" }}>VIEW BEAT</Link>
                    <details style={{ marginTop: 12, width: "100%" }}><summary className="admin-track__delete" style={{ cursor: "pointer", display: "inline-block" }}>VIEW LICENSE / CONTRACT</summary><div style={{ marginTop: 10, padding: 14, border: "1px solid #333", lineHeight: 1.8, fontSize: 11 }}><p><strong>契約書番号:</strong> {order.id}</p><p><strong>契約日:</strong> {order.purchasedAt}</p><p><strong>楽曲タイトル:</strong> {order.beatTitle}</p><p><strong>ライセンス:</strong> {PLANS[order.planId]?.label || order.planId}</p><p><strong>購入者:</strong> {order.buyerName || "(未入力)"} / {order.buyerEmail}</p><p><strong>WINO連絡先:</strong> beatsbywino@gmail.com</p>{order.planId === "rental" && <p><strong>収益分配:</strong> WINO 30% / 購入者 70%</p>}<p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{licenseBodyText(PLANS[order.planId])}</p><p style={{ marginTop: 12 }}>リリース時はスプリット契約が必要です。お問い合わせ: beatsbywino@gmail.com</p></div></details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
