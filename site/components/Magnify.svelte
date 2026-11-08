<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<!-- Story-only wrapper: zoom scales the artwork and its measured wave/pivot positions together. -->
<div class="magnify">
	{@render children()}
</div>

<style>
	.magnify {
		zoom: 3;
	}
</style>
