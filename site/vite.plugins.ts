import svg from "@poppanator/sveltekit-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { readdirSync, readFileSync } from "node:fs";
import type { Plugin } from "vite";

const INSTRUMENTS = new URL("./assets/instruments/", import.meta.url);

/** Defines `__ARTWORK_HEIGHT__`: the tallest instrument artwork's height, read from each SVG's root `height`. */
function artworkHeight(): Plugin {
	const heights = readdirSync(INSTRUMENTS)
		.filter((file) => file.endsWith(".svg"))
		.map((file) => {
			const source = readFileSync(new URL(file, INSTRUMENTS), "utf8");
			const height = /<svg[^>]*\sheight="([\d.]+)"/.exec(source)?.[1];
			if (height === undefined) throw new Error(`No height on ${file}`);
			return Number(height);
		});
	return {
		name: "artwork-height",
		config: () => ({
			define: { __ARTWORK_HEIGHT__: JSON.stringify(Math.max(...heights)) }
		})
	};
}

/** Vite plugins shared by the blog build and Storybook. SVGs are inlined verbatim so their geometry stays measurable. */
export const plugins = [svelte(), svg({ svgoOptions: false }), artworkHeight()];
