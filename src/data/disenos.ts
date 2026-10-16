/**
 * Diseños de la colección "para programadores". Cada uno tiene 3 versiones en /public/disenos:
 * <id>-claro.png (prendas oscuras), <id>-oscuro.png (prendas claras) y <id>-mono.png (todo claro, para rojo y café).
 * Se generan con código (SVG → PNG); para cambiar uno, se edita su SVG y se vuelven a exportar.
 */
export interface Diseno {
  id: string;
  nombre: string;
  desc: string;
}

export const DISENOS: Diseno[] = [
  { id: "codigo", nombre: "</>", desc: "El símbolo de código, grande y limpio" },
  { id: "hola-mundo", nombre: "Hola, mundo", desc: "El primer programa de todos" },
  { id: "mi-maquina", nombre: "Funciona en mi máquina", desc: "La excusa universal" },
  { id: "push-force", nombre: "git push --force", desc: "Para los valientes" },
  { id: "todo-dormir", nombre: "// TODO: dormir", desc: "Pendiente desde 2019" },
  { id: "while-vivo", nombre: "while (vivo)", desc: "while (vivo) { codear(); }" },
  { id: "404-sueno", nombre: "404 sueño", desc: "Error 404: sueño no encontrado" },
  { id: "ctrl-c-v", nombre: "Ctrl+C Ctrl+V", desc: "Las dos teclas más usadas" },
  { id: "cafe-codigo", nombre: "Café → Código", desc: "La función más importante" },
  { id: "127", nombre: "127.0.0.1", desc: "No hay lugar como el hogar" },
  { id: "debug", nombre: "Modo debug", desc: "Debug mode: ON" },
  { id: "binario", nombre: "Binario HOLA", desc: "HOLA escrito en binario" },
  { id: "full-stack", nombre: "{ Full Stack }", desc: "Del frontend al servidor" },
  { id: "bug-feature", nombre: "No es bug", desc: "Es una feature" },
  { id: "commit", nombre: "commit · push · repeat", desc: "El ciclo de la vida" },
];
