import Link from "next/link";

const SELLER_EMAIL = "beatsbywino@gmail.com";

export default function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;

  return (
    <div className="success">
      <a href="/" className="beat-page__back">← 一覧に戻る</a>
      <h1>WINO BEATを選んでいただきありがとうございます</h1>
      <p>
        決済を確認しました。契約内容とダウンロードリンクをメールでお送りしています。契約内容は購入時のメール、またはマイページからいつでも確認できます。
        数分経ってもメールが届かない場合は、迷惑メールフォルダをご確認ください。
      </p>
      {sessionId && (
        <>
          <div className="success__box">ご注文番号: {sessionId}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            <a className="buy-button" href={`/api/download/${sessionId}`} style={{ display: "inline-block" }}>DOWNLOAD YOUR BEAT</a>
          </div>
        </>
      )}

      <div className="success__release">
        <div className="success__account-kicker">RELEASE / SPLIT CONTRACT</div>
        <h2>リリースが決まったら。</h2>
        <p>
          WINO BEATを使用した楽曲を公開・配信・販売する場合は、スプリット契約が必要です。
          リリースの際はこちらまでお問い合わせください。
        </p>
        <a
          className="buy-button"
          href={`mailto:${SELLER_EMAIL}?subject=${encodeURIComponent("WINO BEAT リリース / スプリット契約について")}`}
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          {SELLER_EMAIL}
        </a>
      </div>

      <div className="success__account">
        <div className="success__account-kicker">WINO / MY ACCOUNT</div>
        <h2>購入履歴を、いつでも確認。</h2>
        <p>購入時に使用したメールアドレスでアカウントを作成すると、購入履歴・ライセンス情報・ビートの再ダウンロードをまとめて管理できます。</p>
        <Link href="/account/register" className="buy-button" style={{ display: "inline-block", textDecoration: "none" }}>
          CREATE CUSTOMER ACCOUNT
        </Link>
      </div>
    </div>
  );
}
