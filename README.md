# WINO BEATS — ビート販売サイト

Next.js製。Stripe Checkoutで決済し、Webhookで自動的に
「契約書PDF生成 + ビートファイル添付」のメールを購入者に送信します。

## 構成

- `app/page.js` — トップページ(hip-hopジャンルのトラック一覧)
- `app/beat/[id]/page.js` + `purchase-panel.js` — 試聴・プラン選択・購入ボタン
- `app/api/checkout/route.js` — Stripe Checkout Sessionを作成
- `app/api/webhook/route.js` — 決済完了イベントを受けて契約書生成とメール送信
- `lib/beats.js` — ビート一覧とプラン(リース¥5,000 / 買い取り¥50,000)の定義
- `lib/contract.js` — pdf-libで契約書PDFを生成
- `lib/email.js` — Resendで契約書とビートファイルを添付送信

## セットアップ

```bash
npm install
cp .env.example .env.local
```

### 1. Stripe

1. https://dashboard.stripe.com/apikeys で `STRIPE_SECRET_KEY` /
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を取得。
2. ローカル確認用に [Stripe CLI](https://docs.stripe.com/stripe-cli) を入れて

   ```bash
   npm run stripe:listen
   ```

   実行すると表示される `whsec_...` を `STRIPE_WEBHOOK_SECRET` に設定。
3. 本番は Stripe Dashboard > Developers > Webhooks で
   `https://あなたのドメイン/api/webhook` を登録し、
   イベントは `checkout.session.completed` を選択。

### 2. メール送信 (Resend)

1. https://resend.com でAPIキーを取得し `RESEND_API_KEY` に設定。
2. 送信元ドメインを認証し `MAIL_FROM` に設定
   (認証前は Resend のテストアドレスのみ送信可)。
   Gmail/SESなど他のサービスを使いたい場合は `lib/email.js` を
   nodemailer実装に差し替えてください。

### 3. 契約書の日本語フォント

`lib/fonts/NotoSansJP-Regular.otf` を配置してください
(ライセンスの都合上、本テンプレートには同梱していません)。
配置しない場合、契約書PDFは日本語が表示できない旨の注記付きで生成されます。

### 4. ビートファイルの配置

- `public/beats/` … 誰でも聴ける試聴用の短いMP3(トラック一覧・詳細ページで再生)
- `private/beats/` … 購入者にのみメール添付される本番ファイル
  (`lib/beats.js` の `files.lease` / `files.exclusive` で指定したファイル名と一致させる)

⚠️ `private/beats/` の中身は**絶対にpublicに置かない・Gitにコミットしない**でください
(支払い前に誰でもダウンロードできてしまいます)。

### 5. 起動

```bash
npm run dev
```

http://localhost:3000 でトップページが表示されます。

## 本番運用に向けた注意点

- **在庫**: 現状ビート情報は `lib/beats.js` の配列(ハードコード)です。
  商品を増やす/買い取り後に販売終了にするならDB化してください。
- **大きいファイルの添付**: WAV+Stemsのzipが大きい場合、メール添付でなく
  S3等の署名付きURL(有効期限あり)をメール本文に載せる方式に変更するのがおすすめです。
- **領収書/インボイス**: 本テンプレートの契約書PDFは「ライセンス契約書」であり、
  税務上の領収書ではありません。必要なら別途Stripeの自動請求書機能や
  会計ソフト連携を検討してください。
- **特商法表記**: 日本国内で物販・デジタルコンテンツ販売を行う場合、
  特定商取引法に基づく表記ページの設置が必要です。
