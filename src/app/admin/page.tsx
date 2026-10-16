import type { Metadata } from "next";
import { esAdmin } from "@/lib/auth";
import { hayBase, q } from "@/lib/db";
import { skydropActivo } from "@/lib/skydrop";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPedidos, { type PedidoAdmin } from "@/components/admin/AdminPedidos";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!process.env.ADMIN_PASSWORD)
    return <Aviso texto="Falta configurar ADMIN_PASSWORD en las variables de entorno." />;
  if (!(await esAdmin())) return <AdminLogin />;
  if (!hayBase()) return <Aviso texto="Los pedidos se están recibiendo solo por WhatsApp. Para verlos aquí, configura DATABASE_URL." />;
  const pedidos = await q<PedidoAdmin>(
    `SELECT id, folio, nombre, telefono, entrega, direccion, notas, lineas, total::float AS total, por_cotizar, estado, envio, creado_en::text
     FROM pedidos ORDER BY id DESC LIMIT 200`,
  );
  return <AdminPedidos inicial={pedidos} skydrop={skydropActivo()} />;
}

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center">
      <h1 className="display text-3xl font-extrabold">Panel</h1>
      <p className="mt-4 text-bone/70">{texto}</p>
    </div>
  );
}
