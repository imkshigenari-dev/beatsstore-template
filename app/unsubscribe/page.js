import { unsubscribeEmail } from "../../lib/subscribers";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }) {
  const email = searchParams?.email;
  if (email) await unsubscribeEmail(email);

  return (
    <div className="success">
      <a href="/" className="beat-page__back">← WINO BEATS</a>
      <h1>配信停止しました</h1>
      <p>WINO BEATSからのマーケティングメールを停止しました。</p>
    </div>
  );
}
