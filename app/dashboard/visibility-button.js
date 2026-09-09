"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VisibilityButton({ beatId, visibility }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function setVisibility(next) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/beats/${beatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新に失敗しました");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const next = visibility === "public" ? "early_access" : visibility === "early_access" ? "draft" : "public";
  const label = visibility === "public" ? "PUBLIC" : visibility === "early_access" ? "EARLY" : "DRAFT";

  return (
    <button
      type="button"
      onClick={() => setVisibility(next)}
      disabled={loading}
      title={`次: ${next}`}
      style={{
        minWidth: 74,
        padding: "7px 9px",
        border: "1px solid rgba(215,183,196,.45)",
        background: "rgba(190,130,150,.10)",
        color: "#d7b7c4",
        fontFamily: "IBM Plex Mono",
        fontSize: 10,
        letterSpacing: 1,
      }}
    >
      {loading ? "..." : label}
    </button>
  );
}
