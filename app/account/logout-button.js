"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    await fetch("/api/account/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return <button className="admin-track__delete" onClick={logout} disabled={loading}>{loading ? "…" : "LOG OUT"}</button>;
}
