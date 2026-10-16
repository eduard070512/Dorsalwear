import { Pool } from "pg";

/** Base de datos opcional: sin DATABASE_URL la tienda funciona y los pedidos solo llegan por WhatsApp. */
export function hayBase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

const g = globalThis as unknown as { __dwPool?: Pool; __dwTabla?: Promise<unknown> };

function pool(): Pool {
  g.__dwPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return g.__dwPool;
}

const ESQUEMA = `CREATE TABLE IF NOT EXISTS pedidos (
  id            serial PRIMARY KEY,
  folio         text UNIQUE NOT NULL,
  nombre        text NOT NULL,
  telefono      text NOT NULL,
  entrega       text NOT NULL,          -- local | domicilio
  direccion     jsonb,
  notas         text,
  lineas        jsonb NOT NULL,
  total         numeric NOT NULL,
  por_cotizar   boolean NOT NULL DEFAULT false,
  estado        text NOT NULL DEFAULT 'nuevo', -- nuevo | pagado | enviado | entregado | cancelado
  envio         jsonb,                  -- cotización / guía de Skydrop (cuando se active)
  creado_en     timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
)`;

export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  g.__dwTabla ??= pool().query(ESQUEMA).catch((e) => {
    g.__dwTabla = undefined;
    throw e;
  });
  await g.__dwTabla;
  return (await pool().query(sql, params)).rows as T[];
}
