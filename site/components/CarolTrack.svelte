<script lang="ts">
	import { isSwung } from "../../src/carols";
	import { parseMelody } from "../../src/melody";
	import { whistleOf } from "../../src/whistles";
	import { numberFor } from "../instruments";
	import { selection } from "../selection.svelte";
	import { sheetFor } from "../sheets";
	import type { Slug } from "../slugs";
	import Instruments from "./Instruments.svelte";
	import MelodyTrack from "./MelodyTrack.svelte";

	/** The carol's slug: its data/carols/<slug>.json filename. */
	let { slug }: { slug: Slug } = $props();

	const sheet = $derived(sheetFor(slug));
	const slots = $derived(parseMelody(sheet.melody));

	let instruments: Instruments;

	function ring(index: number) {
		const slot = slots[index];
		const whistle = slot && whistleOf(slot);
		if (whistle) instruments.ring(numberFor(whistle));
	}
</script>

<figure class="player">
	<figcaption class="title">
		<span class="name">{sheet.title}</span>
	</figcaption>

	<Instruments bind:this={instruments} kind={selection.kind} />
	<!-- A new carol gets a new track, which stops the old one's playback. -->
	{#key slug}
		<MelodyTrack
			title={sheet.title}
			{slots}
			tempo={sheet.tempo}
			swing={isSwung(slug)}
			onslot={ring}
		/>
	{/key}
</figure>

<style>
	.player {
		margin: var(--picker-margin) 0;
	}

	.title {
		margin-bottom: var(--tally-title-margin);
		font-size: var(--tally-title-font-size);
	}

	/* Bordered like CarolTally's title. */
	.name {
		display: inline-block;
		padding: var(--toggle-padding);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
		color: var(--ink);
	}
</style>
