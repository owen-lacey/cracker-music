<script lang="ts">
	import { INSTRUMENT_KINDS, type InstrumentKind } from "../../src/player";
	import { icon, KIND_LABELS } from "../instruments";
	import { selection } from "../selection.svelte";

	interface Props {
		/** Shown once the post's instrument toggle has scrolled out of view. */
		pinned: boolean;
	}

	let { pinned }: Props = $props();

	let open = $state(false);
	let root: HTMLElement;

	const others = $derived(
		INSTRUMENT_KINDS.filter((kind) => kind !== selection.kind)
	);
	const Current = $derived(icon(selection.kind));

	/* Scrolling back to the toggle hides the switcher, so it reappears closed. */
	$effect(() => {
		if (!pinned) open = false;
	});

	function choose(kind: InstrumentKind) {
		selection.kind = kind;
		open = false;
	}

	function dismiss(event: MouseEvent) {
		if (!root.contains(event.target as Node)) open = false;
	}
</script>

<svelte:window
	onkeydown={(event) => event.key === "Escape" && (open = false)}
	onclick={dismiss}
/>

<div class="switcher" class:pinned class:open inert={!pinned} bind:this={root}>
	<button
		class="current"
		aria-label="Instrument: {KIND_LABELS[selection.kind]}"
		aria-expanded={open}
		aria-controls="instrument-switcher-options"
		onclick={() => (open = !open)}
	>
		<Current />
		<span class="label">{KIND_LABELS[selection.kind]}</span>
	</button>
	<ul id="instrument-switcher-options" inert={!open}>
		{#each others as kind, index (kind)}
			{@const Option = icon(kind)}
			<li style:--index={index}>
				<button onclick={() => choose(kind)}>
					<Option />
					<span class="label">{KIND_LABELS[kind]}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.switcher {
		position: fixed;
		top: var(--switcher-top);
		left: 50%;
		z-index: var(--switcher-z);
		display: flex;
		flex-direction: column;
		gap: var(--switcher-gap);
		transform-origin: top center;
		translate: -50% calc(-1 * var(--switcher-drop));
		scale: var(--switcher-from-scale);
		opacity: 0;
		visibility: hidden;
		transition:
			translate var(--switcher-duration) var(--switcher-easing),
			scale var(--switcher-duration) var(--switcher-easing),
			opacity var(--switcher-duration),
			visibility var(--switcher-duration);
	}

	.switcher.pinned {
		translate: -50% 0;
		scale: 1;
		opacity: 1;
		visibility: visible;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--switcher-gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Each option slides out from behind the current instrument's button, one after another. */
	li {
		translate: 0
			calc(
				-1 * (var(--index) + 1) * (var(--switcher-size) + var(--switcher-gap))
			);
		opacity: 0;
		visibility: hidden;
		transition:
			translate var(--switcher-duration) var(--switcher-easing),
			opacity var(--switcher-duration),
			visibility var(--switcher-duration);
		transition-delay: calc(var(--index) * var(--switcher-stagger));
	}

	.open li {
		translate: 0 0;
		opacity: 1;
		visibility: visible;
	}

	/* A circle round the icon; open, every button stretches to the widest name, so the icons line up. */
	button {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		height: var(--switcher-size);
		padding: 0
			calc(
				(var(--switcher-size) - var(--switcher-icon)) / 2 - var(--toggle-border)
			);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
		background: var(--switcher-bg);
		box-shadow: var(--switcher-shadow);
		color: var(--toggle-color);
		cursor: pointer;
	}

	.current {
		position: relative;
		z-index: 1;
		color: var(--ink);
	}

	button:hover {
		color: var(--ink);
	}

	button:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 2px;
	}

	button :global(svg) {
		flex: none;
		width: var(--switcher-icon);
		height: var(--switcher-icon);
	}

	/* Names open out beside the icons as the stack drops down, and fold away as it closes. */
	.label {
		max-width: 0;
		overflow: hidden;
		font: inherit;
		white-space: nowrap;
		opacity: 0;
		transition:
			max-width var(--switcher-duration) var(--switcher-easing),
			margin var(--switcher-duration) var(--switcher-easing),
			opacity var(--switcher-duration);
	}

	.open .label {
		max-width: var(--switcher-label-width);
		margin: 0 var(--switcher-label-gap);
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.switcher,
		li,
		.label {
			transition-duration: 0s;
			transition-delay: 0s;
		}
	}
</style>
