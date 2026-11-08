import * as Tone from "tone";
import { SWING_DELAY } from "./swing";

export const INSTRUMENT_KINDS = ["bell", "whistle", "xylophone"] as const;
export type InstrumentKind = (typeof INSTRUMENT_KINDS)[number];

type SampleFiles = Record<string, string>;

/** Struck instruments ring out after the strike; blown ones sound only while the note lasts. */
export type Envelope = "struck" | "blown";

/**
 * Recordings named by the MIDI note they sound; credited in `src/samples/CREDITS.md`.
 * `volume` is in decibels: the whistle has no strike transient, so it is lifted to sound as loud.
 */
const VOICES: Record<
	InstrumentKind,
	{ files: SampleFiles; envelope: Envelope; volume: number }
> = {
	bell: {
		files: import.meta.glob("./samples/bell/*.mp3", {
			query: "?url",
			import: "default",
			eager: true
		}),
		envelope: "struck",
		volume: 0
	},
	whistle: {
		files: import.meta.glob("./samples/whistle/*.mp3", {
			query: "?url",
			import: "default",
			eager: true
		}),
		envelope: "blown",
		volume: 3
	},
	xylophone: {
		files: import.meta.glob("./samples/xylophone/*.mp3", {
			query: "?url",
			import: "default",
			eager: true
		}),
		envelope: "struck",
		volume: 0
	}
};

export function envelope(kind: InstrumentKind): Envelope {
	return VOICES[kind].envelope;
}

/** Cracker instruments sound two octaves above the written melody. */
const OCTAVE_SHIFT = 24;

const samplers = new Map<InstrumentKind, Tone.Sampler>();

interface SlotEvent {
	time: string;
	midi: number | null;
	index: number;
}

let part: Tone.Part<SlotEvent> | undefined;

/** The instrument the melody plays on; `setKind` swaps it without stopping playback. */
let voice: { kind: InstrumentKind; sampler: Tone.Sampler } | undefined;
/** The kind last asked for, so an earlier, slower load does not win. */
let wantedKind: InstrumentKind | undefined;

/** Playback tempo in quarter notes per minute. */
export const DEFAULT_TEMPO = 100;

let tempo = DEFAULT_TEMPO;
let transpose = 0;
/** Audio time the last start, resume or paused seek takes effect, a look-ahead after the call. */
let settledAt = 0;

function sampleUrls(files: SampleFiles): Record<number, string> {
	return Object.fromEntries(
		Object.entries(files).map(([path, url]) => [
			Number(path.slice(path.lastIndexOf("/") + 1, -".mp3".length)),
			url
		])
	);
}

/** Creates the instrument's sampler on first use and waits for its recordings to load. */
async function getSampler(kind: InstrumentKind): Promise<Tone.Sampler> {
	await Tone.start();
	const sampler =
		samplers.get(kind) ??
		new Tone.Sampler({
			urls: sampleUrls(VOICES[kind].files),
			volume: VOICES[kind].volume
		}).toDestination();
	samplers.set(kind, sampler);
	await Tone.loaded();
	return sampler;
}

function frequency(midi: number): number {
	return Tone.Frequency(midi + OCTAVE_SHIFT + transpose, "midi").toFrequency();
}

function sound(
	kind: InstrumentKind,
	sampler: Tone.Sampler,
	midi: number,
	duration: Tone.Unit.Time,
	time?: Tone.Unit.Time
): void {
	if (VOICES[kind].envelope === "struck")
		sampler.triggerAttack(frequency(midi), time);
	else sampler.triggerAttackRelease(frequency(midi), duration, time);
}

/** Sets the tempo, taking effect immediately if a melody is playing. */
export function setTempo(bpm: number): void {
	tempo = bpm;
	Tone.getTransport().bpm.value = bpm;
}

/** Shifts all playback by this many semitones, from the next note sounded. */
export function setTranspose(semitones: number): void {
	transpose = semitones;
}

