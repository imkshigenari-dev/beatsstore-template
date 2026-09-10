import LoginForm from "./login-form";

export default async function DashboardLoginPage({ searchParams }) {
  const params = await searchParams;
  const setupMode = params?.setup === "1";

  return (
    <main className="owner-login">
      <div className="owner-login__eyebrow">BEAT STORE / PRIVATE AREA</div>
      <h1>{setupMode ? <>CREATE<br /><span>ACCOUNT</span></> : <>STORE<br /><span>LOGIN</span></>}</h1>
      <p>{setupMode ? "あなた専用の管理画面を作成します。" : "メールアドレスとパスワードでログインしてください。"}</p>
      <LoginForm setupMode={setupMode} />
      <div className="owner-login__note"><span /> Secure customer access</div>
    </main>
  );
}
