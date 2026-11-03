import * as Tone from "tone";

let synth: Tone.PolySynth | undefined;

interface SlotEvent {
  time: number;
  midi: number | null;
  index: number;
}

let part: Tone.Part<SlotEvent> | undefined;

function getSynth(): Tone.PolySynth {
  synth ??= new Tone.PolySynth(Tone.Synth).toDestination();
  return synth;
}

function frequency(midi: number): number {
  return Tone.Frequency(midi, "midi").toFrequency();
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

/** Playback tempo in quarter notes per minute. */
const TEMPO = 100;

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
  transport.bpm.value = TEMPO;
  const step = Tone.Time("16n").toSeconds();
  const events = midis.map((midi, index) => ({ time: index * step, midi, index }));
  part = new Tone.Part<SlotEvent>((time, event) => {
    if (event.midi !== null) getSynth().triggerAttackRelease(frequency(event.midi), "16n", time);
    Tone.getDraw().schedule(() => onSlot(event.index), time);
  }, events).start(0);
  transport.scheduleOnce(() => {
    stop();
    onEnd();
  }, midis.length * step);
  transport.start();
}
