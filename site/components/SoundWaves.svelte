<script lang="ts">
	import type { Envelope } from "../../src/player";

	/**
	 * Faint arcs either side of an instrument's sounding part; they play once on mount.
	 * Struck arcs appear at once and die away with the ring; blown arcs swell, then stop with the breath.
	 */
	const SIDES = ["left", "right"] as const;

	let { envelope }: { envelope: Envelope } = $props();
</script>

{#each SIDES as side (side)}
	<span class="waves {side} {envelope}" aria-hidden="true">
		<svg viewBox="0 0 10 24" width="10" height="24">
			<path d="M2 7 Q6 12 2 17" />
			<path d="M5 3 Q12 12 5 21" />
		</svg>
	</span>
{/each}

<style>
	.waves {
		position: absolute;
		top: var(--wave-y);
		color: var(--wave-color);
		pointer-events: none;
	}

	.left {
		left: calc(var(--wave-left) - var(--wave-gap));
		transform: translate(-100%, -50%) scaleX(-1);
	}

	.right {
		left: calc(var(--wave-right) + var(--wave-gap));
		transform: translateY(-50%);
	}

	svg {
		display: block;
		overflow: visible;
	}

	path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
		stroke-linecap: round;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	path:nth-child(2) {
		animation-delay: var(--wave-stagger);
	}

	.struck path {
		animation-name: ring-out;
		animation-duration: var(--ring-duration);
		animation-timing-function: var(--ring-easing);
	}

	.blown path {
		animation-name: swell;
		animation-duration: var(--whistle-duration);
	}

	@keyframes ring-out {
		from {
			opacity: var(--wave-opacity);
		}
		to {
			opacity: 0;
			transform: translateX(var(--wave-drift));
		}
	}

	@keyframes swell {
		from {
			animation-timing-function: ease-out;
		}
		75% {
			opacity: var(--wave-opacity);
			animation-timing-function: ease-in;
		}
		to {
			opacity: 0;
			transform: translateX(var(--wave-drift));
		}
	}
</style>
