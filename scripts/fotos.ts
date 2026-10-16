// Genera las fotos de catálogo (/public/productos/<slug>.webp) renderizando la prenda 3D.
// Uso: (cd public && python3 -m http.server 3078) y luego node scripts/fotos.mjs
import * as THREE from "three";
import { cargarPrenda, prepararEscena } from "../src/lib/prenda3d";
import { colorDeFoto, PRODUCTOS } from "../src/data/productos";

const W = 1000, H = 1250;
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setSize(W, H);
document.body.appendChild(r.domElement);
const scene = new THREE.Scene();
prepararEscena(r, scene);
const cam = new THREE.PerspectiveCamera(28, W / H, 0.1, 50);
cam.position.set(0, 0.15, 6.1);

(window as unknown as { fotos: () => Promise<Record<string, string>> }).fotos = async () => {
  const out: Record<string, string> = {};
  for (const p of PRODUCTOS) {
    const pr = await cargarPrenda(p.tipo, colorDeFoto(p).hex);
    pr.group.rotation.y = -0.35;
    scene.add(pr.group);
    r.render(scene, cam);
    out[p.slug] = r.domElement.toDataURL("image/png");
    scene.remove(pr.group);
    pr.dispose();
  }
  return out;
};
