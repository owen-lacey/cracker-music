<script lang="ts">
	/** Faint arcs either side of an instrument's sounding part; they play once on mount. */
	const SIDES = ["left", "right"] as const;
</script>

{#each SIDES as side (side)}
	<span class="waves {side}" aria-hidden="true">
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
		animation: wave var(--instrument-duration) ease-out forwards;
	}

	path:nth-child(2) {
		animation-delay: var(--wave-stagger);
	}

	@keyframes wave {
		30% {
			opacity: var(--wave-opacity);
		}
		100% {
			opacity: 0;
			transform: translateX(var(--wave-drift));
		}
	}
</style>
