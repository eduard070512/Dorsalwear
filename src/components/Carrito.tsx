"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getProducto, mxn, precioFinal, TIENDA, ZONAS } from "@/data/productos";
import { useCarrito } from "@/lib/carrito";

type Resultado = { folio: string; whatsapp: string; banco: { banco: string; titular: string; clabe: string } | null; total: number; porCotizar: boolean };

const campo = "h-11 w-full rounded-xl border border-line bg-ink-2 px-4 text-sm placeholder:text-muted/70 focus:border-bone/50 focus:outline-none";

export default function Carrito() {
  const { items, cambiar, quitar, vaciar, listo } = useCarrito();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [entrega, setEntrega] = useState<"local" | "domicilio">("local");
  const [dir, setDir] = useState({ calle: "", colonia: "", cp: "", ciudad: "", estado: "", pais: "MX" as "MX" | "US", referencias: "" });
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [res, setRes] = useState<Resultado | null>(null);

  const lineas = useMemo(
    () =>
      items.map((i) => {
        const p = getProducto(i.slug);
        const precio = p ? precioFinal(p) : null;
        return { i, p, color: p?.colores.find((c) => c.id === i.color), precio, sub: precio == null ? null : precio * i.cantidad };
      }),
    [items],
  );
  const total = lineas.reduce((a, l) => a + (l.sub ?? 0), 0);
  const porCotizar = lineas.some((l) => l.precio == null);

  async function confirmar(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setEnviando(true);
    // Se abre la ventana antes del await para que el navegador no la bloquee.
    const w = window.open("", "_blank");
    try {
      const r = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, entrega, direccion: entrega === "domicilio" ? dir : undefined, notas, items: items.map(({ key: _k, ...x }) => x) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo crear el pedido.");
      setRes(d);
      if (w) w.location.href = d.whatsapp;
      else window.location.href = d.whatsapp;
      vaciar();
    } catch (e) {
      w?.close();
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (res) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-6">
        <p className="eyebrow">Pedido {res.folio}</p>
        <h1 className="display mt-3 text-4xl font-extrabold sm:text-5xl">¡Listo! Termina en WhatsApp.</h1>
        <p className="mt-5 text-bone/75">
          Abrimos WhatsApp con tu pedido ya escrito. Solo dale enviar y mándanos tu logo o diseño por ahí. Si no se abrió, usa el botón.
        </p>
        <a href={res.whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#25d366] px-7 font-medium text-ink">
          Abrir WhatsApp
        </a>
        <div className="mt-10 rounded-3xl border border-line p-6">
          <p className="font-medium">Pago por transferencia</p>
          {res.banco ? (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted">Banco</dt>
              <dd>{res.banco.banco}</dd>
              <dt className="text-muted">Titular</dt>
              <dd>{res.banco.titular}</dd>
              <dt className="text-muted">CLABE</dt>
              <dd className="font-mono tracking-wide">{res.banco.clabe}</dd>
              <dt className="text-muted">Concepto</dt>
              <dd className="font-mono">{res.folio}</dd>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted">Te mandamos los datos por WhatsApp al confirmar tu pedido.</p>
          )}
          <p className="mt-4 text-sm text-muted">
            Total de prendas: <span className="text-bone">{mxn(res.total)}</span>
            {res.porCotizar ? " + prendas por cotizar" : ""}. El envío (si aplica) se confirma antes de pagar.
          </p>
        </div>
      </div>
    );
  }

  if (listo && !items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-40 text-center sm:px-6">
        <h1 className="display text-4xl font-extrabold">Tu carrito está vacío.</h1>
        <Link href="/catalogo" className="mt-8 inline-flex h-12 items-center rounded-full bg-bone px-7 font-medium text-ink">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-28 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
      <section aria-labelledby="titulo-carrito">
        <h1 id="titulo-carrito" className="display text-4xl font-extrabold sm:text-5xl">Tu pedido</h1>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {lineas.map(({ i, p, color, precio, sub }) => (
            <li key={i.key} className="flex gap-4 py-5">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/productos/${i.slug}.webp`} alt="" className="h-full w-full object-contain p-1.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{p?.nombre ?? i.slug}</p>
                  <p className="shrink-0 font-medium">{sub == null ? "Por cotizar" : mxn(sub)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {color?.nombre} · Talla {i.talla}
                  {precio != null && ` · ${mxn(precio)} c/u`}
                </p>
                {(i.zonas.length > 0 || i.texto) && (
                  <p className="mt-1 text-sm text-muted">
                    Grabado: {i.zonas.map((z) => ZONAS[z].nombre).join(", ") || "—"}
                    {i.texto && ` · "${i.texto}"`}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-10 items-center rounded-full border border-line" role="group" aria-label="Cantidad">
                    <button type="button" className="h-10 w-10 cursor-pointer" onClick={() => cambiar(i.key, i.cantidad - 1)} aria-label="Menos">−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{i.cantidad}</span>
                    <button type="button" className="h-10 w-10 cursor-pointer" onClick={() => cambiar(i.key, i.cantidad + 1)} aria-label="Más">+</button>
                  </div>
                  <button type="button" onClick={() => quitar(i.key)} className="cursor-pointer text-sm text-muted underline-offset-4 hover:text-bone hover:underline">
                    Quitar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={confirmar} className="h-fit rounded-3xl border border-line bg-ink-2 p-6 lg:sticky lg:top-24" aria-labelledby="datos">
        <h2 id="datos" className="text-lg font-semibold">Tus datos</h2>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-1.5 text-sm">
            Nombre
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} autoComplete="name" />
          </label>
          <label className="grid gap-1.5 text-sm">
            WhatsApp / teléfono
            <input required value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} inputMode="tel" autoComplete="tel" placeholder="10 dígitos" />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Entrega</legend>
          <div className="mt-2 grid gap-2">
            {(
              [
                ["local", `Entrega en ${TIENDA.ciudad}`, "Acordamos punto y hora por WhatsApp."],
                ["domicilio", "Envío a domicilio", "Todo México y Estados Unidos. El costo se confirma antes de pagar."],
              ] as const
            ).map(([v, t, d]) => (
              <label key={v} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${entrega === v ? "border-bone/60" : "border-line"}`}>
                <input type="radio" name="entrega" value={v} checked={entrega === v} onChange={() => setEntrega(v)} className="mt-1 accent-[var(--accent)]" />
                <span>
                  <span className="block text-sm font-medium">{t}</span>
                  <span className="block text-xs text-muted">{d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {entrega === "domicilio" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 grid gap-1.5 text-sm">
              Calle y número
              <input required value={dir.calle} onChange={(e) => setDir({ ...dir, calle: e.target.value })} className={campo} autoComplete="street-address" />
            </label>
            <label className="col-span-2 grid gap-1.5 text-sm">
              Colonia
              <input value={dir.colonia} onChange={(e) => setDir({ ...dir, colonia: e.target.value })} className={campo} />
            </label>
            <label className="grid gap-1.5 text-sm">
              Código postal
              <input required value={dir.cp} onChange={(e) => setDir({ ...dir, cp: e.target.value })} className={campo} inputMode="numeric" autoComplete="postal-code" />
            </label>
            <label className="grid gap-1.5 text-sm">
              País
              <select value={dir.pais} onChange={(e) => setDir({ ...dir, pais: e.target.value as "MX" | "US" })} className={campo}>
                <option value="MX">México</option>
                <option value="US">Estados Unidos</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              Ciudad
              <input required value={dir.ciudad} onChange={(e) => setDir({ ...dir, ciudad: e.target.value })} className={campo} autoComplete="address-level2" />
            </label>
            <label className="grid gap-1.5 text-sm">
              Estado
              <input required value={dir.estado} onChange={(e) => setDir({ ...dir, estado: e.target.value })} className={campo} autoComplete="address-level1" />
            </label>
            <label className="col-span-2 grid gap-1.5 text-sm">
              Referencias (opcional)
              <input value={dir.referencias} onChange={(e) => setDir({ ...dir, referencias: e.target.value })} className={campo} />
            </label>
          </div>
        )}

        <label className="mt-4 grid gap-1.5 text-sm">
          Notas (opcional)
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className={`${campo} h-auto py-3`} placeholder="Fecha que lo necesitas, mezcla de tallas, etc." />
        </label>

        <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Prendas</span>
            <span>{mxn(total)}{porCotizar ? " + por cotizar" : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Envío</span>
            <span>{entrega === "local" ? "Sin costo" : "Por confirmar"}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{mxn(total)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-accent" role="alert">
            {error}
          </p>
        )}
        <button disabled={enviando || !items.length} className="mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25d366] font-medium text-ink transition-opacity disabled:opacity-50">
          {enviando ? "Creando pedido…" : "Pedir por WhatsApp"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">Pagas por transferencia después de confirmar por WhatsApp.</p>
      </form>
    </div>
  );
}
