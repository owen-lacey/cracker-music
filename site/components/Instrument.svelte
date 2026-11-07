<script lang="ts">
	import { preview } from "../../src/player";
	import { whistleMidi } from "../../src/whistles";
	import {
		anchor,
		artwork,
		whistleFor,
		type InstrumentKind,
		type InstrumentNumber
	} from "../instruments";
	import SoundWaves from "./SoundWaves.svelte";

	interface Props {
		kind: InstrumentKind;
		number: InstrumentNumber;
	}

	let { kind, number }: Props = $props();

	const Artwork = $derived(artwork(kind, number));
	let plays = $state(0);
	let played = $state<typeof Artwork>();
	const playing = $derived(played === Artwork);

	function play() {
		void preview(whistleMidi(whistleFor(number)));
		played = Artwork;
		plays += 1;
	}
</script>

<button class="instrument {kind}" aria-label="{kind} {number}" onclick={play}>
	{#key Artwork}
		<span class="stage" {@attach anchor(kind)}>
			{#key plays}
				<span class="body" class:playing>
					<Artwork />
				</span>
				{#if playing}
					<SoundWaves />
				{/if}
			{/key}
		</span>
	{/key}
</button>

<style>
	.instrument {
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.instrument:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 4px;
		border-radius: 4px;
	}

	.stage,
	.body,
	.body :global(svg) {
		display: block;
	}

	.stage {
		position: relative;
	}

	.bell .playing,
	.whistle .playing {
		animation-duration: var(--instrument-duration);
		animation-timing-function: ease-out;
	}

	.bell .playing {
		transform-origin: var(--pivot-x) var(--pivot-y);
		animation-name: ring;
		animation-duration: var(--bell-duration);
	}

	.whistle .playing {
		animation-name: blow;
	}

	/*
	 * The xylophone's board (its first shape) stays put; only the metal bar and its pins shake.
	 * A steady oscillation times a decaying envelope, like a struck bar ringing out.
	 */
	.xylophone .playing :global(svg > :not(:first-child)) {
		translate: calc(var(--shake-offset) * var(--shake-envelope)) 0;
		animation-name: shake, quieten;
		animation-duration:
			var(--xylophone-shake-period),
			calc(var(--xylophone-shake-period) * var(--xylophone-shakes));
		animation-iteration-count: var(--xylophone-shakes), 1;
		animation-timing-function: linear, ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.playing,
		.playing :global(*) {
			animation: none;
		}
	}

	/* A quick flick left, then a slower settle back to centre. */
	@keyframes ring {
		from {
			animation-timing-function: ease-out;
		}
		25% {
			transform: rotate(var(--bell-swing));
			animation-timing-function: ease-in-out;
		}
	}

	@keyframes blow {
		25% {
			transform: translateY(var(--whistle-nudge));
		}
	}

	@keyframes shake {
		25% {
			--shake-offset: calc(var(--xylophone-shake) * -1);
		}
		75% {
			--shake-offset: var(--xylophone-shake);
		}
	}

	@keyframes quieten {
		from {
			--shake-envelope: 1;
		}
		to {
			--shake-envelope: 0;
		}
	}
</style>
