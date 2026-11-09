<script lang="ts">
	import CarolPicker from "./components/CarolPicker.svelte";
	import CarolsTally from "./components/CarolsTally.svelte";
	import CarolTally from "./components/CarolTally.svelte";
	import CarolTrack from "./components/CarolTrack.svelte";
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
		familiar. As well as the instruments, you get some sheet music in the form
		of a string of numbers between 1 and 8. This one is Jingle Bells, press
		'play' to hear it:
	</p>

	<CarolTrack slug="jingle-bells" />

	<p>
		Now, I'm a massive music nerd: If I get #1 I'm buzzing. Conversely,
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
	<CarolTally slug="jingle-bells" />

	<p>
		Whoever had bell 3 is working overtime with 24 notes, whilst 6, 7 and 8 have
		nothing to do. This carol is pleasing because it fits into the provided 8
		notes. Let's do the same tallying exercise for rudolph now:
	</p>

	<CarolTally slug="rudolph-the-red-nosed-reindeer" />

	<p>
		It was going so well, right until the penultimate note of 2, which needs to
		drop down the octave. If you had 9 whistles it would have been fine, but I
		guess that's not a good enough excuse for the manufacturers to add another.
	</p>

	<p>
		Joy to the world is far more pleasing and manages to get everyone round the
		table involved as early as it's possible to do so:
	</p>

	<CarolTally slug="joy-to-the-world" />
	<p>
		Only 4 of our 20 carols can fit all notes on these 8 pitches without going
		up or down an octave, making them 100% playable. The rest need to make
		compromises here and there, and hope the listener can still make out the
		tune when the octaves are jumping all over the place. Select a carol below
		and listen for yourself:
	</p>
	<CarolPicker />

	<p>Adding up the tallies for each carol gives us our first result</p>
	<CarolsTally />

	<hr />
	<p>Notes:</p>
	<ul>
		<li>Minor/major keys?</li>
		<li>Deeper dive into % playable?</li>
		<li>Each note is a ball which drops in a bucket rather than histogram?</li>
		<li>Need to make a viz box or something</li>
	</ul>
</main>

<style>
	main {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
</style>
