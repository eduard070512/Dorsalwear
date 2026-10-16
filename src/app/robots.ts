import type { MetadataRoute } from "next";

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || "https://dorsalwear.com";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/carrito"] }], sitemap: `${SITIO}/sitemap.xml` };
}
