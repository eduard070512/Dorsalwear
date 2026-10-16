import * as THREE from "three";

/**
 * Sudadera 3D hecha con código (sin modelos externos): silueta extruida e "inflada",
 * capucha, bolsa canguro, puños, resorte y cordones. Expone las zonas de grabado
 * (pecho, espalda, manga) para resaltarlas con el scroll.
 */
export interface Hoodie {
  group: THREE.Group;
  zonas: Record<"pecho" | "espalda" | "manga", THREE.Mesh>;
  setColor: (hex: string) => void;
  setLogo: (img: HTMLImageElement | HTMLCanvasElement | null) => void;
  dispose: () => void;
}

// Textura de tejido (felpa) para el normal map: ruido fino + canalé vertical leve.
function texturaTejido(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const img = g.createImageData(s, s);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const n = Math.random() * 18 + Math.sin(x * 1.6) * 6;
      const i = (y * s + x) * 4;
      img.data[i] = 128 + n - 12;
      img.data[i + 1] = 128 + (Math.random() * 18 - 9);
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

// Textura de canalé (puños y resorte).
function texturaCanale(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 8;
  const g = c.getContext("2d")!;
  for (let x = 0; x < 64; x++) {
    const v = 128 + Math.sin((x / 64) * Math.PI * 16) * 90;
    g.fillStyle = `rgb(${v},128,255)`;
    g.fillRect(x, 0, 1, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Placa de zona de grabado: recuadro punteado + texto, o el logo del cliente.
function texturaZona(texto: string, logo: HTMLImageElement | HTMLCanvasElement | null): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 512);
  if (logo) {
    const w = (logo as HTMLImageElement).naturalWidth || logo.width;
    const h = (logo as HTMLImageElement).naturalHeight || logo.height;
    const k = Math.min(440 / w, 440 / h);
    g.drawImage(logo, 256 - (w * k) / 2, 256 - (h * k) / 2, w * k, h * k);
  } else {
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 10;
    g.setLineDash([34, 22]);
    g.strokeRect(24, 24, 464, 464);
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.font = "700 64px Archivo, Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, 256, 230);
    g.font = "500 40px Archivo, Arial, sans-serif";
    g.fillText("AQUÍ", 256, 300);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Inflado: aleja del plano medio los vértices interiores (cuerpo "relleno" en vez de lámina). */
function inflar(geo: THREE.BufferGeometry, cuanto: number, ancho: number, alto: number, cx = 0, cy = 0) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = (p.getX(i) - cx) / ancho;
    const y = (p.getY(i) - cy) / alto;
    const z = p.getZ(i);
    const f = Math.max(0, Math.cos(Math.min(1, Math.abs(x)) * Math.PI * 0.5)) * Math.max(0.35, Math.cos(Math.min(1, Math.abs(y)) * Math.PI * 0.45));
    p.setZ(i, z + Math.sign(z) * cuanto * f);
  }
  geo.computeVertexNormals();
}

export interface OpcionesPrenda {
  /** "sudadera" (capucha, bolsa, manga larga) o "playera" (cuello redondo, manga corta). */
  tipo?: "sudadera" | "playera";
}

export function crearSudadera(colorInicial = "#1d1d20", { tipo = "sudadera" }: OpcionesPrenda = {}): Hoodie {
  const esPlayera = tipo === "playera";
  const group = new THREE.Group();
  const normal = texturaTejido();
  const canale = texturaCanale();
  const tela = new THREE.MeshPhysicalMaterial({
    color: colorInicial,
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#ffffff").multiplyScalar(0.35),
    normalMap: normal,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });
  const telaCanale = tela.clone();
  telaCanale.normalMap = canale;
  telaCanale.normalScale = new THREE.Vector2(0.6, 0.6);
  const telaInterior = new THREE.MeshPhysicalMaterial({ color: colorInicial, roughness: 1, side: THREE.BackSide });
  const mats = [tela, telaCanale, telaInterior];

  // ---- Torso (silueta de frente, unidades ~ metros/2) ----
  const torso = new THREE.Shape();
  torso.moveTo(-0.62, -1.0);
  torso.lineTo(0.62, -1.0);
  torso.bezierCurveTo(0.66, -0.4, 0.66, 0.3, 0.64, 0.55); // costado
  torso.bezierCurveTo(0.6, 0.78, 0.4, 0.86, 0.2, 0.9); // hombro
  torso.quadraticCurveTo(0, 0.8, -0.2, 0.9); // cuello
  torso.bezierCurveTo(-0.4, 0.86, -0.6, 0.78, -0.64, 0.55);
  torso.bezierCurveTo(-0.66, 0.3, -0.66, -0.4, -0.62, -1.0);
  const torsoGeo = new THREE.ExtrudeGeometry(torso, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 10, curveSegments: 40, steps: 1 });
  torsoGeo.translate(0, 0, -0.08);
  inflar(torsoGeo, 0.09, 0.7, 1.0);
  const torsoMesh = new THREE.Mesh(torsoGeo, tela);
  group.add(torsoMesh);

  // ---- Mangas (tubo cónico curvado que cae desde el hombro) ----
  const manga = (lado: 1 | -1) => {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(lado * 0.5, 0.66, 0),
      new THREE.Vector3(lado * 0.82, 0.38, 0.02),
      ...(esPlayera
        ? [new THREE.Vector3(lado * 0.92, 0.12, 0.03)]
        : [new THREE.Vector3(lado * 0.98, -0.2, 0.06), new THREE.Vector3(lado * 1.02, -0.72, 0.1)]),
    ]);
    const segs = 48;
    const geo = new THREE.TubeGeometry(curva, segs, 1, 28, false);
    // Radio variable: ancho en el hombro, angosto en el puño.
    const p = geo.attributes.position as THREE.BufferAttribute;
    const centro = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      const anillo = Math.floor(i / 29);
      const t = anillo / segs;
      curva.getPointAt(t, centro);
      const r = esPlayera ? THREE.MathUtils.lerp(0.25, 0.2, t) : THREE.MathUtils.lerp(0.25, 0.135, Math.pow(t, 0.8));
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).sub(centro).normalize();
      v.z *= 0.92;
      p.setXYZ(i, centro.x + v.x * r, centro.y + v.y * r, centro.z + v.z * r);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, tela);
    group.add(m);
    // Puño de canalé
    const fin = curva.getPointAt(1);
    const tang = curva.getTangentAt(1);
    const puno = esPlayera
      ? new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.2, 0.05, 32, 1, true), tela)
      : new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.16, 32, 1, true), telaCanale);
    puno.position.copy(fin).addScaledVector(tang, esPlayera ? 0.0 : 0.06);
    puno.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tang);
    group.add(puno);
    const tapa = new THREE.Mesh(new THREE.CircleGeometry(esPlayera ? 0.198 : 0.13, 32), new THREE.MeshBasicMaterial({ color: "#050505" }));
    tapa.position.copy(fin).addScaledVector(tang, esPlayera ? 0.024 : 0.139);
    tapa.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tang);
    group.add(tapa);
    return { curva, mesh: m };
  };
  manga(1);
  const izq = manga(-1);

  // ---- Resorte de la cintura ----
  if (!esPlayera) {
  const resorte = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.16, 64, 1, true), telaCanale);
  resorte.scale.set(0.66, 1, 0.24);
  resorte.position.set(0, -1.02, 0);
  group.add(resorte);
  const resorteTapa = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color: "#050505" }));
  resorteTapa.rotation.x = Math.PI / 2;
  resorteTapa.scale.set(0.64, 0.22, 1);
  resorteTapa.position.set(0, -1.099, 0);
  group.add(resorteTapa);
  }

  // ---- Capucha (caída sobre la espalda) ----
  if (!esPlayera) {
  const capGeo = new THREE.SphereGeometry(0.4, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const capucha = new THREE.Mesh(capGeo, tela);
  capucha.scale.set(0.92, 0.28, 1.45);
  capucha.rotation.x = -Math.PI * 0.5 - 0.06;
  capucha.position.set(0, 0.42, -0.17);
  group.add(capucha);
  const capIn = new THREE.Mesh(capGeo, telaInterior);
  capIn.scale.copy(capucha.scale).multiplyScalar(0.97);
  capIn.rotation.copy(capucha.rotation);
  capIn.position.copy(capucha.position);
  group.add(capIn);
  }
  // Cuello (anillo que une capucha y torso)
  const cuello = new THREE.Mesh(esPlayera ? new THREE.TorusGeometry(0.2, 0.03, 16, 56) : new THREE.TorusGeometry(0.22, 0.085, 20, 56), esPlayera ? telaCanale : tela);
  cuello.rotation.x = Math.PI / 2 - 0.35;
  cuello.scale.set(1.15, 1, 0.95);
  cuello.position.set(0, 0.86, 0.0);
  group.add(cuello);

  // ---- Cordones ----
  if (!esPlayera) {
  const cordonMat = new THREE.MeshStandardMaterial({ color: "#efece6", roughness: 0.7 });
  for (const lado of [-1, 1]) {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(lado * 0.08, 0.8, 0.26),
      new THREE.Vector3(lado * 0.09, 0.66, 0.31),
      new THREE.Vector3(lado * 0.1, 0.5, 0.31),
    ]);
    const c = new THREE.Mesh(new THREE.TubeGeometry(curva, 20, 0.012, 8, false), cordonMat);
    group.add(c);
    const punta = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 12), new THREE.MeshStandardMaterial({ color: "#c9c4ba", metalness: 0.6, roughness: 0.35 }));
    punta.position.set(lado * 0.1, 0.47, 0.31);
    group.add(punta);
  }
  }

  // ---- Bolsa canguro ----
  if (!esPlayera) {
  const bolsa = new THREE.Shape();
  bolsa.moveTo(-0.4, -0.78);
  bolsa.lineTo(0.4, -0.78);
  bolsa.lineTo(0.4, -0.42);
  bolsa.lineTo(0.26, -0.3);
  bolsa.lineTo(-0.26, -0.3);
  bolsa.lineTo(-0.4, -0.42);
  bolsa.closePath();
  const bolsaGeo = new THREE.ExtrudeGeometry(bolsa, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 8 });
  // La bolsa sigue la curvatura del frente.
  const bp = bolsaGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) bp.setZ(i, bp.getZ(i) + 0.17 + 0.09 * Math.cos(Math.min(1, Math.abs(bp.getX(i)) / 0.7) * Math.PI * 0.5) * Math.max(0.35, Math.cos(Math.min(1, Math.abs(bp.getY(i))) * Math.PI * 0.45)));
  bolsaGeo.computeVertexNormals();
  const bolsaMesh = new THREE.Mesh(bolsaGeo, tela);
  group.add(bolsaMesh);
  }

  // ---- Zonas de grabado ----
  const zonaMat = (txt: string) => new THREE.MeshBasicMaterial({ map: texturaZona(txt, null), transparent: true, depthWrite: false, opacity: 0 });
  const pecho = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), zonaMat("TU LOGO"));
  pecho.position.set(0, 0.16, 0.275);
  const espalda = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), zonaMat("TU NOMBRE"));
  espalda.position.set(0, esPlayera ? 0.02 : -0.42, -0.268);
  espalda.rotation.y = Math.PI;
  const mangaZ = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), zonaMat("#"));
  const pm = izq.curva.getPointAt(0.55);
  const pmz = esPlayera ? izq.curva.getPointAt(0.5) : pm;
  mangaZ.position.set(pmz.x - (esPlayera ? 0.24 : 0.21), pmz.y, pmz.z);
  mangaZ.rotation.y = -Math.PI / 2;
  mangaZ.rotation.z = 0.08;
  group.add(pecho, espalda, mangaZ);
  const zonas = { pecho, espalda, manga: mangaZ };

  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return {
    group,
    zonas,
    setColor(hex) {
      for (const m of mats) m.color.set(hex);
    },
    setLogo(img) {
      for (const [k, z] of Object.entries(zonas)) {
        const m = z.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.map = texturaZona(k === "pecho" ? "TU LOGO" : k === "espalda" ? "TU NOMBRE" : "#", k === "pecho" ? img : null);
        m.needsUpdate = true;
      }
    },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mat = m.material as THREE.Material & { map?: THREE.Texture };
          mat.map?.dispose();
          mat.dispose();
        }
      });
      normal.dispose();
      canale.dispose();
    },
  };
}
