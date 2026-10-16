import { DISENOS } from "./disenos";
/**
 * Catálogo. Precios en MXN. `oferta` es el precio con descuento (si no hay, se cobra `precio`).
 * `precio: null` = se cotiza por WhatsApp. Las fotos reales van en /public/productos; mientras no
 * haya, se usa el render 3D de la prenda en ese color.
 */
export type Tipo = "sudadera" | "playera";
export type Zona = "pecho" | "espalda" | "manga";

export interface Color {
  id: string;
  nombre: string;
  /** Color real (muestras y textos). */
  hex: string;
  /** Tono para la sudadera 3D: la luz del visor aclara la tela, así que va más oscuro que el real. */
  tela: string;
  /** Versión de los diseños que se ve bien sobre este color. */
  tinta: "claro" | "oscuro" | "mono";
}

export interface Producto {
  slug: string;
  nombre: string;
  tipo: Tipo;
  resumen: string;
  descripcion: string;
  precio: number | null;
  oferta?: number;
  colores: Color[];
  tallas: string[];
  zonas: Zona[];
  detalles: string[];
  /** Peso y medidas del paquete (para la guía de envío). */
  paquete: { pesoKg: number; largo: number; ancho: number; alto: number };
  destacado?: boolean;
  /** Color de la foto de catálogo (id); por defecto el primero. */
  colorFoto?: string;
  /** Diseño de la colección (id en data/disenos.ts) que va estampado grande al frente. */
  diseno?: string;
  /** Oculto en la tienda (p. ej. mientras no hay fotos o precio). */
  oculto?: boolean;
}

// Colores reales del proveedor (fotos de Edu, 2026-10-16).
export const NEUTROS: Color[] = [
  { id: "negro", nombre: "Negro", hex: "#1b1b1e", tela: "#1b1b1e", tinta: "claro" },
  { id: "gris", nombre: "Gris jaspe", hex: "#a9a9ad", tela: "#5a5a5e", tinta: "oscuro" },
  { id: "rojo", nombre: "Rojo", hex: "#c4122f", tela: "#6e0a19", tinta: "mono" },
  { id: "cafe", nombre: "Café", hex: "#7b4a2b", tela: "#3a2112", tinta: "mono" },
  { id: "marino", nombre: "Azul marino", hex: "#1c2541", tela: "#10172b", tinta: "claro" },
];

const TODOS: Producto[] = [
  {
    slug: "sudadera-capucha-clasica",
    nombre: "Sudadera Clásica con capucha",
    tipo: "sudadera",
    resumen: "Felpa suave, capucha con cordones y bolsa canguro.",
    descripcion:
      "La sudadera de diario, lista para llevar tu logo, tu nombre o el de tu equipo. Corte regular, puños y cintura de canalé, y una felpa que aguanta lavadas sin perder forma.",
    precio: 400,
    oferta: 360,
    colores: NEUTROS,
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["pecho", "espalda", "manga"],
    detalles: ["Felpa perchada por dentro", "Capucha forrada con cordones", "Bolsa canguro", "Puños y cintura de canalé"],
    paquete: { pesoKg: 0.8, largo: 35, ancho: 30, alto: 8 },
    destacado: true,
  },
  {
    slug: "sudadera-oversize",
    nombre: "Sudadera Oversize",
    tipo: "sudadera",
    resumen: "Corte amplio, hombro caído. Para equipos y generaciones.",
    descripcion:
      "Corte holgado de hombro caído, el favorito para generaciones, equipos y marcas. Espalda amplia para nombres y números grandes.",
    precio: 400,
    oferta: 360,
    colores: NEUTROS,
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["pecho", "espalda", "manga"],
    colorFoto: "gris",
    detalles: ["Corte oversize", "Capucha con cordones", "Bolsa canguro", "Espalda ideal para nombre y número"],
    paquete: { pesoKg: 0.9, largo: 35, ancho: 30, alto: 9 },
    destacado: true,
  },
  {
    slug: "playera-deportiva",
    nombre: "Playera Deportiva",
    tipo: "playera",
    resumen: "Tela ligera y fresca. Para entrenar, correr o uniformar a tu equipo.",
    descripcion:
      "Playera deportiva ligera que seca rápido. Perfecta para uniformes de equipo, carreras, gimnasios y eventos, con tu logo al frente y nombre o número en la espalda.",
    precio: null,
    colores: [NEUTROS[0], NEUTROS[1], NEUTROS[2], NEUTROS[4]],
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["pecho", "espalda", "manga"],
    detalles: ["Tela ligera de secado rápido", "Cuello redondo", "Ideal para uniformes", "Nombre y número en espalda"],
    paquete: { pesoKg: 0.3, largo: 30, ancho: 25, alto: 4 },
    destacado: true,
    oculto: true, // hasta tener fotos reales y precio
  },
];

// Colección "para programadores": una sudadera por diseño, mismos colores, tallas y precio que la clásica.
const COLORES_FOTO = ["negro", "marino", "rojo", "cafe", "gris"];
for (const [i, d] of DISENOS.entries()) {
  TODOS.push({
    slug: `diseno-${d.id}`,
    nombre: `Sudadera "${d.nombre}"`,
    tipo: "sudadera",
    resumen: d.desc,
    descripcion: `De la colección para programadores: "${d.nombre}" estampado grande al frente. ${d.desc}. Puedes agregar tu nombre en la espalda o un detalle en la manga.`,
    precio: 400,
    oferta: 360,
    colores: NEUTROS,
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["espalda", "manga"],
    detalles: ["Diseño estampado al frente", "Felpa perchada por dentro", "Capucha con cordones", "Bolsa canguro"],
    paquete: { pesoKg: 0.8, largo: 35, ancho: 30, alto: 8 },
    colorFoto: COLORES_FOTO[i % COLORES_FOTO.length],
    diseno: d.id,
  });
}

/** Imagen del diseño en la versión que se ve sobre ese color. */
export function imagenDiseno(id: string, c: Color): string {
  return `/disenos/${id}-${c.tinta}.png`;
}

/** Productos visibles en la tienda. */
export const PRODUCTOS = TODOS.filter((p) => !p.oculto);

export const ZONAS: Record<Zona, { nombre: string; ayuda: string }> = {
  pecho: { nombre: "Pecho", ayuda: "Tu logo o marca al frente" },
  espalda: { nombre: "Espalda", ayuda: "Nombre, número o diseño grande" },
  manga: { nombre: "Manga", ayuda: "Detalle pequeño: iniciales, bandera, año" },
};

export function colorDeFoto(p: Producto): Color {
  return p.colores.find((c) => c.id === p.colorFoto) ?? p.colores[0];
}

export function getProducto(slug: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.slug === slug);
}

/** Precio que se cobra por pieza (oferta si existe). */
export function precioFinal(p: Producto): number | null {
  return p.precio == null ? null : (p.oferta ?? p.precio);
}

export const TIENDA = {
  nombre: "Dorsalwear",
  whatsapp: "523121712462",
  ciudad: "Colima",
};

export function mxn(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}
