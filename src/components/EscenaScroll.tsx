"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cargarPrenda, prepararEscena } from "@/lib/prenda3d";
import type { Zona } from "@/data/productos";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sudadera 3D fija detrás del inicio. Cada sección marcada con data-pose="..." mueve la prenda:
 * hero (derecha) → pecho (izquierda, de frente) → espalda (derecha, gira) → manga (izquierda, de lado)
 * → colores (centro, cambia de color). Al terminar las secciones se desvanece.
 */
const POSES: Record<string, { x: number; y: number; ry: number; esc: number; zona?: Zona; color?: string }> = {
  hero: { x: 1.2, y: -0.05, ry: -0.45, esc: 0.86 },
  pecho: { x: -1.25, y: 0, ry: 0.12, esc: 0.95, zona: "pecho" },
  espalda: { x: 1.25, y: 0, ry: Math.PI - 0.12, esc: 0.95, zona: "espalda" },
  manga: { x: -1.2, y: 0, ry: Math.PI / 2 + 0.35, esc: 1.0, zona: "manga" },
  colores: { x: 0, y: 0.5, ry: Math.PI * 2 - 0.3, esc: 0.72 },
};
const COLORES = ["#1b1b1e", "#8e8e93", "#e9e4da", "#1e2a45", "#28392e", "#1b1b1e"];

export default function EscenaScroll() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    prepararEscena(renderer, scene);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 0.1, 6.2);

    // Estado animado por GSAP; el render lo lee en cada cuadro.
    const st = { x: POSES.hero.x, y: POSES.hero.y, ry: POSES.hero.ry, esc: POSES.hero.esc, op: 1, pecho: 0, espalda: 0, manga: 0, c: 0 };
    let prenda: Awaited<ReturnType<typeof cargarPrenda>> | null = null;
    let vivo = true;
    let movil = false;

    const ajustar = () => {
      const w = window.innerWidth, h = window.innerHeight;
      movil = w < 768;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.position.z = movil ? 9.6 : 6.2;
      cam.updateProjectionMatrix();
    };
    ajustar();
    window.addEventListener("resize", ajustar);

    const color = new THREE.Color();
    const colA = new THREE.Color(), colB = new THREE.Color();
    let t0 = performance.now();
    const loop = () => {
      if (!vivo) return;
      requestAnimationFrame(loop);
      if (!prenda) return;
      const t = (performance.now() - t0) / 1000;
      const flota = reducido ? 0 : Math.sin(t * 1.1) * 0.04;
      const kx = movil ? 0.25 : 1; // en celular casi centrada
      prenda.group.position.set(st.x * kx, st.y + flota + (movil ? 0.55 : 0), 0);
      prenda.group.rotation.set(reducido ? 0 : Math.sin(t * 0.7) * 0.03, st.ry, 0);
      prenda.group.scale.setScalar(st.esc);
      for (const z of ["pecho", "espalda", "manga"] as Zona[]) {
        const m = prenda.zonas[z];
        if (m) (m.material as THREE.MeshBasicMaterial).opacity = st[z];
      }
      const i = Math.min(COLORES.length - 2, Math.floor(st.c));
      colA.set(COLORES[i]);
      colB.set(COLORES[i + 1]);
      prenda.setColor("#" + color.copy(colA).lerp(colB, st.c - i).getHexString());
      canvas.style.opacity = String(st.op);
      renderer.render(scene, cam);
    };

    const triggers: ScrollTrigger[] = [];
    cargarPrenda("sudadera", COLORES[0]).then((p) => {
      if (!vivo) return p.dispose();
      prenda = p;
      scene.add(p.group);
      t0 = performance.now();
      loop();
      // Una sola línea de tiempo para todo el recorrido (si cada sección tuviera la suya, al
      // desplazarse rápido se pelean por la misma prenda). Cada tramo dura lo que mide su sección.
      const secciones = Array.from(document.querySelectorAll<HTMLElement>("[data-pose]")).filter((s) => s.dataset.pose !== "hero" && POSES[s.dataset.pose!]);
      const zonasDe = (p: (typeof POSES)[string]) => ({ pecho: p.zona === "pecho" ? 1 : 0, espalda: p.zona === "espalda" ? 1 : 0, manga: p.zona === "manga" ? 1 : 0 });
      if (secciones.length) {
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: secciones[0],
            start: "top 85%",
            endTrigger: secciones[secciones.length - 1],
            end: "top 25%",
            scrub: reducido ? false : 0.8,
          },
        });
        let previa = POSES.hero;
        let t = 0;
        for (const s of secciones) {
          const pose = POSES[s.dataset.pose!];
          const dur = s.offsetHeight / window.innerHeight;
          // Se mueve en la primera mitad del tramo y se queda quieta el resto (para leer el texto).
          tl.fromTo(st, { x: previa.x, y: previa.y, ry: previa.ry, esc: previa.esc, ...zonasDe(previa) }, { x: pose.x, y: pose.y, ry: pose.ry, esc: pose.esc, ...zonasDe(pose), duration: dur * 0.55, immediateRender: false }, t);
          t += dur;
          previa = pose;
        }
        triggers.push(tl.scrollTrigger!);
      }
      const colores = document.querySelector<HTMLElement>('[data-pose="colores"]');
      if (colores) {
        triggers.push(
          ScrollTrigger.create({
            trigger: colores,
            start: "top 30%",
            end: "bottom 60%",
            scrub: 0.6,
            onUpdate: (self) => (st.c = self.progress * (COLORES.length - 1)),
          }),
        );
        triggers.push(
          gsap.to(st, { op: 0, ease: "none", scrollTrigger: { trigger: colores, start: "bottom 70%", end: "bottom 20%", scrub: true } }).scrollTrigger!,
        );
      }
      ScrollTrigger.refresh();
    });

    return () => {
      vivo = false;
      triggers.forEach((t) => t.kill());
      window.removeEventListener("resize", ajustar);
      prenda?.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-screen w-screen transition-opacity duration-300" />;
}
