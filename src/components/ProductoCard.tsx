import Link from "next/link";
import Image from "next/image";
import { colorDeFoto, mxn, precioFinal, type Producto } from "@/data/productos";

export default function ProductoCard({ p }: { p: Producto }) {
  const final = precioFinal(p);
  return (
    <Link href={`/producto/${p.slug}`} className="group block rounded-3xl border border-line bg-ink-2 p-3 transition-colors duration-300 hover:border-bone/30">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-b from-ink-3 to-ink">
        <Image
          src={`/productos/${p.slug}.webp`}
          alt={`${p.nombre} en color ${colorDeFoto(p).nombre}`}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {p.oferta && p.precio && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            −{Math.round((1 - p.oferta / p.precio) * 100)}%
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-4">
        <div>
          <h3 className="font-medium">{p.nombre}</h3>
          <p className="mt-1 text-sm text-muted">{p.resumen}</p>
          <div className="mt-3 flex gap-1.5" aria-label="Colores disponibles">
            {p.colores.map((c) => (
              <span key={c.id} title={c.nombre} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: c.hex }} />
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {final == null ? (
            <p className="text-sm text-bone/80">Cotiza</p>
          ) : (
            <>
              <p className="font-semibold">{mxn(final)}</p>
              {p.oferta && p.precio && <p className="text-xs text-muted line-through">{mxn(p.precio)}</p>}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
