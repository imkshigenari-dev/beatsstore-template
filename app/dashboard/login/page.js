import Link from "next/link";
import LoginForm from "./login-form";

export default async function DashboardLoginPage({ searchParams }) {
  const params = await searchParams;
  const setupMode = params?.setup === "1";

  return (
    <main className="owner-login">
      <div className="owner-login__eyebrow">BEAT STORE / PRODUCER AREA</div>
      <h1>{setupMode ? <>CREATE<br /><span>STORE</span></> : <>PRODUCER<br /><span>LOGIN</span></>}</h1>
      <p>{setupMode ? "あなた専用のビート販売ストア管理アカウントを作成します。" : "ビート販売ストアの管理画面です。販売者専用です。"}</p>

      <div style={{ margin: "18px 0 24px", padding: "12px 14px", border: "1px solid #333", fontFamily: "IBM Plex Mono", fontSize: 10, lineHeight: 1.7, letterSpacing: ".04em" }}>
        <div style={{ opacity: .55 }}>TEST PROGRAM</div>
        <div style={{ marginTop: 2 }}>5 STORES · SETUP FEE ¥0 · PLATFORM FEE 0%</div>
      </div>

      <LoginForm setupMode={setupMode} />

      {!setupMode && (
        <div style={{ marginTop: 20 }}>
          <Link href="/dashboard/login?setup=1" className="buy-button" style={{ display: "block", width: "100%", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
            CREATE STORE ACCOUNT
          </Link>
          <p style={{ marginTop: 9, fontFamily: "IBM Plex Mono", fontSize: 9, opacity: .45, lineHeight: 1.6 }}>
            テスト導入用の招待リンクからアカウントを作成できます。
          </p>
        </div>
      )}

      {setupMode && (
        <p style={{ marginTop: 14, fontFamily: "IBM Plex Mono", fontSize: 9, opacity: .45, lineHeight: 1.6 }}>
          テスト導入：招待リンクで認証された場合のみアカウントを作成できます。
        </p>
      )}

      {!setupMode && (
        <p style={{ marginTop: 20, fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .55 }}>
          購入者用アカウントはこちら → <Link href="/account/login">CUSTOMER LOGIN</Link>
        </p>
      )}
      <div className="owner-login__note"><span /> Producer access · store owner only</div>
    </main>
  );
}
