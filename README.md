# Dorsalwear

Tienda en línea de sudaderas y playeras deportivas personalizadas (Next.js + three.js + GSAP).

- Inicio con prenda 3D que gira y se mueve con el scroll mostrando las zonas de grabado.
- Catálogo, producto con visor 3D (color, zonas, prueba de logo), carrito.
- Pedido por WhatsApp con mensaje precargado + datos de transferencia.
- Panel `/admin` (pedidos y estados) — requiere `ADMIN_PASSWORD` y `DATABASE_URL`.
- Envíos con Skydrop: programado pero **apagado** (`SKYDROP_ENABLED=false`); al activarlo aparece la cotización y el botón "Generar guía".

## Correr

```bash
npm install
cp .env.example .env.local   # llenar valores
npm run dev
```

## Modelo 3D

Va en `public/modelos/sudadera.glb` (y `playera.glb`). Si no existe se usa la prenda hecha con código
(`src/lib/hoodie.ts`). Si el modelo es CC BY, agregar el crédito en `src/data/creditos.ts`.

Fotos de catálogo a partir del 3D: `(cd public && python3 -m http.server 3078)` y `node scripts/fotos.mjs`.
