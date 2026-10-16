import type { Metadata } from "next";
import Carrito from "@/components/Carrito";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function CarritoPage() {
  return <Carrito />;
}
