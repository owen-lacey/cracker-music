<script lang="ts">
	import { envelope, type InstrumentKind } from "../../src/player";
	import { fit, type InstrumentNumber } from "../instruments";
	import Instrument from "./Instrument.svelte";

	interface Props {
		kind: InstrumentKind;
	}

	let { kind }: Props = $props();

	const NUMBERS: InstrumentNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

	const instruments: Instrument[] = $state([]);
	/** Times each instrument has been played; a change replays its number's highlight. */
	const plays = $state(NUMBERS.map(() => 0));

	/** Animates one instrument in the row as if played; the caller sounds the note. */
	export function ring(number: InstrumentNumber) {
		instruments[number - 1].ring();
	}
</script>

<!-- Keyed so `fit` re-measures when the kind (and so the artwork) changes. -->
{#key kind}
	<div class="instruments" {@attach fit}>
		{#each NUMBERS as number (number)}
			<figure>
				<div class="art">
					<Instrument
						bind:this={instruments[number - 1]}
						{kind}
						{number}
						onring={() => (plays[number - 1] += 1)}
					/>
				</div>
				{#key plays[number - 1]}
					<figcaption
						class={envelope(kind)}
						class:sounding={plays[number - 1] > 0}
					>
						{number}
					</figcaption>
				{/key}
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

	/* The number lights up as the note sounds and fades with it, like the sound waves. */
	.struck.sounding {
		animation: ring-out var(--ring-duration) var(--ring-easing);
	}

	.blown.sounding {
		animation: swell var(--whistle-duration);
	}

	@keyframes ring-out {
		from {
			color: var(--focus-color);
		}
	}

	@keyframes swell {
		from,
		75% {
			color: var(--focus-color);
		}
	}
</style>
