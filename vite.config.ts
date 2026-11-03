import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const CAROLS_DIR = path.resolve(import.meta.dirname, "data/carols");
const SLUG = /^\/([a-z0-9-]+)$/;

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function listSheets(res: ServerResponse): Promise<void> {
  await mkdir(CAROLS_DIR, { recursive: true });
  const files = (await readdir(CAROLS_DIR)).filter((file) => file.endsWith(".json"));
  const entries = await Promise.all(
    files.map(async (file) => [path.basename(file, ".json"), JSON.parse(await readFile(path.join(CAROLS_DIR, file), "utf8"))]),
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(Object.fromEntries(entries)));
}

async function saveSheet(slug: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sheet = JSON.parse(await readBody(req));
  await mkdir(CAROLS_DIR, { recursive: true });
  await writeFile(path.join(CAROLS_DIR, `${slug}.json`), `${JSON.stringify(sheet, null, 2)}\n`);
  res.statusCode = 204;
  res.end();
}

function carolStore(): Plugin {
  return {
    name: "carol-store",
    configureServer(server) {
      server.middlewares.use("/api/carols", (req, res, next) => {
        const slug = SLUG.exec(req.url ?? "")?.[1];
        if (req.method === "GET" && req.url === "/") {
          listSheets(res).catch(next);
        } else if (req.method === "PUT" && slug) {
          saveSheet(slug, req, res).catch(next);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), carolStore()],
  // Saved transcriptions are data, not app source: watching them makes every save reload the page.
  server: { watch: { ignored: [`${path.resolve(import.meta.dirname, "data")}/**`] } },
});
