import type { EditorAction } from "../editor";
import type { Accidental, Octave } from "../melody";
import { PadButton } from "./PadButton";

const DEGREES = [1, 2, 3, 4, 5, 6, 7];
const ROWS: { octave: Octave; mark: string }[] = [
  { octave: 1, mark: "'" },
  { octave: 0, mark: "" },
  { octave: -1, mark: "," },
];

interface PadProps {
  accidental: Accidental;
  onAction: (action: EditorAction) => void;
}

export function Pad({ accidental, onAction }: PadProps) {
  return (
    <div className="flex flex-col gap-2">
      {ROWS.map(({ octave, mark }) => (
        <div key={octave} className="flex gap-2">
          {DEGREES.map((degree) => (
            <PadButton key={degree} onPress={() => onAction({ type: "insert", slot: { degree, accidental: 0, octave } })}>
              {degree}
              {mark}
            </PadButton>
          ))}
        </div>
      ))}
      <div className="flex gap-2">
        <PadButton active={accidental === 1} onPress={() => onAction({ type: "accidental", value: 1 })}>
          ♯
        </PadButton>
        <PadButton active={accidental === -1} onPress={() => onAction({ type: "accidental", value: -1 })}>
          ♭
        </PadButton>
        <PadButton onPress={() => onAction({ type: "insert", slot: null })}>rest</PadButton>
        <PadButton onPress={() => onAction({ type: "backspace" })}>⌫</PadButton>
      </div>
    </div>
  );
}
