import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { crearSudadera } from "./hoodie";
import type { Tipo, Zona } from "@/data/productos";

/**
 * Prenda 3D para la web: usa el modelo real (GLB en /public/modelos) y, si no existe o falla,
 * la prenda hecha con código. Normaliza tamaño/posición, permite cambiar el color (la textura
 * original se pasa a gris para que el color se vea fiel) y pone el logo/recuadros como
 * calcomanías (decals) proyectadas sobre la tela en pecho, espalda y manga.
 */
export interface Prenda {
  group: THREE.Group;
  setColor: (hex: string) => void;
  setLogo: (img: HTMLImageElement | null) => void;
  /** Opacidad de los recuadros de cada zona (0 = ocultos). */
  zonas: Record<Zona, THREE.Mesh | null>;
  dispose: () => void;
}

export const MODELOS: Record<Tipo, string> = {
  sudadera: "/modelos/sudadera.glb",
  playera: "/modelos/playera.glb",
};

const ALTO = 2.2; // alto final de la prenda en unidades de escena

export function prepararEscena(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight("#ffffff", 2.0);
  key.position.set(2.5, 3, 3.5);
  const rim = new THREE.DirectionalLight("#ffc6a6", 1.4);
  rim.position.set(-3, 1.6, -2.5);
  const fill = new THREE.HemisphereLight("#f3f0ea", "#1a1a1d", 0.5);
  scene.add(key, rim, fill);
  pm.dispose();
}

// Textura de recuadro (zona vacía) o del logo del cliente.
function texturaZona(texto: string, logo: HTMLImageElement | null): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  if (logo) {
    const w = logo.naturalWidth || logo.width, h = logo.naturalHeight || logo.height;
    const k = Math.min(460 / w, 460 / h);
    g.drawImage(logo, 256 - (w * k) / 2, 256 - (h * k) / 2, w * k, h * k);
  } else {
    g.strokeStyle = "rgba(255,255,255,.95)";
    g.lineWidth = 9;
    g.setLineDash([30, 20]);
    g.strokeRect(20, 20, 472, 472);
    g.fillStyle = "rgba(255,255,255,.95)";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "700 62px Archivo, Arial, sans-serif";
    g.fillText(texto, 256, 236);
    g.font = "500 38px Archivo, Arial, sans-serif";
    g.fillText("AQUÍ", 256, 304);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Pasa la textura base a gris (luminancia) para poder teñirla de cualquier color.
function aGris(tex: THREE.Texture): THREE.Texture {
  const img = tex.image as HTMLImageElement | ImageBitmap | undefined;
  if (!img || !("width" in img)) return tex;
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d")!;
  g.drawImage(img as CanvasImageSource, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height);
  let suma = 0;
  for (let i = 0; i < d.data.length; i += 4) suma += 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
  const media = suma / (d.data.length / 4) || 128;
  for (let i = 0; i < d.data.length; i += 4) {
    // Normaliza al gris medio para conservar pliegues y textura sin oscurecer el color.
    const l = (0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2]) / media;
    const v = Math.max(0, Math.min(255, 215 * l));
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = tex.flipY;
  t.wrapS = tex.wrapS;
  t.wrapT = tex.wrapT;
  return t;
}

async function cargarGLB(url: string): Promise<THREE.Group | null> {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (!head.ok) return null;
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    loader.setDRACOLoader(draco);
    const gltf = await loader.loadAsync(url);
    return gltf.scene;
  } catch {
    return null;
  }
}

