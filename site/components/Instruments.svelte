<script lang="ts">
	import type { InstrumentKind } from "../../src/player";
	import { fit, type InstrumentNumber } from "../instruments";
	import Instrument from "./Instrument.svelte";

	interface Props {
		kind: InstrumentKind;
	}

	let { kind }: Props = $props();

	const NUMBERS: InstrumentNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

<!-- Keyed so `fit` re-measures when the kind (and so the artwork) changes. -->
{#key kind}
	<div class="instruments" {@attach fit}>
		{#each NUMBERS as number (number)}
			<figure>
				<div class="art">
					<Instrument {kind} {number} />
				</div>
				<figcaption>{number}</figcaption>
			</figure>
		{/each}
	</div>
{/key}

<style>
	.instruments {
		--fit: 1;
		display: flex;
		justify-content: center;
		align-items: end;
		gap: calc(var(--instrument-gap) * var(--fit));
	}

	figure {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
	}

	/* Zoom scales the artwork and its measured wave/pivot positions together. */
	.art {
		zoom: var(--fit);
	}

	figcaption {
		margin-top: var(--number-gap);
		color: var(--number-color);
		font-variant-numeric: tabular-nums;
	}
</style>
