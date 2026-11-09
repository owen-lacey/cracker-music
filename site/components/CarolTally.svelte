<script lang="ts">
	import type { Snippet } from "svelte";
	import { isSwung } from "../../src/carols";
	import { formatSlot, parseMelody } from "../../src/melody";
	import { swingDelay } from "../../src/swing";
	import { fold } from "../../src/usage";
	import { whistleOf } from "../../src/whistles";
	import { numberFor, type InstrumentNumber } from "../instruments";
	import { sheetFor } from "../sheets";
	import type { Slug } from "../slugs";
	import MelodyTrack from "./MelodyTrack.svelte";

	interface Props {
		/** The carol's slug: its data/carols/<slug>.json filename; null shows an empty tally. */
		slug: Slug | null;
		/** Shown in the top left in place of the carol's title. */
		title?: Snippet;
	}

	let { slug, title }: Props = $props();

	const NUMBERS: InstrumentNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

	const sheet = $derived(slug === null ? null : sheetFor(slug));
	const swing = $derived(slug !== null && isSwung(slug));
	/** The melody with notes outside the whistles' octave moved into it, so it plays and counts as the whistles would. */
	const slots = $derived(
		sheet === null
			? []
			: parseMelody(sheet.melody).map(
					(slot) => slot && fold(slot, { octaves: true, accidentals: false })
				)
	);
	const tempo = $derived(sheet === null ? 0 : sheet.tempo);
	/** Every note with the instrument number that plays it and the slot position it sounds at, in melody order. */
	const notes = $derived(
		slots.flatMap((slot, index) => {
			if (slot === null) return [];
			const whistle = whistleOf(slot);
			if (whistle === null)
				throw new Error(`${slug} has ${formatSlot(slot)}, off the whistles`);
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
	<figcaption class="title">
		{#if title}
			{@render title()}
		{:else}
			<span class="name">{sheet?.title}</span>
		{/if}
	</figcaption>

	<ol class="bars">
		{#each NUMBERS as number (number)}
			{@const count = counts[number - 1]}
			<li
				class:latest={number === latest}
				style:--share={most === 0 ? 0 : count / most}
				aria-label="{number}: {count} notes"
			>
				<span class="column">
					<span class="bar"><span class="count">{count}</span></span>
				</span>
				<span class="number">{number}</span>
			</li>
		{/each}
	</ol>

	<!-- A new carol gets a new track, which stops the old one's playback. -->
	{#key slug}
		<MelodyTrack
			title={sheet?.title ?? "Carol"}
			{slots}
			tempo={fast ? tempo * 2 : tempo}
			{swing}
			bind:at
			skippable
		>
			<button
				class="speed"
				aria-pressed={fast}
				disabled={sheet === null}
				onclick={() => (fast = !fast)}
			>
				2×
			</button>
		</MelodyTrack>
	{/key}
</figure>

<style>
	.tally {
		margin: var(--picker-margin) 0;
	}

	.title {
		margin-bottom: var(--tally-title-margin);
		font-size: var(--tally-title-font-size);
	}

	/* Bordered like the picker's select, which takes this spot in CarolPicker. */
	.name {
		display: inline-block;
		padding: var(--toggle-padding);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
		color: var(--ink);
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
		align-items: end;
		height: var(--tally-height);
	}

	/* The busiest bar fills the column. */
	.bar {
		position: relative;
		width: var(--tally-bar-width);
		height: calc(var(--share) * 100%);
		border-radius: var(--tally-bar-radius) var(--tally-bar-radius) 0 0;
		background: var(--tally-bar-color);
		transition:
			height var(--tally-duration),
			background-color var(--tally-duration);
	}

	/* Shown on hover only, floating above the bar so it takes no room from the column. */
	.count {
		position: absolute;
		bottom: calc(100% + var(--number-gap));
		left: 50%;
		translate: -50%;
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

	.speed:hover:enabled {
		color: var(--ink);
	}

	.speed:disabled {
		opacity: var(--track-past-opacity);
		cursor: default;
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
