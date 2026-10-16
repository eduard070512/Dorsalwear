import { NextRequest, NextResponse } from "next/server";
import { calcularPedido, datosBanco, linkWhatsApp, mensajeWhatsApp, nuevoFolio, type PedidoEntrada } from "@/lib/pedido";
import { hayBase, q } from "@/lib/db";

/** Crea el pedido: recalcula precios, lo guarda (si hay base) y devuelve el link de WhatsApp ya escrito. */
export async function POST(req: NextRequest) {
  const e = (await req.json().catch(() => null)) as PedidoEntrada | null;
  if (!e) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  const nombre = String(e.nombre || "").trim().slice(0, 120);
  const telefono = String(e.telefono || "").replace(/[^\d+]/g, "").slice(0, 20);
  if (nombre.length < 2) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
  if (telefono.replace(/\D/g, "").length < 10) return NextResponse.json({ error: "Escribe un teléfono de 10 dígitos." }, { status: 400 });
  const entrega = e.entrega === "domicilio" ? "domicilio" : "local";
  let direccion: PedidoEntrada["direccion"];
  if (entrega === "domicilio") {
    const d = e.direccion;
    if (!d || !d.calle?.trim() || !d.cp?.trim() || !d.ciudad?.trim() || !d.estado?.trim())
      return NextResponse.json({ error: "Completa la dirección de envío." }, { status: 400 });
    direccion = {
      calle: d.calle.trim().slice(0, 200),
      colonia: String(d.colonia || "").trim().slice(0, 120),
      cp: d.cp.trim().slice(0, 10),
      ciudad: d.ciudad.trim().slice(0, 80),
      estado: d.estado.trim().slice(0, 80),
      pais: d.pais === "US" ? "US" : "MX",
      referencias: String(d.referencias || "").trim().slice(0, 200),
    };
  }
  const entrada: PedidoEntrada = { nombre, telefono, entrega, direccion, notas: String(e.notas || "").trim().slice(0, 500), items: e.items || [] };

  let calc;
  try {
    calc = calcularPedido(entrada);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const folio = nuevoFolio();
  let guardado = false;
  if (hayBase()) {
    try {
      await q(
        `INSERT INTO pedidos (folio, nombre, telefono, entrega, direccion, notas, lineas, total, por_cotizar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [folio, nombre, telefono, entrega, direccion ? JSON.stringify(direccion) : null, entrada.notas || null, JSON.stringify(calc.lineas), calc.total, calc.porCotizar],
      );
      guardado = true;
    } catch (err) {
      console.error("No se pudo guardar el pedido", err);
    }
  }

  return NextResponse.json({
    folio,
    guardado,
    total: calc.total,
    porCotizar: calc.porCotizar,
    whatsapp: linkWhatsApp(mensajeWhatsApp(folio, entrada, calc)),
    banco: datosBanco(),
  });
}
