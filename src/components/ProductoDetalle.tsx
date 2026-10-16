"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { imagenDiseno, mxn, precioFinal, ZONAS, type Producto, type Zona } from "@/data/productos";
import { useCarrito } from "@/lib/carrito";

const Visor3D = dynamic(() => import("@/components/Visor3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Cargando vista 3D…</div>,
});

export default function ProductoDetalle({ p }: { p: Producto }) {
  const { agregar } = useCarrito();
  const [color, setColor] = useState(p.colores[0]);
  const [talla, setTalla] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [zonas, setZonas] = useState<Zona[]>(["pecho"]);
  const [enfoque, setEnfoque] = useState<Zona | null>(null);
  const [texto, setTexto] = useState("");
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const final = precioFinal(p);

  // Producto de la colección: el diseño va al frente en la versión que se ve sobre el color elegido.
  useEffect(() => {
    if (!p.diseno) return;
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = imagenDiseno(p.diseno, color);
  }, [p.diseno, color]);

  function toggleZona(z: Zona) {
    setZonas((xs) => (xs.includes(z) ? xs.filter((x) => x !== z) : [...xs, z]));
    setEnfoque(z);
  }

  function subirLogo(f: File | undefined) {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = url;
    if (!zonas.includes("pecho")) setZonas((xs) => [...xs, "pecho"]);
    setEnfoque("pecho");
  }

  function alCarrito() {
    if (!talla) {
      setAviso("Elige una talla.");
      return;
    }
    agregar({ slug: p.slug, color: color.id, talla, cantidad, zonas, texto });
    setAviso("¡Agregado al carrito!");
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-24 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-28">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_50%_40%,#26262b_0%,#0b0b0c_70%)]">
          <Visor3D tipo={p.tipo} color={color.tela} zonas={zonas} logo={logo} enfoque={enfoque} grande={!!p.diseno} />
          <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs text-muted">Arrastra para girar</p>
        </div>
      </div>

      <div>
        <nav aria-label="Ruta" className="text-sm text-muted">
          <Link href="/catalogo" className="hover:text-bone">Catálogo</Link> / <span className="text-bone/80">{p.nombre}</span>
        </nav>
        <h1 className="display mt-4 text-4xl font-extrabold sm:text-5xl">{p.nombre}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          {final == null ? (
            <p className="text-xl">Precio por cotizar</p>
          ) : (
            <>
              <p className="text-3xl font-semibold">{mxn(final)}</p>
              {p.oferta && p.precio && <p className="text-lg text-muted line-through">{mxn(p.precio)}</p>}
              {p.oferta && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">Oferta</span>}
            </>
          )}
        </div>
        <p className="mt-5 leading-relaxed text-bone/75">{p.descripcion}</p>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">
            Color: <span className="text-muted">{color.nombre}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {p.colores.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={c.id === color.id}
                aria-label={c.nombre}
                className={`h-11 w-11 cursor-pointer rounded-full border-2 transition-transform hover:scale-105 ${c.id === color.id ? "border-bone" : "border-transparent"}`}
              >
                <span className="block h-full w-full rounded-full border border-white/20" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-sm font-medium">Talla</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tallas.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTalla(t);
                  setAviso(null);
                }}
                aria-pressed={talla === t}
                className={`h-11 min-w-14 cursor-pointer rounded-full border px-4 text-sm transition-colors ${talla === t ? "border-bone bg-bone text-ink" : "border-line hover:border-bone/50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-sm font-medium">{p.diseno ? "¿Algo más? (opcional)" : "¿Dónde va tu grabado?"}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {p.zonas.map((z) => {
              const on = zonas.includes(z);
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => toggleZona(z)}
                  aria-pressed={on}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${on ? "border-accent bg-accent/10" : "border-line hover:border-bone/40"}`}
                >
                  <span className="flex items-center justify-between text-sm font-medium">
                    {ZONAS[z].nombre}
                    <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${on ? "border-accent bg-accent text-white" : "border-line"}`} aria-hidden>
                      {on ? "✓" : ""}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-muted">{ZONAS[z].ayuda}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {!p.diseno && (
          <label className="block">
            <span className="text-sm font-medium">Prueba tu logo (opcional)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => subirLogo(e.target.files?.[0])}
              className="mt-2 block w-full cursor-pointer rounded-xl border border-line bg-ink-2 text-sm text-muted file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:bg-bone file:px-4 file:text-ink"
            />
            <span className="mt-1 block text-xs text-muted">Solo para verlo aquí. El archivo final nos lo mandas por WhatsApp.</span>
          </label>
          )}
          <label className="block">
            <span className="text-sm font-medium">Nombre, número o indicaciones</span>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={200}
              placeholder='Ej. "MICHEL 07" en la espalda'
              className="mt-2 h-11 w-full rounded-xl border border-line bg-ink-2 px-4 text-sm placeholder:text-muted/70 focus:border-bone/50 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center rounded-full border border-line" role="group" aria-label="Cantidad">
            <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="h-12 w-12 cursor-pointer text-lg" aria-label="Menos">−</button>
            <span className="w-10 text-center tabular-nums" aria-live="polite">{cantidad}</span>
            <button type="button" onClick={() => setCantidad((c) => Math.min(500, c + 1))} className="h-12 w-12 cursor-pointer text-lg" aria-label="Más">+</button>
          </div>
          <button type="button" onClick={alCarrito} className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-bone px-7 font-medium text-ink transition-transform hover:scale-[1.02] sm:flex-none">
            Agregar al carrito{final != null ? ` · ${mxn(final * cantidad)}` : ""}
          </button>
          {aviso && (
            <p className={`w-full text-sm ${aviso.startsWith("¡") ? "text-[var(--ok)]" : "text-accent"}`} role="status">
              {aviso}{" "}
              {aviso.startsWith("¡") && (
                <Link href="/carrito" className="underline">
                  Ver carrito
                </Link>
              )}
            </p>
          )}
        </div>

        <ul className="mt-10 grid gap-2 border-t border-line pt-6 text-sm text-bone/75 sm:grid-cols-2">
          {p.detalles.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="text-accent" aria-hidden>—</span>
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
