import { NextRequest, NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { q } from "@/lib/db";

const ESTADOS = ["nuevo", "pagado", "enviado", "entregado", "cancelado"];

/** Cambia el estado del pedido (pagado, enviado...). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { estado } = (await req.json().catch(() => ({}))) as { estado?: string };
  if (!estado || !ESTADOS.includes(estado)) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  const [p] = await q(`UPDATE pedidos SET estado = $2, actualizado_en = now() WHERE id = $1 RETURNING id, estado`, [Number((await params).id), estado]);
  if (!p) return NextResponse.json({ error: "No existe." }, { status: 404 });
  return NextResponse.json({ ok: true, pedido: p });
}
