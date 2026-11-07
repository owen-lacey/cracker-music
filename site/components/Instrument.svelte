<script lang="ts">
	import { envelope, preview, type InstrumentKind } from "../../src/player";
	import { whistleMidi } from "../../src/whistles";
	import {
		anchor,
		artwork,
		whistleFor,
		type InstrumentNumber
	} from "../instruments";
	import SoundWaves from "./SoundWaves.svelte";

	interface Props {
		kind: InstrumentKind;
		number: InstrumentNumber;
		/** Called each time the instrument is played, by a click or by `ring`. */
		onring: () => void;
	}

	let { kind, number, onring }: Props = $props();

	const Artwork = $derived(artwork(kind, number));
	let plays = $state(0);
	let played = $state<typeof Artwork>();
	const playing = $derived(played === Artwork);

	/** Animates the instrument as if played; the caller sounds the note. */
	export function ring() {
		played = Artwork;
		plays += 1;
		onring();
	}

	function play() {
		void preview(whistleMidi(whistleFor(number)), kind);
		ring();
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
					<SoundWaves envelope={envelope(kind)} />
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

	.bell .playing {
		transform-origin: var(--pivot-x) var(--pivot-y);
		animation-name: ring;
		animation-duration: var(--bell-duration);
	}

	.whistle .playing {
		animation-name: blow;
		animation-duration: var(--whistle-duration);
	}

	/*
	 * The xylophone's board (its first shape) stays put; only the metal bar and its pins shake.
	 * A steady oscillation times an envelope that falls fast then lingers, like the bar's ring.
	 */
	.xylophone .playing :global(svg > :not(:first-child)) {
		translate: calc(var(--shake-offset) * var(--shake-envelope)) 0;
		animation-name: shake, quieten;
		animation-duration:
			var(--xylophone-shake-period),
			calc(var(--xylophone-shake-period) * var(--xylophone-shakes));
		animation-iteration-count: var(--xylophone-shakes), 1;
		animation-timing-function: linear, var(--ring-easing);
	}

	@media (prefers-reduced-motion: reduce) {
		.playing,
		.playing :global(*) {
			animation: none;
		}
	}

	/*
	 * A flick of the wrist: the bell whips out, accelerating, and stops dead as the clapper
	 * strikes (kept under 50 ms so it lands with the sound), then rocks back in shrinking swings.
	 */
	@keyframes ring {
		from {
			animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
		}
		6% {
			transform: rotate(var(--bell-swing));
			animation-timing-function: ease-out;
		}
		28% {
			transform: rotate(calc(var(--bell-swing) * -0.4));
			animation-timing-function: ease-in-out;
		}
		50% {
			transform: rotate(calc(var(--bell-swing) * 0.18));
			animation-timing-function: ease-in-out;
		}
		72% {
			transform: rotate(calc(var(--bell-swing) * -0.07));
			animation-timing-function: ease-in-out;
		}
	}

	/* Eased into the lips as the breath builds, held while the note sounds, then let go. */
	@keyframes blow {
		from {
			animation-timing-function: ease-out;
		}
		60%,
		75% {
			transform: translateY(var(--whistle-nudge));
			animation-timing-function: ease-in;
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
