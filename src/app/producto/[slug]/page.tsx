import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducto, precioFinal, PRODUCTOS } from "@/data/productos";
import ProductoDetalle from "@/components/ProductoDetalle";

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = getProducto((await params).slug);
  if (!p) return {};
  return {
    title: `${p.nombre} personalizada`,
    description: `${p.resumen} Personalízala con tu logo, nombre o número. Envíos a México y USA.`,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: { images: [`/productos/${p.slug}.webp`] },
  };
}

export default async function Producto({ params }: P) {
  const p = getProducto((await params).slug);
  if (!p) notFound();
  const precio = precioFinal(p);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    description: p.descripcion,
    image: `/productos/${p.slug}.webp`,
    brand: { "@type": "Brand", name: "Dorsalwear" },
    ...(precio != null && {
      offers: { "@type": "Offer", priceCurrency: "MXN", price: precio, availability: "https://schema.org/InStock" },
    }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProductoDetalle p={p} />
    </>
  );
}
