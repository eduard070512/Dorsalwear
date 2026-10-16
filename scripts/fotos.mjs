import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/root/sistema-de-contenido-kj/Sistema-de-contenido/tools/carrusel-animado/render.mjs");
const { chromium } = require("playwright");
const raiz = new URL("..", import.meta.url).pathname;
execFileSync("npx", ["esbuild", "scripts/fotos.ts", "--bundle", "--outfile=public/_fotos.js", "--alias:@=./src", "--log-level=warning"], { cwd: raiz });
fs.writeFileSync(raiz + "public/_fotos.html", '<!doctype html><body style="margin:0;background:transparent"><script src="/_fotos.js"></script>');
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage();
await p.goto((process.env.SITIO || "http://localhost:3078") + "/_fotos.html");
await p.waitForFunction(() => "fotos" in window);
const fotos = await p.evaluate(() => window.fotos());
for (const [slug, data] of Object.entries(fotos)) {
  const png = raiz + `public/productos/${slug}.png`;
  fs.writeFileSync(png, Buffer.from(data.split(",")[1], "base64"));
  execFileSync("python3", ["-c", `from PIL import Image; im=Image.open('${png}'); im=im.crop(im.getbbox()); im.save('${png.replace(".png", ".webp")}', quality=88)`]);
  fs.unlinkSync(png);
  console.log("ok", slug);
}
await b.close();
fs.unlinkSync(raiz + "public/_fotos.js");
fs.unlinkSync(raiz + "public/_fotos.html");
