<script lang="ts">
	import InstrumentPicker from "./components/InstrumentPicker.svelte";
</script>

<main>
	<p>
		My favourite type of christmas crackers are the ones you get little musical
		instruments in. Along with the tissue paper party hat and horrendous joke,
		you get a little bell, whistle or worst case scenario a xylophone in each
		cracker.
	</p>
	<p>
		This usually works best in a pack where each instrument is numbered one to
		eight:
	</p>
	<InstrumentPicker />

	<p>
		These notes make up the major scale, play them in order and it should sound
		familiar. As well as the instruments, you get some sheet music. This one is
		Jingle Bells, press 'play' to hear it:
	</p>

	<!-- show jingle bells with a play button-->

	<p>
		Now, I'm a massive music nerd. If I get #1 I'm buzzing. Conversely,
		completely dejected if I get #7 - christmas ruined. These emotions are just
		that, vibes-based and completely unscientific, until now.
	</p>
	<p>
		I'm going to show you what the best (or worst, depending on your musical
		talents) number to get is, and how you can split them equally to best
		prevent any arguments until you bring out monopoly.
	</p>

	<h1>Working title</h1>

	<p>
		Back to Jingle Bells, let's play it again, but keeping track of how often
		each number is played.
	</p>
</main>

<style>
	main {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
</style>
