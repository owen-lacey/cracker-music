<script lang="ts">
	import { INSTRUMENT_KINDS, type InstrumentKind } from "../../src/player";
	import Instruments from "./Instruments.svelte";

	const LABELS: Record<InstrumentKind, string> = {
		bell: "Bells",
		whistle: "Whistles",
		xylophone: "Xylophones"
	};

	let kind = $state<InstrumentKind>("bell");
</script>

<div class="picker">
	<fieldset>
		<legend>Instrument</legend>
		{#each INSTRUMENT_KINDS as option (option)}
			<label>
				<input type="radio" name="kind" value={option} bind:group={kind} />
				<span>{LABELS[option]}</span>
			</label>
		{/each}
	</fieldset>
	<Instruments {kind} />
</div>

<style>
	.picker {
		margin: var(--picker-margin) 0;
	}

	fieldset {
		display: flex;
		justify-content: center;
		gap: var(--toggle-gap);
		margin: 0 0 var(--toggle-margin);
		padding: 0;
		border: 0;
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
		padding-bottom: var(--toggle-underline-gap);
		border-bottom: var(--toggle-underline) solid transparent;
		color: var(--toggle-color);
		cursor: pointer;
	}

	label span:hover {
		color: var(--ink);
	}

	input:checked + span {
		border-bottom-color: var(--toggle-active-underline);
		color: var(--ink);
	}

	input:focus-visible + span {
		outline: 2px solid var(--focus-color);
		outline-offset: 4px;
		border-radius: 4px;
	}
</style>
