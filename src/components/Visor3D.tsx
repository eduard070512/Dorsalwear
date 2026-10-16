"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cargarPrenda, prepararEscena, type Prenda } from "@/lib/prenda3d";
import type { Tipo, Zona } from "@/data/productos";

const GIRO: Record<Zona, number> = { pecho: 0, espalda: Math.PI, manga: Math.PI / 2 };

/** Visor del producto: arrastra para girar, cambia color, muestra zonas elegidas y el logo subido. */
export default function Visor3D({ tipo, color, zonas, logo, enfoque, grande = false }: { tipo: Tipo; color: string; zonas: Zona[]; logo: HTMLImageElement | null; enfoque: Zona | null; grande?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prendaRef = useRef<Prenda | null>(null);
  const ctlRef = useRef<OrbitControls | null>(null);
  const meta = useRef<number | null>(null);
  const props = useRef({ color, zonas, logo });
  props.current = { color, zonas, logo };

  useEffect(() => {
    const canvas = ref.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    prepararEscena(renderer, scene);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 0.15, 5.6);
    const ctl = new OrbitControls(cam, canvas);
    ctl.enablePan = false;
    ctl.enableZoom = false;
    ctl.enableDamping = true;
    ctl.minPolarAngle = Math.PI * 0.35;
    ctl.maxPolarAngle = Math.PI * 0.62;
    ctl.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ctl.autoRotateSpeed = 0.8;
    ctl.addEventListener("start", () => {
      ctl.autoRotate = false;
      meta.current = null;
    });
    ctlRef.current = ctl;

    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = canvas;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    });
    ro.observe(canvas);

    let vivo = true;
    cargarPrenda(tipo, props.current.color, { pechoGrande: grande }).then((p) => {
      if (!vivo) return p.dispose();
      prendaRef.current = p;
      scene.add(p.group);
      p.setLogo(props.current.logo);
    });
    const loop = () => {
      if (!vivo) return;
      requestAnimationFrame(loop);
      const p = prendaRef.current;
      if (p) {
        p.setColor(props.current.color);
        for (const z of ["pecho", "espalda", "manga"] as Zona[]) {
          const m = p.zonas[z];
          if (!m) continue;
          const mat = m.material as THREE.MeshBasicMaterial;
          const objetivo = props.current.zonas.includes(z) ? 1 : 0;
          mat.opacity += (objetivo - mat.opacity) * 0.15;
        }
        // Giro suave hacia la zona enfocada.
        if (meta.current != null) {
          const actual = ctl.getAzimuthalAngle();
          let d = meta.current - actual;
          d = Math.atan2(Math.sin(d), Math.cos(d));
          if (Math.abs(d) < 0.01) meta.current = null;
          else {
            const r = Math.hypot(cam.position.x, cam.position.z);
            const a = actual + d * 0.12;
            cam.position.x = Math.sin(a) * r;
            cam.position.z = Math.cos(a) * r;
          }
        }
      }
      ctl.update();
      renderer.render(scene, cam);
    };
    loop();
    return () => {
      vivo = false;
      ro.disconnect();
      ctl.dispose();
      prendaRef.current?.dispose();
      prendaRef.current = null;
      renderer.dispose();
    };
  }, [tipo, grande]);

  useEffect(() => {
    prendaRef.current?.setLogo(logo);
  }, [logo]);

  useEffect(() => {
    if (enfoque == null || !ctlRef.current) return;
    ctlRef.current.autoRotate = false;
    meta.current = GIRO[enfoque];
  }, [enfoque]);

  return <canvas ref={ref} className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" aria-label="Vista 3D de la prenda; arrastra para girarla" role="img" />;
}
