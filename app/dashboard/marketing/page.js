import { listActiveSubscribers } from "../../../lib/subscribers";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const subscribers = await listActiveSubscribers();

  return (
    <div className="dashboard-shell">
      <div className="dashboard-top">
        <div>
          <p>WINO / MARKETING</p>
          <h1>Audience</h1>
        </div>
      </div>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__label">Active Subscribers</div>
          <div className="admin-card__value">{subscribers.length}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Delivery</div>
          <div className="admin-card__value">Resend</div>
        </div>
      </div>
    </div>
  );
}
