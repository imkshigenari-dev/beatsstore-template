import { Resend } from "resend";

function getResend() {\n  const key = process.env.RESEND_API_KEY;\n  if (!key) throw new Error("RESEND_API_KEY is not configured");\n  return new Resend(key);\n}
const SELLER_EMAIL = "beatsbywino@gmail.com";

export function licenseBodyText(plan) {
  if (plan.id === "exclusive") {
    return [
      "1. 甲(制作者)は、本契約に定める楽曲(以下「本ビート」)を使用して、完成楽曲を商業的に利用するための独占的かつ譲渡不能の利用権を、本契約締結および代金完済をもって乙(購入者)に譲渡する。",
      "2. 譲渡後、甲は本ビートの新規販売を行わない。ただし、本契約締結時点で既にリース契約(レンタルビーツ/プレミアムリース)を締結している第三者は、当該契約の範囲内で本ビートの利用を継続できる。",
      "3. 乙は本ビートを商用・非商用を問わず自由に利用できる。",
      "4. 甲の著作者人格権は行使しない旨を甲は合意する。",
      "5. 乙は本ビート単体（トラックの再販売・転売）を行うことはできない。",
      "6. 納品物: WAV(24bit)。",
      "7. 乙は、本契約で明示的に許諾された範囲を超えて、本ビートを利用してはならない。また、甲の許可なく、本ビートをAI学習用データ、音源素材、ループ素材その他の第三者向け素材として利用・提供してはならない。",
      "8. 乙は、本ビートを使用した楽曲についてYouTube Content ID等の著作権管理システムへの登録を行うことができる。",
      "9. 乙が本契約に違反した場合、甲は乙に対し、当該利用の停止、公開・配信の停止、データの削除その他必要な措置を求めることができる。また、甲に損害が生じた場合、甲は乙に対してその損害の賠償を請求することができる。",
    ].join("\n");
  }

  if (plan.id === "premium") {
    return [
      "1. 甲(制作者)は、乙(購入者)に対し本ビートの非独占的利用を許諾する。",
      "2. 著作権は甲に留保され、甲は本ビートを他の顧客にも販売できる。",
      "3. 乙は本ビートを商用・非商用を問わず自由に利用でき、本ビートを用いた楽曲から発生する収益は分配せず乙が独占できる。",
      "4. 乙は本ビート単体（トラックの再販売・転売）を行うことはできない。",
      "5. 納品物: WAV(24bit)。",
      "6. 乙は、完成楽曲を公開・配信・販売する際、クレジットを表示するものとする。Prod. WINO",
      "7. 乙は、本契約で明示的に許諾された範囲を超えて、本ビートを利用してはならない。また、甲の許可なく、本ビートをAI学習用データ、音源素材、ループ素材その他の第三者向け素材として利用・提供してはならない。",
      "8. 乙は、本ビートを使用した楽曲についてYouTube Content ID等の著作権管理システムへの登録を行ってはならない。",
      "9. 乙が本契約に違反した場合、甲は乙に対し、当該利用の停止、公開・配信の停止、データの削除その他必要な措置を求めることができる。また、甲に損害が生じた場合、甲は乙に対してその損害の賠償を請求することができる。",
    ].join("\n");
  }

  return [
    "1. 甲(制作者)は、乙(購入者)に対し本ビートの非独占的利用を許諾する。",
    "2. 著作権は甲に留保され、甲は本ビートを他の顧客にも販売できる。",
    "3. 乙は本ビートを商用・非商用を問わず自由に利用できる。",
    "4. 乙は本ビート単体（トラックの再販売・転売）を行うことはできない。",
    "5. 納品物: MP3ファイル。",
    "6. 乙は、完成楽曲を公開・配信・販売する際、クレジットを表示するものとする。Prod. WINO",
    "7. 乙は、本契約で明示的に許諾された範囲を超えて、本ビートを利用してはならない。また、甲の許可なく、本ビートをAI学習用データ、音源素材、ループ素材その他の第三者向け素材として利用・提供してはならない。",
    "8. 乙は、本ビートを使用した楽曲についてYouTube Content ID等の著作権管理システムへの登録を行ってはならない。",
    "9. 乙が本契約に違反した場合、甲は乙に対し、当該利用の停止、公開・配信の停止、データの削除その他必要な措置を求めることができる。また、甲に損害が生じた場合、甲は乙に対してその損害の賠償を請求することができる。",
    "10. 本ビートを使用して制作された完成楽曲から発生するすべての収益について、甲（WINO）は30%、乙は70%を受け取るものとする。(レーベル契約・事務所契約・出版社契約などを通して発生する収益についても30%)",
  ].join("\n");
}

