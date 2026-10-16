"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCarrito } from "@/lib/carrito";

export default function Header() {
  const { piezas, listo } = useCarrito();
  const [solido, setSolido] = useState(false);
  useEffect(() => {
    const f = () => setSolido(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solido ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Principal">
        <Link href="/" className="display text-xl font-extrabold tracking-tight" aria-label="Dorsalwear, inicio">
          DORSAL<span className="text-accent">/</span>WEAR
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/catalogo" className="rounded-full px-3 py-2 text-sm text-bone/80 transition-colors hover:text-bone sm:px-4">
            Catálogo
          </Link>
          <Link href="/#como-funciona" className="hidden rounded-full px-4 py-2 text-sm text-bone/80 transition-colors hover:text-bone sm:inline-flex">
            Cómo funciona
          </Link>
          <Link
            href="/carrito"
            className="relative inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm transition-colors hover:border-bone/40"
            aria-label={`Carrito, ${piezas} piezas`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M6 7h12l-1 13H7L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {listo && piezas > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">{piezas}</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
