import Link from "next/link";
import EscenaScroll from "@/components/EscenaScroll";
import ProductoCard from "@/components/ProductoCard";
import { mxn, PRODUCTOS, TIENDA } from "@/data/productos";

const PASOS = [
  { n: "01", t: "Elige tu prenda", d: "Sudadera o playera deportiva, color y tallas. Puedes mezclar tallas en un mismo pedido." },
  { n: "02", t: "Dinos qué grabamos", d: "Logo al frente, nombre o número en la espalda, detalle en la manga. Ves dónde va antes de pedir." },
  { n: "03", t: "Confirma por WhatsApp", d: "Te llega el pedido completo por WhatsApp. Nos mandas tu logo y pagas por transferencia." },
  { n: "04", t: "Recíbelo", d: "Entrega en Colima o envío a domicilio a todo México y Estados Unidos." },
];

const PARA = [
  { t: "Equipos", d: "Uniformes con nombre y número para fútbol, básquet, running o el gym." },
  { t: "Empresas", d: "Tu marca en el pecho del equipo. Ideal para staff, eventos y regalos corporativos." },
  { t: "Generaciones", d: "La sudadera de la gene con el año y los nombres en la espalda." },
  { t: "Eventos", d: "Carreras, torneos, despedidas y viajes de grupo con su propio diseño." },
];

const FAQ = [
  { p: "¿Cuál es el pedido mínimo?", r: "Desde 1 pieza. Si pides para un equipo o grupo, escríbenos por WhatsApp y te damos precio por volumen." },
  { p: "¿Cómo pago?", r: "Por transferencia bancaria. Al confirmar tu pedido por WhatsApp te mandamos los datos; empezamos en cuanto se refleja el pago." },
  { p: "¿Hacen envíos?", r: `Sí. Entregamos en ${TIENDA.ciudad} y enviamos a domicilio a todo México y Estados Unidos. El costo del envío se confirma antes de pagar.` },
  { p: "¿Qué formato de logo necesito?", r: "PNG con fondo transparente o PDF/AI de preferencia. Si solo tienes una foto, nosotros te ayudamos a dejarlo listo." },
  { p: "¿Cuánto tarda mi pedido?", r: "Depende de la cantidad y del grabado. Te damos la fecha exacta al confirmar el pedido." },
];

function Panel({ n, titulo, texto, lado }: { n: string; titulo: string; texto: string; lado: "izq" | "der" }) {
  return (
    <div className={`mx-auto flex min-h-[110svh] max-w-7xl items-center px-4 sm:px-6 ${lado === "der" ? "justify-end" : "justify-start"}`}>
      <div className="w-full max-w-md rounded-3xl border border-line bg-ink/70 p-7 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-0 md:border-0 max-md:mt-[45svh]">
        <p className="eyebrow">{n}</p>
        <h2 className="display mt-4 text-4xl font-extrabold sm:text-6xl">{titulo}</h2>
        <p className="mt-5 text-base leading-relaxed text-bone/75 sm:text-lg">{texto}</p>
      </div>
    </div>
  );
}