export async function preview(
	midi: number,
	kind: InstrumentKind = "bell"
): Promise<void> {
	sound(kind, await getSampler(kind), midi, "8n");
}

/** Stops the transport and drops the melody, leaving notes already struck to ring out. */
function halt(): void {
	const transport = Tone.getTransport();
	transport.stop();
	transport.cancel();
	Tone.getDraw().cancel();
	part?.dispose();
	part = undefined;
}

export function stop(): void {
	halt();
	for (const sampler of samplers.values()) sampler.releaseAll();
}

/** Position of a 16th-note slot, in bars:beats:sixteenths, so it follows tempo changes. */
function slotTime(index: number): string {
	return `0:0:${index}`;
}

/** Transport ticks in one 16th-note slot. */
function ticksPerSlot(): number {
	return Tone.getTransport().PPQ / 4;
}

/**
 * Tone delays each off-subdivision tick by `swing` × two-thirds of a subdivision pair; with a
 * one-slot subdivision that delay is `swing` × ⅔ slot, so this amount delays odd slots by SWING_DELAY.
 */
const TONE_SWING = SWING_DELAY * (3 / 2);

/**
 * Plays one 16th-note slot per entry on the instrument, from slot `from`; null entries are rests.
 * A swung melody sounds each odd slot SWING_DELAY late. Calls onSlot with each slot's index as
 * it sounds, in sync with the audio.
 */
export async function play(
	midis: (number | null)[],
	swing: boolean,
	kind: InstrumentKind,
	onSlot: (index: number) => void,
	onEnd: () => void,
	from = 0
): Promise<void> {
	await setKind(kind);
	stop();
	const transport = Tone.getTransport();
	transport.bpm.value = tempo;
	transport.swingSubdivision = "16n";
	transport.swing = swing ? TONE_SWING : 0;
	const events = midis.map((midi, index) => ({
		time: slotTime(index),
		midi,
		index
	}));
	part = new Tone.Part<SlotEvent>((time, event) => {
		if (voice && event.midi !== null)
			sound(voice.kind, voice.sampler, event.midi, "16n", time);
		Tone.getDraw().schedule(() => onSlot(event.index), time);
	}, events).start(0);
	/* Fires a look-ahead early; the end waits for the audio, as onSlot does, and the last note rings on. */
	transport.scheduleOnce((time) => {
		Tone.getDraw().schedule(() => {
			halt();
			onEnd();
		}, time);
	}, slotTime(midis.length));
	settledAt = Tone.now();
	/* Tone reads ticks notation as whole numbers only; "224.64i" would be taken as seconds. */
	transport.start(settledAt, `${Math.round(from * ticksPerSlot())}i`);
}

/** Plays the melody on this instrument from the next note, once its recordings load. */
export async function setKind(kind: InstrumentKind): Promise<void> {
	wantedKind = kind;
	const sampler = await getSampler(kind);
	if (wantedKind !== kind) return;
	voice?.sampler.releaseAll();
	voice = { kind, sampler };
}

/**
 * Holds playback a look-ahead after the call, once the notes already scheduled have sounded;
 * `position` keeps moving until then. `resume` carries on from the same slot.
 */
export function pause(): void {
	Tone.getTransport().pause();
}

export function resume(): void {
	settledAt = Tone.now();
	Tone.getTransport().start(settledAt);
}

/** Moves a playing or paused melody to a position in 16th slots. */
export function seek(slot: number): void {
	const transport = Tone.getTransport();
	transport.ticks = slot * ticksPerSlot();
	if (transport.state === "paused") settledAt = Tone.now();
}

/**
 * The playing position in 16th slots, read at audio time so it lines up with onSlot. Until a
 * start or paused seek takes effect, it is the position it moves to, not the one held before.
 */
export function position(): number {
	const time = Math.max(Tone.immediate(), settledAt);
	return Tone.getTransport().getTicksAtTime(time) / ticksPerSlot();
}
