import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "dw_admin";
const DURA = 1000 * 60 * 60 * 24 * 14;

function firma(v: string): string {
  return createHmac("sha256", process.env.ADMIN_PASSWORD || "").update(v).digest("hex");
}

export function crearSesion(): string {
  const exp = String(Date.now() + DURA);
  return `${exp}.${firma(exp)}`;
}

export function sesionValida(token: string | undefined): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const [exp, f] = token.split(".");
  if (!exp || !f || Number(exp) < Date.now()) return false;
  const a = Buffer.from(f);
  const b = Buffer.from(firma(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordCorrecta(p: string): boolean {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  const a = Buffer.from(firma(p));
  const b = Buffer.from(firma(real));
  return timingSafeEqual(a, b);
}

export async function esAdmin(): Promise<boolean> {
  return sesionValida((await cookies()).get(COOKIE)?.value);
}
