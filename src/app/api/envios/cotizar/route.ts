import { NextRequest, NextResponse } from "next/server";
import { cotizarEnvio, skydropActivo } from "@/lib/skydrop";
import type { PedidoEntrada } from "@/lib/pedido";

/** Cotización de envío con Skydrop. Apagado (404) mientras SKYDROP_ENABLED no sea "true". */
export async function POST(req: NextRequest) {
  if (!skydropActivo()) return NextResponse.json({ error: "No disponible." }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as { direccion?: PedidoEntrada["direccion"]; items?: { slug: string; cantidad: number }[] };
  if (!b.direccion?.cp || !b.items?.length) return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  try {
    return NextResponse.json({ tarifas: await cotizarEnvio(b.direccion, b.items) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
