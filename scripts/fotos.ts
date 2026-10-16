// Genera las fotos de catálogo (/public/productos/<slug>.webp) renderizando la prenda 3D.
// Uso: (cd public && python3 -m http.server 3078) y luego node scripts/fotos.mjs
import * as THREE from "three";
import { cargarPrenda, prepararEscena } from "../src/lib/prenda3d";
import { colorDeFoto, imagenDiseno, PRODUCTOS } from "../src/data/productos";

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
    const c = colorDeFoto(p);
    const pr = await cargarPrenda(p.tipo, c.tela, { pechoGrande: !!p.diseno });
    pr.group.rotation.y = -0.35;
    if (p.diseno) {
      // diseño al frente, sin recuadros de las demás zonas
      const img = new Image();
      img.src = imagenDiseno(p.diseno, c);
      await img.decode();
      pr.setLogo(img);
      for (const [z, m] of Object.entries(pr.zonas)) if (m) (m.material as THREE.MeshBasicMaterial).opacity = z === "pecho" ? 1 : 0;
      pr.group.rotation.y = -0.2;
    }
    scene.add(pr.group);
    r.render(scene, cam);
    out[p.slug] = r.domElement.toDataURL("image/png");
    scene.remove(pr.group);
    pr.dispose();
  }
  return out;
};
