<script lang="ts">
	import type { Slug } from "../slugs";
	import CarolSelect from "./CarolSelect.svelte";
	import CarolTally from "./CarolTally.svelte";

	let slug = $state<Slug | null>(null);
</script>

<!-- Starts over an empty tally until a carol is picked. -->
<CarolTally {slug}>
	{#snippet title()}
		<CarolSelect bind:slug placeholder="Pick a carol…" playable />
	{/snippet}
</CarolTally>
