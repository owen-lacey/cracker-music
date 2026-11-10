<script lang="ts">
	import { carols } from "../../src/carols";
	import {
		splitWhistles,
		WHISTLES,
		type Whistle,
		whistleLoads
	} from "../../src/whistles";
	import { numberFor } from "../instruments";
	import { sheetFor, slugFor } from "../sheets";
	import type { Slug } from "../slugs";
	import CarolSelect from "./CarolSelect.svelte";

	/** A tint at or above this strength sets the text in the surface colour, to read on the darker shades. */
	const INVERT_AT = 0.5;

	/** How many notes each whistle plays across every included carol. */
	const totals = whistleLoads(
		carols.map((carol) => sheetFor(slugFor(carol.slug)).melody)
	);

	/** The fairest split for each table size, 8 people down to 1, from every included carol. */
	const rows = WHISTLES.map((_, i) => WHISTLES.length - i).map((people) => ({
		people,
		split: splitWhistles(totals, people)
	}));

	/** One column per person, as many as there are whistles. */
	const PERSONS = [...WHISTLES.keys()];

	let slug = $state<Slug | null>(null);

	/** Notes per whistle that the shading reads: the picked carol's, or every carol's. */
	const loads = $derived(
		slug === null ? totals : whistleLoads([sheetFor(slug).melody])
	);
	const total = $derived(
		WHISTLES.reduce((sum, whistle) => sum + loads[whistle], 0)
	);

	/**
	 * How a person's share of the notes compares with an even split among `people`:
	 * `ratio` is their share over the even share, so 1 is fair; `strength` is how far off fair, from
	 * 0 at fair to 1 at no notes or at least double the even share.
	 */
	function deviationOf(group: Whistle[], people: number) {
		const share =
			group.reduce((sum, whistle) => sum + loads[whistle], 0) / total;
		const ratio = share * people;
		return { share, ratio, strength: Math.min(1, Math.abs(ratio - 1)) };
	}
</script>

<figure class="split">
	<figcaption class="title">
		<CarolSelect bind:slug placeholder="Highlight carol" clearable />
	</figcaption>

	<table>
		<thead>
			<tr>
				<th scope="col">People</th>
				<th class="axis" scope="colgroup" colspan={WHISTLES.length}>
					Each person's numbers
				</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as { people, split } (people)}
				<tr>
					<th scope="row">{people}</th>
					{#each PERSONS as i (i)}
						{@const group = split[i]}
						{#if group}
							{@const numbers = group.map(numberFor).join(", ")}
							{@const { share, ratio, strength } = deviationOf(group, people)}
							<td
								class="person"
								class:under={ratio < 1}
								class:inverted={strength >= INVERT_AT}
								style:--strength={strength}
								aria-label="Person {i + 1}: {numbers}, {Math.round(
									share * 100
								)}% of notes against an even {Math.round(100 / people)}%"
							>
								{numbers}
								<span class="tip">{Math.round(share * 100)}%</span>
							</td>
						{:else}
							<td></td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="key" aria-hidden="true">
		<span class="scale"></span>
		<span class="labels">
			<span>Underplaying</span>
			<span>Overplaying</span>
		</span>
	</div>
</figure>

<style>
	.split {
		margin: var(--picker-margin) 0;
	}

	.title {
		margin-bottom: var(--tally-title-margin);
	}

	table {
		width: 100%;
		table-layout: fixed;
		border-spacing: var(--split-gap);
		font-size: var(--split-font-size);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	th {
		width: var(--split-header-width);
		color: var(--number-color);
		font-weight: normal;
	}

	/* Spans the person columns, so it takes their width rather than the row headers'. */
	.axis {
		width: auto;
	}

	td {
		padding: var(--split-cell-padding);
		border-radius: var(--split-cell-radius);
	}

	/* White at a fair share, tinted towards the under or over colour the further off it is. */
	.person {
		--tint: var(--split-over-color);
		background: color-mix(
			in srgb,
			var(--tint) calc(var(--strength) * 100%),
			var(--surface)
		);
		color: var(--ink);
		transition:
			background var(--tally-duration),
			color var(--tally-duration);
	}

	/* The person's share of the notes, in a tooltip above the cell on hover. */
	.person {
		position: relative;
		cursor: default;
		user-select: none;
	}

	.tip {
		position: absolute;
		bottom: calc(100% + var(--split-tip-gap));
		left: 50%;
		z-index: var(--split-tip-z);
		padding: var(--split-tip-padding);
		border-radius: var(--split-cell-radius);
		background: var(--ink);
		color: var(--surface);
		white-space: nowrap;
		pointer-events: none;
		visibility: hidden;
		translate: -50% 0;
	}

	.person:hover .tip {
		visibility: visible;
	}

	.person.under {
		--tint: var(--split-under-color);
	}

	.person.inverted {
		color: var(--surface);
	}

	.key {
		display: flex;
		flex-direction: column;
		gap: var(--split-key-gap);
		width: var(--split-key-width);
		max-width: 100%;
		margin: var(--split-key-margin) 0 0 auto;
		font-size: var(--split-font-size);
	}

	.scale {
		height: var(--split-key-height);
		border-radius: var(--split-cell-radius);
		background: linear-gradient(
			to right,
			var(--split-under-color),
			var(--surface),
			var(--split-over-color)
		);
	}

	.labels {
		display: flex;
		justify-content: space-between;
		color: var(--number-color);
	}
</style>
