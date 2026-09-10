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
      <LoginForm setupMode={setupMode} />
      {!setupMode && (
        <p style={{ marginTop: 22, fontFamily: "IBM Plex Mono", fontSize: 11, opacity: .6 }}>
          購入者用アカウントはこちら → <Link href="/account/login">CUSTOMER LOGIN</Link>
        </p>
      )}
      <div className="owner-login__note"><span /> Producer access · store owner only</div>
    </main>
  );
}