export async function sendDeliveryEmail({
  to,
  beat,
  plan,
  orderId,
  buyerName,
  purchasedAt,
  isCustom,
  connectMethod,
  contactHandle,
  customRequest,
  wantsSession,
}) {
  const connectLabel =
    connectMethod === "instagram" ? "Instagram" : connectMethod === "discord" ? "Discord" : "メール記入";

  const customLines = isCustom
    ? [
        "",
        "【カスタムオーダー内容】",
        `連絡方法: ${connectLabel}${contactHandle ? ` (${contactHandle})` : ""}`,
        `オンラインセッション希望: ${wantsSession ? "あり" : "なし"}`,
        `リクエスト: ${customRequest || "(未入力)"}`,
        "",
        "カスタム版のファイルは制作者から別途お送りします。",
      ]
    : [];

  const rentalSplitLines = plan.id === "rental"
    ? [
        "",
        "【スプリット契約に必要な情報】",
        `楽曲タイトル: ${beat.title}`,
        `購入者名: ${buyerName || "(未入力)"}`,
        `購入者メールアドレス: ${to}`,
        `WINOメールアドレス: ${SELLER_EMAIL}`,
        "収益分配: WINO 30% / 購入者 70%",
        "※完成楽曲から発生する収益について、レーベル・事務所・出版社等を通じて発生する収益も含めて上記比率で分配します。",
      ]
    : [];

  const releaseLines = [
    "",
    "【リリースについて】",
    "本ビートを使用した楽曲をリリースする場合は、スプリット契約が必要です。",
    "リリースが決まりましたら、下記メールアドレスまでお問い合わせください。",
    SELLER_EMAIL,
  ];

  return getResend().emails.send({
    from: process.env.MAIL_FROM,
    to,
    subject: `【購入完了】${beat.title} (${plan.label}${isCustom ? " / カスタム" : ""}) - ご注文番号 ${orderId}`,
    text: [
      "この度はご購入ありがとうございます。",
      "",
      `■ 契約書番号: ${orderId}`,
      `■ 契約日: ${purchasedAt}`,
      `■ 楽曲タイトル: ${beat.title}`,
      `■ BPM: ${beat.bpm} / Key: ${beat.key}`,
      `■ ライセンス種別: ${plan.label}`,
      `■ 契約金額: ¥${plan.priceJPY.toLocaleString("ja-JP")}${isCustom ? " + カスタムオーダー ¥15,000" : ""}`,
      `■ 甲(制作者): ${process.env.SELLER_LEGAL_NAME || "(未設定)"}`,
      `■ WINO連絡先: ${SELLER_EMAIL}`,
      `■ 乙(購入者): ${buyerName || "(未入力)"} / ${to}`,
      ...rentalSplitLines,
      ...customLines,
      ...releaseLines,
      "",
      "【契約内容】",
      licenseBodyText(plan),
      "",
      "本メールは決済完了と同時にシステムにより自動送信されたものであり、両当事者の合意成立を証するものとします。",
      "",
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/download/${orderId}`,
      "【ダウンロード】",
      "",
      "【契約書PDF】",
      "",
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/contract/${orderId}`,
      "購入後のダウンロードリンクです。購入情報が確認できる場合のみファイルを取得できます。",
      "",
      "※現在のシステムでは納品ファイルをメール添付せず、購入確認済みのダウンロードリンクから取得する方式です。",
    ].join("\n")
  });
}

export async function sendCustomOrderNotification({
  beat,
  plan,
  orderId,
  buyerName,
  buyerEmail,
  connectMethod,
  contactHandle,
  customRequest,
  wantsSession,
}) {
  const connectLabel =
    connectMethod === "instagram" ? "Instagram" : connectMethod === "discord" ? "Discord" : "メール記入";

  return getResend().emails.send({
    from: process.env.MAIL_FROM,
    to: SELLER_EMAIL,
    subject: `【カスタムオーダー】${beat.title} (${plan.label}) - ご注文番号 ${orderId}`,
    text: [
      "新しいカスタムオーダーが入りました。",
      "",
      `■ ご注文番号: ${orderId}`,
      `■ 楽曲タイトル: ${beat.title}`,
      `■ ライセンス種別: ${plan.label}`,
      `■ 購入者名: ${buyerName || "(未入力)"}`,
      `■ 購入者メール: ${buyerEmail}`,
      `■ 連絡方法: ${connectLabel}${contactHandle ? ` (${contactHandle})` : ""}`,
      `■ オンラインセッション希望: ${wantsSession ? "あり" : "なし"}`,
      "",
      "【リクエスト内容】",
      customRequest || "(未入力)",
    ].join("\n"),
  });
}

export async function sendSellerPurchaseNotification({
  beat,
  plan,
  orderId,
  buyerName,
  buyerEmail,
  isCustom,
  customRequest,
}) {
  return getResend().emails.send({
    from: process.env.MAIL_FROM,
    to: process.env.SELLER_NOTIFY_EMAIL || SELLER_EMAIL,
    subject: `【WINO / 購入通知】${beat.title} - ${plan.label} - ¥${plan.priceJPY.toLocaleString("ja-JP")}`,
    text: [
      "WINO BEATS STOREで新しい購入がありました。",
      "",
      `■ 注文番号: ${orderId}`,
      `■ ビート: ${beat.title}`,
      `■ プラン: ${plan.label}`,
      `■ 金額: ¥${plan.priceJPY.toLocaleString("ja-JP")}${isCustom ? " + カスタムオーダー ¥15,000" : ""}`,
      `■ 購入者: ${buyerName || "(未入力)"}`,
      `■ メール: ${buyerEmail}`,
      `■ カスタム: ${isCustom ? "あり" : "なし"}`,
      `■ リクエスト: ${customRequest || "(なし)"}`,
      "",
      "購入者への案内: リリース時はスプリット契約が必要です。",
      `問い合わせ先: ${SELLER_EMAIL}`,
    ].join("\n"),
  });
}
