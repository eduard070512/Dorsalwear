"use client";

import { useState } from "react";
import { mxn, ZONAS } from "@/data/productos";
import type { LineaPedido, PedidoEntrada } from "@/lib/pedido";

export interface PedidoAdmin {
  id: number;
  folio: string;
  nombre: string;
  telefono: string;
  entrega: "local" | "domicilio";
  direccion: PedidoEntrada["direccion"] | null;
  notas: string | null;
  lineas: LineaPedido[];
  total: number;
  por_cotizar: boolean;
  estado: string;
  envio: { guia: string; pdf: string; rastreo: string } | null;
  creado_en: string;
}

const COLOR: Record<string, string> = {
  nuevo: "bg-accent/15 text-accent",
  pagado: "bg-emerald-500/15 text-emerald-400",
  enviado: "bg-sky-500/15 text-sky-300",
  entregado: "bg-bone/10 text-bone/70",
  cancelado: "bg-bone/5 text-muted line-through",
};
const SIGUIENTE: Record<string, { estado: string; texto: string } | undefined> = {
  nuevo: { estado: "pagado", texto: "Confirmar pago" },
  pagado: { estado: "enviado", texto: "Marcar enviado" },
  enviado: { estado: "entregado", texto: "Marcar entregado" },
};

function wa(tel: string, texto: string) {
  const n = tel.replace(/\D/g, "");
  return `https://wa.me/${n.length === 10 ? "52" + n : n}?text=${encodeURIComponent(texto)}`;
}

export default function AdminPedidos({ inicial, skydrop }: { inicial: PedidoAdmin[]; skydrop: boolean }) {
  const [pedidos, setPedidos] = useState(inicial);
  const [filtro, setFiltro] = useState("activos");
  const [tarifas, setTarifas] = useState<Record<number, { id: string; paqueteria: string; servicio: string; dias: number | null; precio: number }[]>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function estado(p: PedidoAdmin, nuevo: string) {
    const r = await fetch(`/api/admin/pedidos/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: nuevo }) });
    if (r.ok) setPedidos((xs) => xs.map((x) => (x.id === p.id ? { ...x, estado: nuevo } : x)));
    else setMsg((await r.json().catch(() => ({}))).error || "Error");
  }

  // Skydrop (solo si está activo): primero trae tarifas, luego genera la guía con la elegida.
  async function guia(p: PedidoAdmin, tarifa?: string) {
    setMsg(null);
    const r = await fetch(`/api/admin/pedidos/${p.id}/guia`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tarifa }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(d.error || "Error");
    if (d.tarifas) return setTarifas((t) => ({ ...t, [p.id]: d.tarifas }));
    setPedidos((xs) => xs.map((x) => (x.id === p.id ? { ...x, estado: "enviado", envio: d.guia } : x)));
    setTarifas((t) => ({ ...t, [p.id]: [] }));
  }

  const lista = pedidos.filter((p) => (filtro === "activos" ? ["nuevo", "pagado", "enviado"].includes(p.estado) : filtro === "todos" || p.estado === filtro));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-4xl font-extrabold">Pedidos</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          {["activos", "nuevo", "pagado", "enviado", "entregado", "todos"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={`h-9 cursor-pointer rounded-full border px-3 capitalize ${filtro === f ? "border-bone bg-bone text-ink" : "border-line"}`}>
              {f}
            </button>
          ))}
          <button
            onClick={async () => {
              await fetch("/api/admin/login", { method: "DELETE" });
              location.reload();
            }}
            className="h-9 cursor-pointer rounded-full px-3 text-muted hover:text-bone"
          >
            Salir
          </button>
        </div>
      </div>
      {msg && <p className="mt-4 text-sm text-accent" role="alert">{msg}</p>}
      {!lista.length && <p className="mt-10 text-muted">No hay pedidos aquí.</p>}
      <ul className="mt-8 grid gap-4">
        {lista.map((p) => {
          const sig = SIGUIENTE[p.estado];
          return (
            <li key={p.id} className="rounded-3xl border border-line bg-ink-2 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${COLOR[p.estado] ?? ""}`}>{p.estado}</span>
                <span className="font-mono text-sm">{p.folio}</span>
                <span className="text-sm text-muted">{new Date(p.creado_en).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span className="ml-auto font-semibold">
                  {mxn(p.total)}
                  {p.por_cotizar ? " + cotizar" : ""}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="text-sm">
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-muted">{p.telefono}</p>
                  <p className="mt-2 text-muted">
                    {p.entrega === "local"
                      ? "Entrega local"
                      : p.direccion
                        ? `${p.direccion.calle}, ${p.direccion.colonia}, CP ${p.direccion.cp}, ${p.direccion.ciudad}, ${p.direccion.estado}, ${p.direccion.pais}`
                        : "Envío"}
                  </p>
                  {p.notas && <p className="mt-2 text-bone/70">“{p.notas}”</p>}
                </div>
                <ul className="space-y-1 text-sm">
                  {p.lineas.map((l, i) => (
                    <li key={i}>
                      {l.cantidad} × {l.nombre} · {l.color} · {l.talla}
                      {l.zonas.length > 0 && <span className="text-muted"> · {l.zonas.map((z) => ZONAS[z].nombre).join(", ")}</span>}
                      {l.texto && <span className="text-muted"> · “{l.texto}”</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                {sig && (
                  <button onClick={() => estado(p, sig.estado)} className="h-10 cursor-pointer rounded-full bg-bone px-4 text-sm font-medium text-ink">
                    {sig.texto}
                  </button>
                )}
                <a href={wa(p.telefono, `Hola ${p.nombre.split(" ")[0]}, te escribimos de Dorsalwear sobre tu pedido ${p.folio}.`)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm">
                  WhatsApp al cliente
                </a>
                {skydrop && p.entrega === "domicilio" && p.estado === "pagado" && !p.envio && (
                  <button onClick={() => guia(p)} className="h-10 cursor-pointer rounded-full border border-line px-4 text-sm">
                    Generar guía
                  </button>
                )}
                {p.envio && (
                  <a
                    href={wa(p.telefono, `¡Tu pedido ${p.folio} ya va en camino! Guía: ${p.envio.guia}. Rastreo: ${p.envio.rastreo}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm"
                  >
                    Mandar guía por WhatsApp
                  </a>
                )}
                {p.estado !== "cancelado" && p.estado !== "entregado" && (
                  <button onClick={() => confirm("¿Cancelar este pedido?") && estado(p, "cancelado")} className="ml-auto h-10 cursor-pointer px-3 text-sm text-muted hover:text-accent">
                    Cancelar
                  </button>
                )}
              </div>
              {tarifas[p.id]?.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {tarifas[p.id].map((t) => (
                    <button key={t.id} onClick={() => guia(p, t.id)} className="cursor-pointer rounded-2xl border border-line p-3 text-left text-sm hover:border-bone/50">
                      <span className="block font-medium">{t.paqueteria}</span>
                      <span className="block text-muted">{t.servicio}{t.dias ? ` · ${t.dias} días` : ""}</span>
                      <span className="block">{mxn(t.precio)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
