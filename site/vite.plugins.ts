import svg from "@poppanator/sveltekit-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";

/** Vite plugins shared by the blog build and Storybook. SVGs are inlined verbatim so their geometry stays measurable. */
export const plugins = [svelte(), svg({ svgoOptions: false })];
