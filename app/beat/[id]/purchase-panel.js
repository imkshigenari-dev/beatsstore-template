"use client";

import { useState } from "react";
import { PLANS, CUSTOM_ORDER_PRICE_JPY } from "../../../lib/beats";

const SELLER_EMAIL = "beatsbywino@gmail.com";

export default function BeatPurchasePanel({ beat }) {
  const [planId, setPlanId] = useState(beat.exclusiveSold ? "rental" : "rental");
  const [buyerName, setBuyerName] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [connectMethod, setConnectMethod] = useState("text");
  const [contactHandle, setContactHandle] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [wantsSession, setWantsSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPrice = PLANS[planId].priceJPY + (isCustom ? CUSTOM_ORDER_PRICE_JPY : 0);

  async function handleCheckout() {
    if (planId === "exclusive" && beat.exclusiveSold) {
      setError("このビートの独占購入権はすでに販売済みです。");
      return;
    }
    if (!buyerName.trim()) {
      setError("購入者名を入力してください");
      return;
    }
    if (isCustom) {
      if (connectMethod === "text" && !customRequest.trim()) {
        setError("カスタムオーダーの内容を入力してください");
        return;
      }
      if (connectMethod !== "text" && !contactHandle.trim()) {
        setError("連絡先のユーザー名を入力してください");
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beatId: beat.id,
          planId,
          buyerName,
          isCustom,
          connectMethod,
          contactHandle: contactHandle.trim(),
          customRequest: customRequest.trim(),
          wantsSession,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "決済ページの作成に失敗しました");
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="plans">
        {Object.values(PLANS).map((plan) => {
          const sold = plan.id === "exclusive" && beat.exclusiveSold;
          return (
            <button
              key={plan.id}
              className={`plan-card ${planId === plan.id ? "plan-card--selected" : ""}`}
              onClick={() => !sold && setPlanId(plan.id)}
              type="button"
              disabled={sold}
              aria-disabled={sold}
            >
              <div className="plan-card__label">
                {plan.label}{sold ? " / SOLD OUT" : ""}
              </div>
              <div className="plan-card__price">
                {sold ? "SOLD OUT" : `¥${plan.priceJPY.toLocaleString("ja-JP")}`}
              </div>
              <div className="plan-card__desc">{plan.description}</div>
              <ul className="plan-card__deliverables">
                {plan.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {beat.exclusiveSold && (
        <div className="custom-order-box custom-order-box--active">
          <div className="custom-order-box__tag">EXCLUSIVE SOLD</div>
          <p style={{ margin: "10px 0 14px" }}>
            このビートの独占購入は終了しました。
            もしこのビートの雰囲気・質感に近い、新しいビートをご希望でしたら制作依頼を受け付けています。
          </p>
          <a
            className="buy-button"
            href={`mailto:${SELLER_EMAIL}?subject=${encodeURIComponent(`「${beat.title}」に近いビートの制作依頼`)}&body=${encodeURIComponent(
              `「${beat.title}」の雰囲気に近い新しいビートを制作してほしいです。\n\n希望・参考: \n`
            )}`}
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            SIMILAR BEAT / CUSTOM REQUEST
          </a>
        </div>
      )}

      <div className={`custom-order-box ${isCustom ? "custom-order-box--active" : ""}`}>
        <label className="custom-order-box__toggle">
          <input
            type="checkbox"
            checked={isCustom}
            onChange={(e) => setIsCustom(e.target.checked)}
          />
          <span className="custom-order-box__tag">CUSTOM ORDER</span>
          <span className="custom-order-box__price">
            +¥{CUSTOM_ORDER_PRICE_JPY.toLocaleString("ja-JP")}
          </span>
        </label>

        {isCustom && (
          <div className="custom-order-box__body">
            <div className="field">
              <label>連絡方法</label>
              <div className="connect-options">
                <label className="connect-option">
                  <input type="radio" name="connectMethod" checked={connectMethod === "text"} onChange={() => setConnectMethod("text")} />
                  こちらに詳細を記入する
                </label>
                <label className="connect-option">
                  <input type="radio" name="connectMethod" checked={connectMethod === "instagram"} onChange={() => setConnectMethod("instagram")} />
                  Instagramで直接連絡したい
                </label>
                <label className="connect-option">
                  <input type="radio" name="connectMethod" checked={connectMethod === "discord"} onChange={() => setConnectMethod("discord")} />
                  Discordで直接連絡したい
                </label>
              </div>
            </div>

            {connectMethod !== "text" && (
              <div className="field">
                <label>{connectMethod === "instagram" ? "Instagramのユーザー名(必須)" : "Discordのユーザー名(必須)"}</label>
                <input
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder={connectMethod === "instagram" ? "@your_id" : "username#0000"}
                />
              </div>
            )}

            <div className="field">
              <label>
                カスタム内容のリクエスト{connectMethod === "text" ? "(必須)" : "(任意・簡単な要望だけでもOK)"}
              </label>
              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="例: テンポを上げてほしい、イントロを短くしてほしい、など"
                rows={4}
                className="textarea"
              />
            </div>

            <label className="connect-option">
              <input type="checkbox" checked={wantsSession} onChange={(e) => setWantsSession(e.target.checked)} />
              オンラインセッション希望(制作者と通話しながら調整したい)
            </label>
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="buyerName">契約書に記載する購入者名(必須)</label>
        <input id="buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="アーティスト名 / 本名" required />
      </div>

      <button className="buy-button" onClick={handleCheckout} disabled={loading}>
        {loading ? "決済ページを準備中…" : `¥${totalPrice.toLocaleString("ja-JP")}で購入する`}
      </button>

      {error && <p style={{ color: "#b6231f", fontSize: 13 }}>{error}</p>}

      <div className="rec-note">
        <span className="rec-note__dot" />
        決済完了後、自動で契約書とファイルをメールに送信します
      </div>
    </>
  );
}
