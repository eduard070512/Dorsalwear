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
  hex: string;
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
}

const NEUTROS: Color[] = [
  { id: "negro", nombre: "Negro", hex: "#1b1b1e" },
  { id: "gris", nombre: "Gris jaspe", hex: "#8e8e93" },
  { id: "hueso", nombre: "Blanco hueso", hex: "#e9e4da" },
  { id: "marino", nombre: "Azul marino", hex: "#1e2a45" },
  { id: "bosque", nombre: "Verde bosque", hex: "#28392e" },
];

export const PRODUCTOS: Producto[] = [
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
    colores: NEUTROS.slice(0, 4),
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["pecho", "espalda", "manga"],
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
    colores: [NEUTROS[0], NEUTROS[2], NEUTROS[3], { id: "rojo", nombre: "Rojo", hex: "#9e1f24" }],
    tallas: ["CH", "M", "G", "XG"],
    zonas: ["pecho", "espalda", "manga"],
    detalles: ["Tela ligera de secado rápido", "Cuello redondo", "Ideal para uniformes", "Nombre y número en espalda"],
    paquete: { pesoKg: 0.3, largo: 30, ancho: 25, alto: 4 },
    destacado: true,
  },
];

export const ZONAS: Record<Zona, { nombre: string; ayuda: string }> = {
  pecho: { nombre: "Pecho", ayuda: "Tu logo o marca al frente" },
  espalda: { nombre: "Espalda", ayuda: "Nombre, número o diseño grande" },
  manga: { nombre: "Manga", ayuda: "Detalle pequeño: iniciales, bandera, año" },
};

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
