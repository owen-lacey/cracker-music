<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { INSTRUMENT_KINDS } from "../../src/player";
	import { KIND_LABELS } from "../instruments";
	import { selection } from "../selection.svelte";
	import Instruments from "./Instruments.svelte";
	import InstrumentSwitcher from "./InstrumentSwitcher.svelte";

	/** Whether the toggle has scrolled up out of view, so the switcher stands in for it. */
	let pinned = $state(false);

	const watch: Attachment<HTMLElement> = (toggle) => {
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[entries.length - 1];
			pinned = !entry.isIntersecting && entry.boundingClientRect.top < 0;
		});
		observer.observe(toggle);
		return () => observer.disconnect();
	};
</script>

<div class="picker">
	<fieldset {@attach watch}>
		<legend>Instrument</legend>
		{#each INSTRUMENT_KINDS as option (option)}
			<label>
				<input
					type="radio"
					name="kind"
					value={option}
					bind:group={selection.kind}
				/>
				<span>{KIND_LABELS[option]}</span>
			</label>
		{/each}
	</fieldset>
	<Instruments kind={selection.kind} />
</div>

<InstrumentSwitcher {pinned} />

<style>
	.picker {
		margin: var(--picker-margin) 0;
	}

	fieldset {
		display: flex;
		width: fit-content;
		margin: 0 auto var(--toggle-margin);
		padding: var(--toggle-inset);
		border: var(--toggle-border) solid var(--toggle-border-color);
		border-radius: var(--toggle-radius);
	}

	legend,
	input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	label span {
		display: block;
		padding: var(--toggle-padding);
		border-radius: var(--toggle-radius);
		color: var(--toggle-color);
		cursor: pointer;
		transition:
			background-color var(--toggle-duration),
			color var(--toggle-duration);
	}

	label span:hover {
		color: var(--ink);
	}

	input:checked + span {
		background-color: var(--toggle-active-bg);
		color: var(--toggle-active-color);
	}

	input:focus-visible + span {
		outline: 2px solid var(--focus-color);
		outline-offset: 2px;
	}
</style>
