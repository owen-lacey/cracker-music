<script lang="ts">
	import { ChevronDown } from "@lucide/svelte";
	import { carols } from "../../src/carols";
	import { playablePercent } from "../../src/whistles";
	import { sheetFor, slugFor } from "../sheets";
	import type { Slug } from "../slugs";

	interface Props {
		/** The picked carol; null until one is picked. */
		slug: Slug | null;
		/** Shown while no carol is picked. */
		placeholder: string;
		/** Set each title against the share of its notes on the whistles. */
		playable?: boolean;
		/** Offer "None", which goes back to no carol. */
		clearable?: boolean;
	}

	let {
		slug = $bindable(),
		placeholder,
		playable = false,
		clearable = false
	}: Props = $props();

	/** Every included carol in title order, with the share of its notes on the whistles. */
	const options = carols.map((carol) => {
		const slug = slugFor(carol.slug);
		return {
			slug,
			title: carol.title,
			percent: playablePercent(sheetFor(slug).melody)
		};
	});

	const picked = $derived(options.find((option) => option.slug === slug));
</script>

<!--
	A native select, so keyboard, type-to-jump and the phone's own picker all still work.
	Where it can be styled, each option can set its title against its playable share in muted
	text, and the closed select shows only the picked title and a chevron; elsewhere an
	option reads as plain text, "Away in a manger: 88% playable".
	It starts on a placeholder that can't be picked again; when clearable, "None" goes back
	to no carol, and the placeholder hides from the list.
-->
<select bind:value={slug} class:unselected={slug === null} aria-label="Carol">
	<button>
		<span class="picked">{picked?.title ?? placeholder}</span>
		<ChevronDown class="chevron" aria-hidden="true" />
	</button>
	<option value={null} disabled hidden={clearable}>{placeholder}</option>
	{#if clearable}
		<option value={null}>None</option>
	{/if}
	{#each options as option (option.slug)}
		<option value={option.slug}>
			<span class="title">{option.title}</span>{#if playable}<span
					class="separator">:&nbsp;</span
				><span class="percent">{option.percent}% playable</span>{/if}
		</option>
	{/each}
</select>

<style>
	select {
		max-width: 100%;
		padding: var(--toggle-padding);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}

	select.unselected {
		color: var(--number-color);
	}

	select:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 2px;
	}

	/* Phones keep the platform picker, which shows each option as plain text. */
	@media (hover: hover) and (pointer: fine) {
		select,
		select::picker(select) {
			appearance: base-select;
		}

		/* The closed select hugs the picked title; the list keeps room for every option. */
		select::picker(select) {
			width: var(--select-width);
			padding: var(--select-picker-padding);
			border: var(--toggle-border) solid var(--toggle-border-color);
			border-radius: var(--select-picker-radius);
			background: var(--surface);
			box-shadow: var(--switcher-shadow);
		}

		option {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--select-gap);
		}

		/* The picked title, then the chevron in place of the picker arrow. */
		button {
			display: flex;
			align-items: center;
			gap: var(--select-gap);
			width: 100%;
		}

		.picked {
			flex: 1;
		}

		select::picker-icon {
			display: none;
		}

		button :global(.chevron) {
			width: var(--select-chevron-size);
			height: var(--select-chevron-size);
			color: var(--number-color);
		}

		option {
			padding: var(--select-option-padding);
			border-radius: var(--select-option-radius);
		}

		option:hover,
		option:focus-visible {
			background: var(--select-option-hover-bg);
		}

		option:checked {
			font-weight: 600;
		}

		option[hidden] {
			display: none;
		}

		option::checkmark {
			display: none;
		}

		.separator {
			display: none;
		}

		.percent {
			color: var(--number-color);
			font-variant-numeric: tabular-nums;
		}
	}
</style>
