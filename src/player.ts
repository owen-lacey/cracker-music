import * as Tone from "tone";

let synth: Tone.PolySynth | undefined;

interface SlotEvent {
  time: string;
  midi: number | null;
  index: number;
}

let part: Tone.Part<SlotEvent> | undefined;

/** Playback tempo in quarter notes per minute. */
export const DEFAULT_TEMPO = 100;

let tempo = DEFAULT_TEMPO;
let transpose = 0;

function getSynth(): Tone.PolySynth {
  synth ??= new Tone.PolySynth(Tone.Synth).toDestination();
  return synth;
}

function frequency(midi: number): number {
  return Tone.Frequency(midi + transpose, "midi").toFrequency();
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

export async function preview(midi: number): Promise<void> {
  await Tone.start();
  getSynth().triggerAttackRelease(frequency(midi), "8n");
}

export function stop(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  Tone.getDraw().cancel();
  part?.dispose();
  part = undefined;
}

/** Position of a 16th-note slot, in bars:beats:sixteenths, so it follows tempo changes. */
function slotTime(index: number): string {
  return `0:0:${index}`;
}

/**
 * Plays one 16th-note slot per entry; null entries are rests.
 * Calls onSlot with each slot's index as it sounds, in sync with the audio.
 */
export async function play(
  midis: (number | null)[],
  onSlot: (index: number) => void,
  onEnd: () => void,
): Promise<void> {
  await Tone.start();
  stop();
  const transport = Tone.getTransport();
  transport.bpm.value = tempo;
  const events = midis.map((midi, index) => ({ time: slotTime(index), midi, index }));
  part = new Tone.Part<SlotEvent>((time, event) => {
    if (event.midi !== null) getSynth().triggerAttackRelease(frequency(event.midi), "16n", time);
    Tone.getDraw().schedule(() => onSlot(event.index), time);
  }, events).start(0);
  transport.scheduleOnce(() => {
    stop();
    onEnd();
  }, slotTime(midis.length));
  transport.start();
}
