<script lang="ts">
	import { isSwung } from "../../src/carols";
	import { formatSlot, parseMelody } from "../../src/melody";
	import { swingDelay } from "../../src/swing";
	import { fold } from "../../src/usage";
	import { whistleOf } from "../../src/whistles";
	import { numberFor, type InstrumentNumber } from "../instruments";
	import { sheetFor } from "../sheets";
	import type { Slug } from "../slugs";
	import MelodyTrack from "./MelodyTrack.svelte";

	/** The carol's slug: its data/carols/<slug>.json filename. */
	let { slug }: { slug: Slug } = $props();

	const NUMBERS: InstrumentNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

	const sheet = $derived(sheetFor(slug));
	const swing = $derived(isSwung(slug));
	/** The melody with notes outside the whistles' octave moved into it, so it plays and counts as the whistles would. */
	const slots = $derived(
		parseMelody(sheet.melody).map(
			(slot) => slot && fold(slot, { octaves: true, accidentals: false })
		)
	);
	/** Every note with the instrument number that plays it and the slot position it sounds at, in melody order. */
	const notes = $derived(
		slots.flatMap((slot, index) => {
			if (slot === null) return [];
			const whistle = whistleOf(slot);
			if (whistle === null)
				throw new Error(
					`${sheet.title} has ${formatSlot(slot)}, off the whistles`
				);
			return [
				{
					sounds: index + swingDelay(index, swing),
					number: numberFor(whistle)
				}
			];
		})
	);

	function tally(upTo: number): number[] {
		const counts = NUMBERS.map(() => 0);
		for (const note of notes)
			if (note.sounds < upTo) counts[note.number - 1] += 1;
		return counts;
	}

	/** The full song's busiest number, so the bars grow into a scale that never changes. */
	const most = $derived(Math.max(...tally(slots.length)));

	/** Back to the start whenever the carol changes. */
	let at = $derived.by(() => {
		void slug;
		return 0;
	});
	let fast = $state(false);

	/** A note counts once its slot sounds, so scrubbing either way recounts. */
	const counts = $derived(tally(at));
	const latest = $derived(notes.findLast((note) => note.sounds < at)?.number);
</script>

<figure class="tally">
	<ol class="bars">
		{#each NUMBERS as number (number)}
			{@const count = counts[number - 1]}
			<li
				class:latest={number === latest}
				style:--share={count / most}
				aria-label="{number}: {count} notes"
			>
				<span class="column">
					<span class="count">{count}</span>
					<span class="bar"></span>
				</span>
				<span class="number">{number}</span>
			</li>
		{/each}
	</ol>

	<!-- A new carol gets a new track, which stops the old one's playback. -->
	{#key slug}
		<MelodyTrack
			title={sheet.title}
			{slots}
			tempo={fast ? sheet.tempo * 2 : sheet.tempo}
			{swing}
			bind:at
			skippable
		>
			<button class="speed" aria-pressed={fast} onclick={() => (fast = !fast)}>
				2×
			</button>
		</MelodyTrack>
	{/key}
</figure>

<style>
	.tally {
		margin: var(--picker-margin) 0;
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

	/* A fixed height, so the figure doesn't grow and push the page as the bars rise. */
	.column {
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		gap: var(--number-gap);
		height: var(--tally-height);
	}

	/* The busiest bar fills the column, less the count above it. */
	.bar {
		width: var(--tally-bar-width);
		height: calc(var(--share) * (100% - 1lh - var(--number-gap)));
		border-radius: var(--tally-bar-radius) var(--tally-bar-radius) 0 0;
		background: var(--tally-bar-color);
		transition:
			height var(--tally-duration),
			background-color var(--tally-duration);
	}

	/* Shown on hover only; hidden rather than removed, so the bars keep their height. */
	.count {
		visibility: hidden;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.bars li:hover .count {
		visibility: visible;
	}

	.number {
		color: var(--number-color);
		font-variant-numeric: tabular-nums;
	}

	.latest .bar {
		background: var(--focus-color);
	}

	.latest .number {
		color: var(--focus-color);
	}

	.speed {
		padding: var(--toggle-padding);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
		background: none;
		color: var(--toggle-color);
		font: inherit;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background-color var(--toggle-duration),
			color var(--toggle-duration);
	}

	.speed:hover {
		color: var(--ink);
	}

	.speed[aria-pressed="true"] {
		border-color: var(--toggle-active-bg);
		background: var(--toggle-active-bg);
		color: var(--toggle-active-color);
	}

	.speed:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 2px;
	}
</style>
