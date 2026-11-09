<script lang="ts">
	import { carols } from "../../src/carols";
	import { WHISTLES, whistleLoads } from "../../src/whistles";
	import { numberFor } from "../instruments";
	import { sheetFor, slugFor } from "../sheets";
	import type { Slug } from "../slugs";
	import CarolSelect from "./CarolSelect.svelte";

	/** How many notes each whistle plays across every included carol. */
	const totals = whistleLoads(
		carols.map((carol) => sheetFor(slugFor(carol.slug)).melody)
	);
	/** The busiest whistle's total, so the tallest bar fills the column. */
	const most = Math.max(...WHISTLES.map((whistle) => totals[whistle]));

	let slug = $state<Slug | null>(null);

	/** The picked carol's notes per whistle: its slice of each bar. */
	const parts = $derived(
		slug === null ? null : whistleLoads([sheetFor(slug).melody])
	);
</script>

<figure class="tally">
	<figcaption class="title">
		<CarolSelect bind:slug placeholder="Highlight carol" clearable />
	</figcaption>

	<ol class="bars">
		{#each WHISTLES as whistle (whistle)}
			{@const number = numberFor(whistle)}
			{@const total = totals[whistle]}
			{@const part = parts?.[whistle] ?? 0}
			<li
				style:--share={most === 0 ? 0 : total / most}
				style:--part={total === 0 ? 0 : part / total}
				aria-label={parts === null
					? `${number}: ${total} notes`
					: `${number}: ${part} of ${total} notes`}
			>
				<span class="column">
					<span class="count">
						{parts === null ? total : `${part} / ${total}`}
					</span>
					<span class="bar"><span class="slice"></span></span>
				</span>
				<span class="number">{number}</span>
			</li>
		{/each}
	</ol>
</figure>

<style>
	.tally {
		margin: var(--picker-margin) 0;
	}

	.title {
		margin-bottom: var(--tally-title-margin);
	}

	.bars {
		display: flex;
		justify-content: center;
		align-items: end;
		gap: var(--tally-gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.bars li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--number-gap);
	}

	.column {
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		gap: var(--number-gap);
		height: var(--carols-tally-height);
	}

	/* The busiest bar fills the column, less the count above it; clipped so the slice keeps its rounded top. */
	.bar {
		display: flex;
		flex-direction: column;
		justify-content: end;
		overflow: hidden;
		width: var(--tally-bar-width);
		height: calc(var(--share) * (100% - 1lh - var(--number-gap)));
		border-radius: var(--tally-bar-radius) var(--tally-bar-radius) 0 0;
		background: var(--tally-bar-color);
	}

	/* The picked carol's share of the bar, from the bottom up. */
	.slice {
		height: calc(var(--part) * 100%);
		background: var(--focus-color);
		transition: height var(--tally-duration);
	}

	/*
	 * Shown on hover only; hidden rather than removed, so the bars keep their height. As wide as
	 * the bar and centred, so a long "24 / 412" spills either side instead of widening the chart.
	 */
	.count {
		display: flex;
		justify-content: center;
		width: var(--tally-bar-width);
		visibility: hidden;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.bars li:hover .count {
		visibility: visible;
	}

	.number {
		color: var(--number-color);
		font-variant-numeric: tabular-nums;
	}
</style>
