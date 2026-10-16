import Link from "next/link";
import { TIENDA } from "@/data/productos";
import { CREDITOS_3D } from "@/data/creditos";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="display text-3xl font-extrabold">
            DORSAL<span className="text-accent">/</span>WEAR
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Sudaderas y playeras deportivas con tu marca. Hechas en {TIENDA.ciudad}, enviadas a todo México y Estados Unidos.
          </p>
        </div>
        <div>
          <p className="eyebrow">Tienda</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/catalogo" className="text-bone/80 hover:text-bone">Catálogo</Link></li>
            <li><Link href="/#como-funciona" className="text-bone/80 hover:text-bone">Cómo funciona</Link></li>
            <li><Link href="/#preguntas" className="text-bone/80 hover:text-bone">Preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`https://wa.me/${TIENDA.whatsapp}`} className="text-bone/80 hover:text-bone" target="_blank" rel="noreferrer">
                WhatsApp 312 171 2462
              </a>
            </li>
            <li className="text-bone/60">{TIENDA.ciudad}, México</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Dorsalwear. Todos los derechos reservados.</p>
        {CREDITOS_3D.length > 0 && (
          <p>
            Modelo 3D:{" "}
            {CREDITOS_3D.map((c, i) => (
              <span key={c.url}>
                {i > 0 && " · "}
                <a href={c.url} target="_blank" rel="noreferrer" className="underline hover:text-bone">
                  {c.titulo} por {c.autor}
                </a>{" "}
                ({c.licencia})
              </span>
            ))}
          </p>
        )}
      </div>
    </footer>
  );
}