export async function cargarPrenda(tipo: Tipo, color: string): Promise<Prenda> {
  const modelo = await cargarGLB(MODELOS[tipo]);
  if (!modelo) {
    const h = crearSudadera(color, { tipo });
    return { group: h.group, setColor: h.setColor, setLogo: h.setLogo, zonas: h.zonas, dispose: h.dispose };
  }

  // Normaliza: centrado, alto fijo, mirando a +Z.
  const caja = new THREE.Box3().setFromObject(modelo);
  const tam = caja.getSize(new THREE.Vector3());
  const centro = caja.getCenter(new THREE.Vector3());
  const k = ALTO / tam.y;
  modelo.position.sub(centro).multiplyScalar(k);
  modelo.scale.multiplyScalar(k);
  const group = new THREE.Group();
  group.add(modelo);
  group.updateMatrixWorld(true);

  const telas: THREE.MeshStandardMaterial[] = [];
  const mallas: THREE.Mesh[] = [];
  modelo.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    mallas.push(m);
    const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
    const nuevos = mats.map((mat) => {
      const n = mat.clone();
      if (n.map) n.map = aGris(n.map);
      n.color = new THREE.Color(color);
      if ("sheen" in n) {
        const f = n as unknown as THREE.MeshPhysicalMaterial;
        f.sheen = 0.6;
        f.sheenRoughness = 0.6;
      }
      telas.push(n);
      return n;
    });
    m.material = Array.isArray(m.material) ? nuevos : nuevos[0];
  });

  // Puntos de cada zona: rayo desde fuera hacia la tela.
  const b = new THREE.Box3().setFromObject(group);
  const s = b.getSize(new THREE.Vector3());
  const ray = new THREE.Raycaster();
  const golpe = (origen: THREE.Vector3, dir: THREE.Vector3) => {
    ray.set(origen, dir.normalize());
    return ray.intersectObjects(mallas, false)[0] ?? null;
  };
  const objetivos: Record<Zona, { o: THREE.Vector3; d: THREE.Vector3; tam: number; txt: string }> = {
    pecho: { o: new THREE.Vector3(0, b.max.y - s.y * 0.36, b.max.z + 1), d: new THREE.Vector3(0, 0, -1), tam: s.x * 0.24, txt: "TU LOGO" },
    espalda: { o: new THREE.Vector3(0, b.max.y - s.y * 0.48, b.min.z - 1), d: new THREE.Vector3(0, 0, 1), tam: s.x * 0.36, txt: "TU NOMBRE" },
    manga: { o: new THREE.Vector3(b.min.x - 1, b.max.y - s.y * 0.42, 0), d: new THREE.Vector3(1, 0, 0), tam: s.x * 0.1, txt: "#" },
  };
  const zonas: Record<Zona, THREE.Mesh | null> = { pecho: null, espalda: null, manga: null };
  const crearZonas = (logo: HTMLImageElement | null) => {
    for (const z of Object.keys(objetivos) as Zona[]) {
      const prev = zonas[z];
      const opacidad = prev ? (prev.material as THREE.MeshBasicMaterial).opacity : 0;
      if (prev) {
        group.remove(prev);
        prev.geometry.dispose();
        (prev.material as THREE.MeshBasicMaterial).map?.dispose();
        (prev.material as THREE.Material).dispose();
      }
      // En la manga el rayo puede pegar primero en el torso: se busca a lo largo de Z.
      const t = objetivos[z];
      const h = golpe(t.o.clone(), t.d.clone());
      if (!h || !h.face) {
        zonas[z] = null;
        continue;
      }
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
      const orient = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n));
      const geo = new DecalGeometry(h.object as THREE.Mesh, h.point, orient, new THREE.Vector3(t.tam, t.tam, t.tam * 1.5));
      const mat = new THREE.MeshBasicMaterial({
        map: texturaZona(t.txt, z === "pecho" ? logo : null),
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        opacity: opacidad,
      });
      const mesh = new THREE.Mesh(geo, mat);
      // DecalGeometry está en coordenadas de mundo; el grupo aún no se ha movido.
      group.add(mesh);
      zonas[z] = mesh;
    }
  };
  crearZonas(null);

  return {
    group,
    zonas,
    setColor(hex) {
      for (const t of telas) t.color.set(hex);
    },
    setLogo(img) {
      // Recalcular en pose neutra (las calcomanías se proyectan en coordenadas de mundo).
      const pos = group.position.clone(), rot = group.rotation.clone(), esc = group.scale.clone();
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      group.scale.set(1, 1, 1);
      group.updateMatrixWorld(true);
      crearZonas(img);
      group.position.copy(pos);
      group.rotation.copy(rot);
      group.scale.copy(esc);
    },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => {
            (x as THREE.MeshStandardMaterial).map?.dispose();
            x.dispose();
          });
        }
      });
    },
  };
}
