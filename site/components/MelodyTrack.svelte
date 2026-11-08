<script module lang="ts">
	/** The track that last started the shared player; any other track stops following it. */
	const player = $state<{ owner: symbol | null }>({ owner: null });
</script>

<script lang="ts">
	import { Pause, Play, RotateCcw } from "@lucide/svelte";
	import { onDestroy, untrack, type Snippet } from "svelte";
	import { type Slot } from "../../src/melody";
	import { midiFor } from "../../src/pitch";
	import {
		pause,
		play,
		position,
		resume,
		seek,
		setKind,
		setTempo,
		stop
	} from "../../src/player";
	import { swingDelay } from "../../src/swing";
	import { noteLabel } from "../instruments";
	import { selection } from "../selection.svelte";

	interface Props {
		title: string;
		slots: Slot[];
		/** Quarter notes per minute; a change takes effect straight away while playing. */
		tempo: number;
		/** Whether the melody plays swung; odd slots are drawn as late as they sound. */
		swing: boolean;
		/** Playing position in 16th slots; the track slides so this slot sits on the playhead. */
		at?: number;
		onslot?: (index: number) => void;
		/** Extra controls, placed after play and replay. */
		children?: Snippet;
	}

	let {
		title,
		slots,
		tempo,
		swing,
		at = $bindable(0),
		onslot,
		children
	}: Props = $props();

	type Status = "idle" | "loading" | "playing" | "paused";

	/** 16th slots in a beat. */
	const BEAT = 4;

	const self = Symbol("track");
	const midis = $derived(slots.map((slot) => (slot ? midiFor(slot) : null)));
	const notes = $derived(
		slots.flatMap((slot, index) =>
			slot ? [{ index, label: noteLabel(slot) }] : []
		)
	);

	let status = $state<Status>("idle");
	let sounding = $state<number | null>(null);
	/** A drag on the track in progress: where it started, and whether to play on when let go. */
	let drag = $state<{
		x: number;
		from: number;
		slot: number;
		resume: boolean;
	} | null>(null);

	function onSlot(index: number) {
		if (slots[index] === null) return;
		sounding = index;
		onslot?.(index);
	}

	/* The track stays at the end; the last followed frame falls just short, so settle on it exactly. */
	function end() {
		at = slots.length;
		status = "idle";
		sounding = null;
	}

	async function start(from: number) {
		player.owner = self;
		status = "loading";
		sounding = null;
		setTempo(tempo);
		await play(midis, swing, selection.kind, onSlot, end, from);
		/* Another track may have taken the player while the instrument loaded. */
		if (player.owner === self) status = "playing";
	}

	function toggle() {
		if (status === "playing") {
			pause();
			status = "paused";
		} else if (status === "paused") {
			resume();
			status = "playing";
		} else void start(at >= slots.length ? 0 : at);
	}

	/** Width of one slot in px; `--track-slot` is registered as a length so it resolves. */
	function slotWidth(track: HTMLElement): number {
		return parseFloat(getComputedStyle(track).getPropertyValue("--track-slot"));
	}

	function grab(event: PointerEvent) {
		const track = event.currentTarget as HTMLElement;
		track.setPointerCapture(event.pointerId);
		drag = {
			x: event.clientX,
			from: at,
			slot: slotWidth(track),
			resume: status === "playing"
		};
		if (drag.resume) pause();
	}

	/** Moves the track; a playing or paused melody carries on from there. */
	function moveTo(slot: number) {
		at = clamp(slot);
		sounding = null;
	}

	function clamp(slot: number): number {
		return Math.min(Math.max(slot, 0), slots.length);
	}

	function scrub(event: PointerEvent) {
		if (!drag) return;
		moveTo(drag.from - (event.clientX - drag.x) / drag.slot);
	}

	function seekIfStarted() {
		if (status === "playing" || status === "paused") seek(at);
	}

	function release() {
		if (!drag) return;
		seekIfStarted();
		if (drag.resume) resume();
		drag = null;
	}

	/**
	 * The arrow keys scrub a beat at a time. While playing, the track follows the audio to the
	 * new spot, since notes already scheduled for the next moment still sound first.
	 */
	function nudge(event: KeyboardEvent) {
		const step = { ArrowLeft: -BEAT, ArrowRight: BEAT }[event.key];
		if (step === undefined) return;
		event.preventDefault();
		if (status === "playing") {
			sounding = null;
			seek(clamp(at + step));
		} else {
			moveTo(at + step);
			seekIfStarted();
		}
	}

	/* Follows while paused too: the melody plays on for a moment after a pause. */
	$effect(() => {
		if ((status !== "playing" && status !== "paused") || drag) return;
		let frame = requestAnimationFrame(function follow() {
			at = position();
			frame = requestAnimationFrame(follow);
		});
		return () => cancelAnimationFrame(frame);
	});

	/* Another track took the player: stop following it and stay where this one was. */
	$effect(() => {
		if (player.owner === self) return;
		untrack(() => {
			status = "idle";
			sounding = null;
		});
	});

	$effect(() => {
		const bpm = tempo;
		untrack(() => {
			if (status !== "idle") setTempo(bpm);
		});
	});

	/* A new kind carries on from the same spot, sounding as the new instrument. */
	$effect(() => {
		const kind = selection.kind;
		untrack(() => {
			if (status !== "idle") void setKind(kind);
		});
	});

	onDestroy(() => {
		if (player.owner === self) stop();
	});
