import type { StorybookConfig } from "@storybook/svelte-vite";
import { plugins } from "../site/vite.plugins.ts";

const config: StorybookConfig = {
	stories: ["../site/**/*.stories.ts"],
	framework: { name: "@storybook/svelte-vite", options: {} },
	// Svelte must compile components before Storybook's docgen plugin reads them.
	viteFinal: (viteConfig) => ({
		...viteConfig,
		plugins: [...plugins, ...(viteConfig.plugins ?? [])]
	})
};

export default config;
