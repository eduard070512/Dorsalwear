import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || "https://dorsalwear.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: { default: "Dorsalwear · Sudaderas y playeras deportivas personalizadas", template: "%s · Dorsalwear" },
  description:
    "Sudaderas y playeras deportivas con tu logo, nombre o número grabado. Para equipos, empresas, generaciones y eventos. Envíos a todo México y Estados Unidos desde Colima.",
  keywords: ["sudaderas personalizadas", "playeras deportivas personalizadas", "sudaderas con logo", "uniformes deportivos", "sudaderas generación", "Colima"],
  openGraph: { type: "website", locale: "es_MX", siteName: "Dorsalwear", url: SITIO },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0b0b0c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${archivo.variable} ${inter.variable}`}>
      <body className="grano min-h-screen">
        <CarritoProvider>
          <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-bone focus:px-3 focus:py-2 focus:text-ink">
            Saltar al contenido
          </a>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </CarritoProvider>
      </body>
    </html>
  );
}
