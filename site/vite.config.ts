import path from "node:path";
import { defineConfig } from "vite";
import { plugins } from "./vite.plugins.ts";

export default defineConfig({
	root: import.meta.dirname,
	plugins,
	build: {
		outDir: path.resolve(import.meta.dirname, "../dist"),
		emptyOutDir: true
	}
});
