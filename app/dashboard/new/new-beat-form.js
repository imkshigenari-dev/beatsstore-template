"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function NewBeatForm({ genres }) {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState(genres[0] || "");
  const [coverColor, setCoverColor] = useState("#789ca0");
  const [coverMode, setCoverMode] = useState("auto");
  const [coverFile, setCoverFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [rentalFile, setRentalFile] = useState(null);
  const [premiumFile, setPremiumFile] = useState(null);
  const [exclusiveFile, setExclusiveFile] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("");
  const router = useRouter();

  async function uploadFile(file, pathname, label) {
    if (file) setStage(label + " をアップロード中…");
    if (!file) return null;
    const result = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/dashboard/blob-upload",
      // Vercel BlobのブラウザアップロードはPublic Blobで安定させる。
      // 大きな音声はmultipartで分割アップロードする。
      contentType: file.type || undefined,
      onUploadProgress: (event) => {
        const percentage = Math.round(event?.percentage || 0);
        setStage(`${label} をアップロード中… ${percentage}%`);
      },
      clientPayload: JSON.stringify({ kind: pathname.split("/")[0] }),
    });
    return result.url;
  }

  async function handleSubmit() {
    if (!title.trim() || !bpm || !key.trim() || !previewFile) {
      setError("タイトル・BPM・Key・試聴用ファイルは必須です");
      return;
    }
    if (coverMode === "upload" && !coverFile) {
      setError("カスタムサムネイルを選択してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const isMp3 = (file) => /\.mp3$/i.test(file?.name || "") || ["audio/mpeg", "audio/mp3"].includes(file?.type);
      const isWav = (file) => /\.wav$/i.test(file?.name || "") || ["audio/wav", "audio/x-wav", "audio/wave"].includes(file?.type);
      if (rentalFile && !isMp3(rentalFile)) throw new Error("レンタル納品はMP3のみです");
      if (premiumFile && !isWav(premiumFile)) throw new Error("プレミアム納品はWAVのみです");
      if (exclusiveFile && !isWav(exclusiveFile)) throw new Error("独占購入納品はWAVのみです");
      const id = crypto.randomUUID();
      const previewUrl = await uploadFile(previewFile, `previews/${id}.mp3`, "試聴MP3");
      const rentalUrl = rentalFile ? await uploadFile(rentalFile, `deliverables/${id}/rental-${rentalFile.name}`, "レンタルMP3") : null;
      const premiumUrl = premiumFile ? await uploadFile(premiumFile, `deliverables/${id}/premium-${premiumFile.name}`, "プレミアムWAV") : null;
      const exclusiveUrl = exclusiveFile ? await uploadFile(exclusiveFile, `deliverables/${id}/exclusive-${exclusiveFile.name}`, "独占購入WAV") : null;
      const thumbnailUrl = coverMode === "upload"
        ? await uploadFile(coverFile, `thumbnails/${id}-cover`, "サムネイル")
        : null;

      const payload = {
        id,
        title: title.trim(),
        bpm: Number(bpm),
        key: key.trim(),
        genre,
        coverColor,
        coverMode,
        thumbnailUrl,
        previewUrl,
        files: { rental: rentalUrl, premium: premiumUrl, exclusive: exclusiveUrl },
        visibility,
        notifySubscribers,
      };

      setStage("ビート情報を保存中…");
      const res = await fetch("/api/dashboard/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw }; }
      if (!res.ok) throw new Error(data.error || `投稿に失敗しました（HTTP ${res.status}）`);

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="field"><label>曲名</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: NIGHT SHIFT" /></div>
      <div className="field"><label>BPM</label><input type="number" min="40" max="240" value={bpm} onChange={(e) => setBpm(e.target.value)} /></div>
      <div className="field"><label>Key</label><input value={key} onChange={(e) => setKey(e.target.value)} placeholder="例: F# Minor" /></div>
      <div className="field"><label>ジャンル</label><select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>

      <div className="field">
        <label>サムネイル</label>
        <div className="cover-choice">
          <button type="button" className={coverMode === "auto" ? "cover-choice__active" : ""} onClick={() => setCoverMode("auto")}>AI / AUTO</button>
          <button type="button" className={coverMode === "upload" ? "cover-choice__active" : ""} onClick={() => setCoverMode("upload")}>自分で設定</button>
        </div>
      </div>

      {coverMode === "auto" ? (
        <div className="field"><label>AIジャケットの色</label><input type="color" value={coverColor} onChange={(e) => setCoverColor(e.target.value)} /></div>
      ) : (
        <div className="field"><label>カスタムサムネイル PNG / JPG / WEBP</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
      )}

      <div className="field"><label>試聴用MP3</label><input type="file" accept="audio/*" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} /></div>
      <div className="field"><label>レンタル納品ファイル</label><input type="file" accept=".mp3,audio/mpeg,audio/mp3" onChange={(e) => setRentalFile(e.target.files?.[0] || null)} /></div>
      <div className="field"><label>プレミアム納品ファイル</label><input type="file" accept=".wav,audio/wav,audio/x-wav,audio/wave" onChange={(e) => setPremiumFile(e.target.files?.[0] || null)} /></div>
      <div className="field"><label>独占購入納品ファイル</label><input type="file" accept=".wav,audio/wav,audio/x-wav,audio/wave" onChange={(e) => setExclusiveFile(e.target.files?.[0] || null)} /></div>

      <div className="field">
        <label>公開設定</label>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="public">PUBLIC / 今すぐ公開</option>
          <option value="early_access">EARLY ACCESS / 先行公開</option>
          <option value="draft">DRAFT / 非公開</option>
        </select>
      </div>

      <label className="connect-option" style={{ marginTop: 18 }}>
        <input type="checkbox" checked={notifySubscribers} onChange={(e) => setNotifySubscribers(e.target.checked)} />
        {visibility === "early_access" ? "メール登録者へ先行公開を通知" : "メール登録者へ新着ビートを通知"}
      </label>

      <button className="buy-button" onClick={handleSubmit} disabled={loading}>{loading ? (stage || "処理中…") : "BEATを公開する"}</button>
      {error && <p className="error-text">{error}</p>}
    </>
  );
}
