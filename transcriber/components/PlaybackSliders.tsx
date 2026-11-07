import type { PointerEvent, ReactNode } from "react";

interface SliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	display: ReactNode;
	onChange: (value: number) => void;
}

/** Drops focus after a drag so digit shortcuts go to the melody, not the slider. */
function blur(event: PointerEvent<HTMLInputElement>) {
	event.currentTarget.blur();
}

function Slider({ label, value, min, max, display, onChange }: SliderProps) {
	return (
		<label className="flex items-center gap-2">
			{label}
			<input
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
				onPointerUp={blur}
				className="w-48 accent-gray-800"
			/>
			<span className="w-16 font-mono">{display}</span>
		</label>
	);
}

interface PlaybackSlidersProps {
	tempo: number;
	transpose: number;
	keyName: string;
	onTempoChange: (bpm: number) => void;
	onTransposeChange: (semitones: number) => void;
}

export function PlaybackSliders({
	tempo,
	transpose,
	keyName,
	onTempoChange,
	onTransposeChange
}: PlaybackSlidersProps) {
	return (
		<div className="flex gap-6 text-sm">
			<Slider
				label="Key"
				value={transpose}
				min={-6}
				max={5}
				display={`${keyName} major`}
				onChange={onTransposeChange}
			/>
			<Slider
				label="Tempo"
				value={tempo}
				min={40}
				max={200}
				display={`♩ = ${tempo}`}
				onChange={onTempoChange}
			/>
		</div>
	);
}
