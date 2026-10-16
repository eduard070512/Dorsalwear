"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) location.reload();
    else setErr((await r.json().catch(() => ({}))).error || "Error");
  }
  return (
    <form onSubmit={entrar} className="mx-auto grid max-w-sm gap-4 px-4 pb-24 pt-40">
      <h1 className="display text-3xl font-extrabold">Panel</h1>
      <label className="grid gap-1.5 text-sm">
        Contraseña
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" className="h-11 rounded-xl border border-line bg-ink-2 px-4" />
      </label>
      {err && <p className="text-sm text-accent" role="alert">{err}</p>}
      <button className="h-11 cursor-pointer rounded-full bg-bone font-medium text-ink">Entrar</button>
    </form>
  );
}
