import { NextRequest, NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { q } from "@/lib/db";
import { cotizarEnvio, crearGuia, skydropActivo } from "@/lib/skydrop";
import type { LineaPedido, PedidoEntrada } from "@/lib/pedido";

/**
 * Genera la guía de Skydrop de un pedido pagado (apagado mientras SKYDROP_ENABLED no sea "true").
 * Sin `tarifa` devuelve las tarifas disponibles; con `tarifa` crea la guía y la guarda en el pedido.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!skydropActivo()) return NextResponse.json({ error: "No disponible." }, { status: 404 });
  if (!(await esAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = Number((await params).id);
  const [p] = await q<{ entrega: string; estado: string; direccion: PedidoEntrada["direccion"]; lineas: LineaPedido[] }>(
    `SELECT entrega, estado, direccion, lineas FROM pedidos WHERE id = $1`,
    [id],
  );
  if (!p) return NextResponse.json({ error: "No existe." }, { status: 404 });
  if (p.entrega !== "domicilio" || !p.direccion) return NextResponse.json({ error: "El pedido no es con envío a domicilio." }, { status: 400 });
  if (p.estado !== "pagado") return NextResponse.json({ error: "Primero marca el pedido como pagado." }, { status: 400 });
  const { tarifa } = (await req.json().catch(() => ({}))) as { tarifa?: string };
  try {
    if (!tarifa) return NextResponse.json({ tarifas: await cotizarEnvio(p.direccion, p.lineas) });
    const g = await crearGuia(tarifa);
    await q(`UPDATE pedidos SET envio = $2, estado = 'enviado', actualizado_en = now() WHERE id = $1`, [id, JSON.stringify(g)]);
    return NextResponse.json({ ok: true, guia: g });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
