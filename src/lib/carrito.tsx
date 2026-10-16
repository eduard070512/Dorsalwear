"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Zona } from "@/data/productos";

export interface ItemCarrito {
  key: string;
  slug: string;
  color: string;
  talla: string;
  cantidad: number;
  zonas: Zona[];
  texto: string; // nombre / número / indicaciones de grabado
}

interface Ctx {
  items: ItemCarrito[];
  agregar: (i: Omit<ItemCarrito, "key">) => void;
  cambiar: (key: string, cantidad: number) => void;
  quitar: (key: string) => void;
  vaciar: () => void;
  piezas: number;
  listo: boolean;
}

const CarritoCtx = createContext<Ctx | null>(null);
const LLAVE = "dorsal.carrito.v1";

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem(LLAVE);
      if (g) setItems(JSON.parse(g));
    } catch {}
    setListo(true);
  }, []);
  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(LLAVE, JSON.stringify(items));
    } catch {}
  }, [items, listo]);

  const agregar = useCallback((i: Omit<ItemCarrito, "key">) => {
    const key = [i.slug, i.color, i.talla, [...i.zonas].sort().join("+"), i.texto.trim().toLowerCase()].join("|");
    setItems((xs) => {
      const ya = xs.find((x) => x.key === key);
      if (ya) return xs.map((x) => (x.key === key ? { ...x, cantidad: Math.min(500, x.cantidad + i.cantidad) } : x));
      return [...xs, { ...i, key }];
    });
  }, []);
  const cambiar = useCallback((key: string, cantidad: number) => {
    setItems((xs) => xs.map((x) => (x.key === key ? { ...x, cantidad: Math.max(1, Math.min(500, cantidad)) } : x)));
  }, []);
  const quitar = useCallback((key: string) => setItems((xs) => xs.filter((x) => x.key !== key)), []);
  const vaciar = useCallback(() => setItems([]), []);
  const piezas = useMemo(() => items.reduce((a, x) => a + x.cantidad, 0), [items]);

  return <CarritoCtx.Provider value={{ items, agregar, cambiar, quitar, vaciar, piezas, listo }}>{children}</CarritoCtx.Provider>;
}

export function useCarrito(): Ctx {
  const c = useContext(CarritoCtx);
  if (!c) throw new Error("useCarrito fuera de CarritoProvider");
  return c;
}
