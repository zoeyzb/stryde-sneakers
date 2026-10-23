// Renders the STRYDE garment films used on the scroll scene's screen.
// Usage: node scripts/assets/film/render-films.mjs [chrome-path]
// Requires: puppeteer-core (npx-installable), ffmpeg on PATH.
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const root = resolve(new URL("../../..", import.meta.url).pathname);
const chrome = process.argv[2] ?? "/usr/local/bin/google-chrome";
const FPS = 30;
const DURATION = 8;
const types = { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".webp": "image/webp", ".ttf": "font/ttf" };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const path = url.pathname === "/" ? "/scripts/assets/film/film.html" : url.pathname;
  try {
    const body = await readFile(join(root, decodeURIComponent(path)));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

for (const garment of ["white", "gray", "sport"]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on("console", (m) => console.log(`[${garment}]`, m.text()));
  page.on("pageerror", (e) => console.error(`[${garment}]`, e.message));
  await page.goto(`http://localhost:${port}/?garment=${garment}`);
  await page.waitForFunction("window.ready === true", { timeout: 120000 });
  const dir = `/tmp/stryde-film-${garment}`;
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < FPS * DURATION; i++) {
    const data = await page.evaluate((t, d) => window.renderFrame(t, d), i / FPS, DURATION);
    await writeFile(`${dir}/${String(i).padStart(4, "0")}.png`, Buffer.from(data.split(",")[1], "base64"));
  }
  const outFile = join(root, `public/textures/${garment}/third/stryde-film.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.png`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-preset", "slow",
    "-movflags", "+faststart", "-an", outFile,
  ]);
  console.log("wrote", outFile);
  await page.close();
}

await browser.close();
server.close();
