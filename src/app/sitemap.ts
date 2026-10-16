import type { MetadataRoute } from "next";
import { PRODUCTOS } from "@/data/productos";

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || "https://dorsalwear.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITIO, changeFrequency: "weekly", priority: 1 },
    { url: `${SITIO}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    ...PRODUCTOS.map((p) => ({ url: `${SITIO}/producto/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