</script>

<div class="row">
	<div class="controls">
		<button
			aria-label={status === "playing" ? "Pause" : "Play"}
			disabled={status === "loading"}
			onclick={toggle}
		>
			{#if status === "playing"}
				<Pause class="solid" />
			{:else}
				<Play class="solid" />
			{/if}
		</button>
		<button
			aria-label="Replay"
			disabled={status === "idle" || status === "loading"}
			onclick={() => start(0)}
		>
			<RotateCcw />
		</button>
		{@render children?.()}
	</div>

	<div
		class="track"
		class:dragging={drag}
		style:--position={at}
		role="slider"
		tabindex="0"
		aria-label="{title} position"
		aria-valuemin={0}
		aria-valuemax={slots.length}
		aria-valuenow={Math.round(at)}
		onpointerdown={grab}
		onpointermove={scrub}
		onpointerup={release}
		onpointercancel={release}
		onkeydown={nudge}
	>
		<ol class="notes">
			{#each notes as note (note.index)}
				<li
					style:--index={note.index}
					style:--delay={swingDelay(note.index, swing)}
					class:sounding={note.index === sounding}
					class:past={note.index !== sounding && note.index + 1 <= at}
				>
					{note.label}
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--toggle-gap);
		margin-top: var(--track-margin);
	}

	.track {
		position: relative;
		flex: 1;
		height: var(--track-height);
		overflow: hidden;
		cursor: grab;
		touch-action: pan-y;
		user-select: none;
		mask-image: linear-gradient(
			to right,
			transparent,
			black var(--track-fade),
			black calc(100% - var(--track-fade)),
			transparent
		);
	}

	.track.dragging {
		cursor: grabbing;
	}

	.track:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 4px;
		border-radius: 4px;
	}

	/* The playhead: a note sounds as its centre crosses this line. */
	.track::before {
		content: "";
		position: absolute;
		inset: 0 auto;
		left: var(--track-playhead);
		width: var(--track-line);
		translate: -50% 0;
		background: var(--track-line-color);
	}

	.notes {
		position: absolute;
		inset: 0 auto;
		left: var(--track-playhead);
		margin: 0;
		padding: 0;
		list-style: none;
		translate: calc(var(--position) * var(--track-slot) * -1) 0;
	}

	.notes li {
		position: absolute;
		top: 50%;
		left: calc((var(--index) + var(--delay)) * var(--track-slot));
		translate: -50% -50%;
		color: var(--ink);
		font-size: var(--track-font-size);
		font-variant-numeric: tabular-nums;
	}

	.notes .sounding {
		color: var(--focus-color);
	}

	.notes .past {
		opacity: var(--track-past-opacity);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--toggle-gap);
	}

	button {
		display: flex;
		padding: 0;
		border: 0;
		background: none;
		color: var(--toggle-color);
		cursor: pointer;
	}

	button:hover:enabled {
		color: var(--ink);
	}

	button:disabled {
		opacity: var(--track-past-opacity);
		cursor: default;
	}

	button:focus-visible {
		outline: 2px solid var(--focus-color);
		outline-offset: 4px;
		border-radius: 4px;
	}

	button :global(svg) {
		width: var(--control-size);
		height: var(--control-size);
		stroke-width: var(--control-stroke);
	}

	/* Lucide icons are outlines; play and pause are closed shapes, so they fill solid. */
	button :global(svg.solid) {
		fill: currentColor;
	}
</style>