export default function Inicio() {
  const base = PRODUCTOS[0];
  return (
    <>
      <EscenaScroll />
      <div className="relative z-10">
        {/* Hero */}
        <section data-pose="hero" className="mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 pt-16 sm:px-6">
          <div className="max-w-xl max-md:mt-[42svh] max-md:rounded-3xl max-md:bg-ink/70 max-md:p-6 max-md:backdrop-blur-md">
            <p className="eyebrow">Hecho en {TIENDA.ciudad} · Envíos a México y USA</p>
            <h1 className="display mt-5 text-5xl font-extrabold sm:text-7xl lg:text-8xl">
              Tu marca,
              <br />
              en la espalda
              <br />
              <span className="text-accent">de todos.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-bone/75">
              Sudaderas y playeras deportivas con tu logo, nombre o número grabado. Para tu equipo, tu empresa o tu generación.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/catalogo" className="inline-flex h-12 items-center rounded-full bg-bone px-6 font-medium text-ink transition-transform duration-200 hover:scale-[1.03]">
                Ver catálogo
              </Link>
              <a
                href={`https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent("Hola Dorsalwear, quiero cotizar sudaderas/playeras personalizadas.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center rounded-full border border-line px-6 font-medium transition-colors hover:border-bone/50"
              >
                Cotizar por WhatsApp
              </a>
            </div>
            {base.precio && base.oferta && (
              <p className="mt-6 text-sm text-muted">
                Sudaderas desde <span className="font-semibold text-bone">{mxn(base.oferta)}</span> <span className="line-through">{mxn(base.precio)}</span>
              </p>
            )}
          </div>
          <p className="eyebrow absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">Desliza</p>
        </section>

        <section data-pose="pecho">
          <Panel lado="der" n="01 — Al frente" titulo="Tu logo, al centro del pecho." texto="Grabamos tu logo o el de tu empresa al frente, con medidas pensadas para que se vea limpio y profesional." />
        </section>
        <section data-pose="espalda">
          <Panel lado="izq" n="02 — Espalda" titulo="Nombre y número que se leen de lejos." texto="El espacio más grande de la prenda: nombres, números, la generación o un diseño completo." />
        </section>
        <section data-pose="manga">
          <Panel lado="der" n="03 — Manga" titulo="El detalle que la hace tuya." texto="Iniciales, una bandera, el año o tu @. Pequeño, pero es lo que todos notan." />
        </section>
        <section data-pose="colores" className="flex min-h-[150svh] items-end justify-center px-4 pb-[18svh] sm:px-6">
          <div className="max-w-2xl rounded-3xl bg-ink/60 p-6 text-center backdrop-blur-md">
            <p className="eyebrow">04 — Color</p>
            <h2 className="display mt-4 text-4xl font-extrabold sm:text-6xl">Cinco colores base. Un solo estilo.</h2>
            <p className="mt-5 text-bone/75">Negro, gris jaspe, rojo, café y azul marino. Colores que combinan con cualquier logo o diseño.</p>
          </div>
        </section>

        {/* Contenido sólido */}
        <div className="relative bg-ink">
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-labelledby="destacados">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Catálogo</p>
                <h2 id="destacados" className="display mt-3 text-4xl font-extrabold sm:text-5xl">Elige tu base</h2>
              </div>
              <Link href="/catalogo" className="text-sm text-bone/70 underline-offset-4 hover:text-bone hover:underline">
                Ver todo →
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTOS.filter((p) => p.destacado).map((p) => (
                <ProductoCard key={p.slug} p={p} />
              ))}
            </div>
          </section>

          <section className="border-t border-line" aria-labelledby="coleccion">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Colección</p>
                  <h2 id="coleccion" className="display mt-3 text-4xl font-extrabold sm:text-5xl">Para programadores</h2>
                  <p className="mt-4 max-w-xl text-bone/75">15 diseños para quien vive entre código y café. En cualquiera de los 5 colores.</p>
                </div>
                <Link href="/catalogo#programadores" className="text-sm text-bone/70 underline-offset-4 hover:text-bone hover:underline">
                  Ver los 15 →
                </Link>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCTOS.filter((p) => p.diseno).slice(0, 6).map((p) => (
                  <ProductoCard key={p.slug} p={p} />
                ))}
              </div>
            </div>
          </section>

          <section id="como-funciona" className="border-t border-line" aria-labelledby="como">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
              <p className="eyebrow">Cómo funciona</p>
              <h2 id="como" className="display mt-3 max-w-2xl text-4xl font-extrabold sm:text-5xl">De tu idea a tu puerta en cuatro pasos.</h2>
              <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {PASOS.map((s) => (
                  <li key={s.n} className="bg-ink-2 p-7">
                    <p className="display text-5xl font-extrabold text-accent">{s.n}</p>
                    <h3 className="mt-6 text-lg font-semibold">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="border-t border-line" aria-labelledby="para">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
              <p className="eyebrow">Para quién</p>
              <h2 id="para" className="display mt-3 text-4xl font-extrabold sm:text-5xl">Para los que se visten igual a propósito.</h2>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {PARA.map((x) => (
                  <div key={x.t} className="rounded-3xl border border-line p-7 transition-colors hover:border-bone/30">
                    <h3 className="display text-2xl font-bold">{x.t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="preguntas" className="border-t border-line" aria-labelledby="faq">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="eyebrow">Preguntas</p>
                <h2 id="faq" className="display mt-3 text-4xl font-extrabold sm:text-5xl">Lo que todos preguntan.</h2>
              </div>
              <div className="divide-y divide-line border-y border-line">
                {FAQ.map((f) => (
                  <details key={f.p} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                      {f.p}
                      <span className="text-2xl text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-bone/70">{f.r}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-line">
            <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
              <h2 className="display mx-auto max-w-3xl text-5xl font-extrabold sm:text-7xl">
                ¿Listo para <span className="text-accent">uniformar</span> a los tuyos?
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/catalogo" className="inline-flex h-12 items-center rounded-full bg-bone px-7 font-medium text-ink transition-transform hover:scale-[1.03]">
                  Armar mi pedido
                </Link>
                <a href={`https://wa.me/${TIENDA.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full border border-line px-7 font-medium hover:border-bone/50">
                  Hablar por WhatsApp
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
