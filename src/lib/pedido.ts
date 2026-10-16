import { getProducto, mxn, precioFinal, TIENDA, ZONAS, type Zona } from "@/data/productos";

export type Entrega = "local" | "domicilio";

export interface PedidoEntrada {
  nombre: string;
  telefono: string;
  entrega: Entrega;
  direccion?: { calle: string; colonia: string; cp: string; ciudad: string; estado: string; pais: "MX" | "US"; referencias?: string };
  notas?: string;
  items: { slug: string; color: string; talla: string; cantidad: number; zonas: Zona[]; texto: string }[];
}

export interface LineaPedido {
  slug: string;
  nombre: string;
  color: string;
  talla: string;
  cantidad: number;
  zonas: Zona[];
  texto: string;
  unitario: number | null;
  subtotal: number | null;
}

export interface PedidoCalculado {
  lineas: LineaPedido[];
  total: number;
  porCotizar: boolean; // hay prendas sin precio publicado
  piezas: number;
}

/** Recalcula precios con el catálogo (nunca se confía en lo que manda el navegador). */
export function calcularPedido(e: PedidoEntrada): PedidoCalculado {
  const lineas: LineaPedido[] = [];
  for (const i of e.items.slice(0, 50)) {
    const p = getProducto(i.slug);
    if (!p) throw new Error("Producto no encontrado.");
    const color = p.colores.find((c) => c.id === i.color);
    if (!color) throw new Error(`Color no válido para ${p.nombre}.`);
    if (!p.tallas.includes(i.talla)) throw new Error(`Talla no válida para ${p.nombre}.`);
    const cantidad = Math.max(1, Math.min(500, Math.floor(Number(i.cantidad) || 1)));
    const unitario = precioFinal(p);
    lineas.push({
      slug: p.slug,
      nombre: p.nombre,
      color: color.nombre,
      talla: i.talla,
      cantidad,
      zonas: (i.zonas || []).filter((z) => p.zonas.includes(z)),
      texto: String(i.texto || "").slice(0, 200),
      unitario,
      subtotal: unitario == null ? null : unitario * cantidad,
    });
  }
  if (!lineas.length) throw new Error("El carrito está vacío.");
  return {
    lineas,
    total: lineas.reduce((a, l) => a + (l.subtotal ?? 0), 0),
    porCotizar: lineas.some((l) => l.unitario == null),
    piezas: lineas.reduce((a, l) => a + l.cantidad, 0),
  };
}

export function datosBanco(): { banco: string; titular: string; clabe: string } | null {
  const banco = process.env.BANCO_NOMBRE?.trim();
  const titular = process.env.BANCO_TITULAR?.trim();
  const clabe = process.env.BANCO_CLABE?.trim();
  return banco && titular && clabe ? { banco, titular, clabe } : null;
}

/** Mensaje de WhatsApp con todo el pedido, listo para enviar. */
export function mensajeWhatsApp(folio: string, e: PedidoEntrada, c: PedidoCalculado): string {
  const l: string[] = [];
  l.push(`Hola Dorsalwear 👋 Quiero hacer este pedido:`);
  l.push(`*Pedido ${folio}*`);
  l.push("");
  for (const x of c.lineas) {
    l.push(`• ${x.cantidad} × ${x.nombre} — ${x.color}, talla ${x.talla}${x.subtotal != null ? ` — ${mxn(x.subtotal)}` : " — por cotizar"}`);
    if (x.zonas.length) l.push(`   Grabado: ${x.zonas.map((z) => ZONAS[z].nombre).join(", ")}${x.texto ? ` · "${x.texto}"` : ""}`);
    else if (x.texto) l.push(`   Nota: "${x.texto}"`);
  }
  l.push("");
  l.push(`*Total prendas:* ${mxn(c.total)}${c.porCotizar ? " + lo que se cotice" : ""}`);
  if (e.entrega === "local") l.push(`*Entrega:* en ${TIENDA.ciudad}`);
  else if (e.direccion) {
    const d = e.direccion;
    l.push(`*Envío a domicilio:* ${d.calle}, ${d.colonia}, CP ${d.cp}, ${d.ciudad}, ${d.estado}, ${d.pais === "US" ? "Estados Unidos" : "México"}${d.referencias ? ` (${d.referencias})` : ""}`);
    l.push(`(Costo de envío por confirmar)`);
  }
  l.push(`*Nombre:* ${e.nombre}`);
  l.push(`*Teléfono:* ${e.telefono}`);
  if (e.notas) l.push(`*Notas:* ${e.notas}`);
  if (c.lineas.some((x) => x.zonas.length)) {
    l.push("");
    l.push("Te mando mi logo/diseño por aquí 👇");
  }
  return l.join("\n");
}

export function linkWhatsApp(texto: string): string {
  return `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export function nuevoFolio(): string {
  const d = new Date();
  const f = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `DW-${f}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
