import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// 日本語を描画するには CJK 対応フォントの埋め込みが必須です。
// lib/fonts/NotoSansJP-Regular.otf を配置してください（ライセンス上、同梱していません）。
// 未配置の場合はエラーメッセージ付きの英語版フォールバックを返します。
const FONT_PATH = path.join(process.cwd(), "lib", "fonts", "NotoSansJP-Regular.ttf");

function licenseBodyText(plan, beat) {
  if (plan.id === "exclusive") {
    return [
      "1. 甲(制作者)は、本契約に定める楽曲(以下「本ビート」)を使用して、",
      "2.  完成楽曲を商業的に利用するための独占的かつ譲渡不能の利用権を、本契約締結および代金完済をもって乙(購入者)に譲渡する。",
      "3. 譲渡後、甲は本ビートを第三者に再販売しない。",
      "4. 乙は本ビートを商用・非商用を問わず自由に利用できる。",
      "5. 甲の著作者人格権は行使しない旨を甲は合意する。",
      "6. 乙は本ビート単体（トラックの再販売・転売）を行うことはできない。",
      "7. 納品物: WAV(24bit)および希望された場合トラックアウト(Stems)一式。",
      "8. 乙は、本契約で明示的に許諾された範囲を超えて、本ビートを利用してはならない。また、甲の許可なく、本ビートをAI学習用データ、音源素材、ループ素材その他の第三者向け素材として利用・提供してはならない。",
      "9. 乙が本契約に違反した場合、甲は乙に対し、当該利用の停止、公開・配信の停止、データの削除その他必要な措置を求めることができる。また、甲に損害が生じた場合、甲は乙に対してその損害の賠償を請求することができる。",
    ].join("\n");
  }
  return [
    "1. 甲(制作者)は、乙(購入者)に対し本ビートの非独占的利用を許諾する。",
    "2. 著作権は甲に留保され、甲は本ビートを他の顧客にも販売できる。",
    "3. 乙は本ビートを用いた楽曲を配信・SNS投稿・非商用ミックステープに利用できる。",
    "4.  商用リリースでの累計再生数が50万を超える場合、上位ライセンスへアップグレードが必要となる場合がある。",
    "5. 乙は本ビート単体（トラックの再販売・転売）を行うことはできない。",
    "6. 納品物: MP3ファイル。",
    "7. 乙は、完成楽曲を公開・配信・販売する際、クレジットを表示するものとする。Prod. WINO",
    "8. 乙は、本契約で明示的に許諾された範囲を超えて、本ビートを利用してはならない。また、甲の許可なく、本ビートをAI学習用データ、音源素材、ループ素材その他の第三者向け素材として利用・提供してはならない。",
    "9. 乙が本契約に違反した場合、甲は乙に対し、当該利用の停止、公開・配信の停止、データの削除その他必要な措置を求めることができる。また、甲に損害が生じた場合、甲は乙に対してその損害の賠償を請求することができる。",
    "10. 本ビートを使用して制作された完成楽曲から発生するすべての収益について、甲（WINO）は30%、乙は70%を受け取るものとする。(レーベル契約・事務所契約・出版社契約などを通して発生する収益についても30%)",
  ].join("\n");
}

export async function generateContractPdf({ beat, plan, buyerName, buyerEmail, orderId, purchasedAt }) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  let font;
  let hasJapaneseFont = fs.existsSync(FONT_PATH);
  if (hasJapaneseFont) {
    const fontBytes = fs.readFileSync(FONT_PATH);
    font = await pdfDoc.embedFont(fontBytes, { subset: true });
  } else {
    font = await pdfDoc.embedFont("Helvetica");
  }

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const margin = 50;
  let y = 800;
  const black = rgb(0.1, 0.1, 0.1);

  const draw = (text, size = 11, lineGap = 16, color = black) => {
    const lines = text.split("\n");
    for (const line of lines) {
      page.drawText(line, { x: margin, y, size, font, color });
      y -= lineGap;
    }
  };

  if (!hasJapaneseFont) {
    draw(
      "[NOTE] Japanese font not embedded. Place lib/fonts/NotoSansJP-Regular.otf\nto render Japanese text correctly. Showing fallback layout.",
      9,
      12,
      rgb(0.6, 0.1, 0.1)
    );
    y -= 10;
  }

  draw("ビートライセンス契約書", 20, 30);
  draw(`契約書番号: ${orderId}`, 10, 14);
  draw(`契約日: ${purchasedAt}`, 10, 24);

  draw(`楽曲タイトル: ${beat.title}`, 12, 18);
  draw(`BPM: ${beat.bpm} / Key: ${beat.key}`, 11, 18);
  draw(`ライセンス種別: ${plan.label}`, 12, 18);
  draw(`契約金額: ¥${plan.priceJPY.toLocaleString("ja-JP")}`, 12, 24);

  draw(`甲(制作者): ${process.env.SELLER_LEGAL_NAME || "(未設定)"}`, 11, 16);
  draw(`乙(購入者): ${buyerName || "(未入力)"}  / ${buyerEmail}`, 11, 30);

  draw("【契約内容】", 13, 20);
  draw(licenseBodyText(plan, beat), 10.5, 15);

  y -= 20;
  draw(
    "本契約書は決済完了と同時にシステムにより自動発行されたものであり、\n両当事者の合意成立を証するものとします。",
    9,
    13,
    rgb(0.3, 0.3, 0.3)
  );

  return pdfDoc.save();
}
