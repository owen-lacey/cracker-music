<script lang="ts">
	import type { InstrumentKind } from "../../src/player";
	import type { InstrumentNumber } from "../instruments";
	import Instrument from "./Instrument.svelte";

	interface Props {
		kind: InstrumentKind;
	}

	let { kind }: Props = $props();

	const NUMBERS: InstrumentNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

<div class="instruments">
	{#each NUMBERS as number (number)}
		<Instrument {kind} {number} />
	{/each}
</div>

<style>
	.instruments {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--instrument-gap);
	}
</style>
