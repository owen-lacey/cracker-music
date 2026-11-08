<script lang="ts">
	import { carols } from "../../src/carols";
	import { playablePercent } from "../../src/whistles";
	import { sheetFor, slugFor } from "../sheets";
	import CarolTally from "./CarolTally.svelte";

	/** Every included carol in title order, with the share of its notes on the whistles. */
	const options = carols.map((carol) => {
		const slug = slugFor(carol.slug);
		return {
			slug,
			title: carol.title,
			percent: playablePercent(sheetFor(slug).melody)
		};
	});

	let slug = $state(options[0].slug);
</script>

<!--
	A native select, so keyboard, type-to-jump and the phone's own picker all still work.
	Where it can be styled, each option lines up its title, a bar of its playable share and
	the number; elsewhere an option reads as plain text, "Away in a manger: 88%".
-->
<div class="picker">
	<select bind:value={slug} aria-label="Carol">
		<button><selectedcontent></selectedcontent></button>
		{#each options as option (option.slug)}
			<option value={option.slug}>
				<span class="title">{option.title}</span><span class="separator"
					>:&nbsp;</span
				><span class="share" style:--share={option.percent / 100}></span><span
					class="percent">{option.percent}%</span
				>
			</option>
		{/each}
	</select>
</div>
<CarolTally {slug} />

<style>
	.picker {
		display: flex;
		justify-content: center;
		margin-top: var(--picker-margin);
	}

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

		select {
			width: var(--select-width);
		}

		select::picker(select) {
			padding: var(--select-picker-padding);
			border: var(--toggle-border) solid var(--toggle-border-color);
			border-radius: var(--select-picker-radius);
			background: var(--surface);
			box-shadow: var(--switcher-shadow);
		}

		selectedcontent,
		option {
			display: grid;
			grid-template-columns: 1fr var(--select-share-width) var(
					--select-percent-width
				);
			align-items: center;
			gap: var(--select-gap);
		}

		/* The selected option's columns, then the picker arrow. */
		button {
			display: flex;
			align-items: center;
			gap: var(--select-gap);
			width: 100%;
		}

		selectedcontent {
			flex: 1;
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

		option::checkmark {
			display: none;
		}

		.separator {
			display: none;
		}

		.share {
			height: var(--select-share-height);
			border-radius: var(--select-share-height);
			background: linear-gradient(
				to right,
				var(--tally-bar-color) calc(var(--share) * 100%),
				var(--track-line-color) 0
			);
		}

		.percent {
			color: var(--number-color);
			font-variant-numeric: tabular-nums;
			text-align: end;
		}
	}
</style>
