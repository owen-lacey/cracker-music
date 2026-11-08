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

	/** Half the default ♩ = 100, so each slot lasts 0.3 s. */
	const TEMPO = 50;

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
	<Instruments bind:this={instruments} kind={selection.kind} />
	<!-- A new carol gets a new track, which stops the old one's playback. -->
	{#key slug}
		<MelodyTrack
			title={sheet.title}
			{slots}
			tempo={TEMPO}
			swing={isSwung(slug)}
			onslot={ring}
		/>
	{/key}
</figure>

<style>
	.player {
		margin: var(--picker-margin) 0;
	}
</style>
