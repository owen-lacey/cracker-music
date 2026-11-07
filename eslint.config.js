import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	{ ignores: ["node_modules", "dist", "storybook-static", ".post-lab"] },
	js.configs.recommended,
	tseslint.configs.recommended,
	reactHooks.configs.flat.recommended,
	svelte.configs.recommended,
	storybook.configs["flat/recommended"],
	{
		files: ["**/*.svelte", "**/*.svelte.ts"],
		languageOptions: { parserOptions: { parser: tseslint.parser } },
		// Not in svelte.configs.recommended: reports Svelte compiler errors and warnings.
		rules: { "svelte/valid-compile": "error" }
	},
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			complexity: ["error", 10]
		}
	}
);
