/**
 * Envíos con Skydrop — LISTO PERO APAGADO.
 *
 * Se activa con SKYDROP_ENABLED=true + SKYDROP_API_KEY (y la dirección de origen SKYDROP_ORIGEN_*).
 * Mientras esté apagado: el cliente no ve cotización automática (el envío se confirma por
 * WhatsApp) y en /admin no aparece "Generar guía".
 *
 * Flujo previsto: el cliente elige "envío a domicilio" → se cotiza con `cotizarEnvio` →
 * el admin marca el pedido como pagado → "Generar guía" llama a `crearGuia` con la tarifa
 * elegida → la guía (PDF + número de rastreo) se manda al cliente por WhatsApp desde el panel.
 *
 * Nota: los endpoints siguen la API pública v1 de Skydrop (shipments / labels). Al activar,
 * validar contra la documentación de la cuenta (sandbox primero).
 */
import { getProducto } from "@/data/productos";
import type { LineaPedido, PedidoEntrada } from "@/lib/pedido";

export function skydropActivo(): boolean {
  return process.env.SKYDROP_ENABLED === "true" && Boolean(process.env.SKYDROP_API_KEY);
}

export interface Tarifa {
  id: string;
  paqueteria: string;
  servicio: string;
  dias: number | null;
  precio: number;
}

function base(): string {
  return (process.env.SKYDROP_API_URL || "https://api.skydrop.com.mx/v1").replace(/\/$/, "");
}

async function llamar<T>(ruta: string, cuerpo?: unknown): Promise<T> {
  const r = await fetch(base() + ruta, {
    method: cuerpo ? "POST" : "GET",
    headers: { Authorization: `Token token=${process.env.SKYDROP_API_KEY}`, "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!r.ok) throw new Error(`Skydrop respondió ${r.status}`);
  return (await r.json()) as T;
}

/** Un solo paquete con el peso sumado y la caja más grande de las prendas. */
function paquete(lineas: Pick<LineaPedido, "slug" | "cantidad">[]) {
  let peso = 0, largo = 20, ancho = 20, alto = 2;
  for (const l of lineas) {
    const p = getProducto(l.slug)?.paquete;
    if (!p) continue;
    peso += p.pesoKg * l.cantidad;
    largo = Math.max(largo, p.largo);
    ancho = Math.max(ancho, p.ancho);
    alto += p.alto * l.cantidad;
  }
  return { weight: Math.max(1, Math.ceil(peso)), length: largo, width: ancho, height: Math.min(alto, 80) };
}

function origen() {
  return {
    name: process.env.SKYDROP_ORIGEN_NOMBRE || "Dorsalwear",
    phone: process.env.SKYDROP_ORIGEN_TELEFONO || "",
    address1: process.env.SKYDROP_ORIGEN_CALLE || "",
    area_level3: process.env.SKYDROP_ORIGEN_COLONIA || "",
    city: process.env.SKYDROP_ORIGEN_CIUDAD || "Colima",
    province: process.env.SKYDROP_ORIGEN_ESTADO || "Colima",
    zip: process.env.SKYDROP_ORIGEN_CP || "",
    country: "MX",
  };
}

export async function cotizarEnvio(destino: NonNullable<PedidoEntrada["direccion"]>, lineas: Pick<LineaPedido, "slug" | "cantidad">[]): Promise<Tarifa[]> {
  if (!skydropActivo()) throw new Error("Envíos automáticos desactivados.");
  type Resp = { included?: { id: string; type: string; attributes: { provider: string; service_level_name: string; days: number | null; total_pricing: string } }[] };
  const r = await llamar<Resp>("/shipments", {
    address_from: origen(),
    address_to: { zip: destino.cp, country: destino.pais, city: destino.ciudad, province: destino.estado },
    parcels: [paquete(lineas)],
  });
  return (r.included || [])
    .filter((x) => x.type === "rates")
    .map((x) => ({ id: x.id, paqueteria: x.attributes.provider, servicio: x.attributes.service_level_name, dias: x.attributes.days, precio: Number(x.attributes.total_pricing) }))
    .sort((a, b) => a.precio - b.precio);
}

export async function crearGuia(tarifaId: string): Promise<{ guia: string; pdf: string; rastreo: string }> {
  if (!skydropActivo()) throw new Error("Envíos automáticos desactivados.");
  type Resp = { data: { attributes: { tracking_number: string; label_url: string; tracking_url_provider: string } } };
  const r = await llamar<Resp>("/labels", { rate_id: tarifaId, label_format: "pdf" });
  const a = r.data.attributes;
  return { guia: a.tracking_number, pdf: a.label_url, rastreo: a.tracking_url_provider };
}
