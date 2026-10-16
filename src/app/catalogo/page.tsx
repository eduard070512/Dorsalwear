import type { Metadata } from "next";
import ProductoCard from "@/components/ProductoCard";
import { PRODUCTOS } from "@/data/productos";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Sudaderas con capucha, oversize y playeras deportivas listas para personalizar con tu logo, nombre o número.",
  alternates: { canonical: "/catalogo" },
};

export default function Catalogo() {
  const grupos = [
    { t: "Sudaderas", items: PRODUCTOS.filter((p) => p.tipo === "sudadera") },
    { t: "Playeras deportivas", items: PRODUCTOS.filter((p) => p.tipo === "playera") },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
      <p className="eyebrow">Catálogo</p>
      <h1 className="display mt-3 text-5xl font-extrabold sm:text-6xl">Elige la base. Nosotros la hacemos tuya.</h1>
      {grupos.map((g) =>
        g.items.length ? (
          <section key={g.t} className="mt-16" aria-labelledby={g.t}>
            <h2 id={g.t} className="text-xl font-semibold">{g.t}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => (
                <ProductoCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
