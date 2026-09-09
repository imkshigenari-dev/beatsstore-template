"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBeatButton({ beatId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("本当にこのビートを削除しますか？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/beats/${beatId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.refresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        fontFamily: "IBM Plex Mono",
        fontSize: 11,
        background: "rgba(190, 130, 150, 0.12)",
        color: "#d7b7c4",
        border: "1px solid rgba(215, 183, 196, 0.5)",
        borderRadius: 4,
        padding: "6px 10px",
        cursor: "pointer",
      }}
    >
      {loading ? "削除中…" : "DELETE"}
    </button>
  );
}
