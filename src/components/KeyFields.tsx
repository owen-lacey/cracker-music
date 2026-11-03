import type { ChangeEvent } from "react";
import { MODES, TONICS } from "../pitch";

export interface Key {
  tonic: string;
  mode: string;
  tempo: number;
}

interface KeyFieldsProps {
  value: Key;
  onChange: (value: Key) => void;
}

/** Blurs after a change so digit shortcuts go to the melody, not the field. */
function blurAfter<T extends HTMLSelectElement | HTMLInputElement>(handle: (target: T) => void) {
  return (event: ChangeEvent<T>) => {
    handle(event.currentTarget);
    if (event.currentTarget instanceof HTMLSelectElement) event.currentTarget.blur();
  };
}

export function KeyFields({ value, onChange }: KeyFieldsProps) {
  return (
    <div className="flex gap-4 text-sm">
      <label className="flex items-center gap-2">
        Tonic
        <select
          value={value.tonic}
          onChange={blurAfter<HTMLSelectElement>((t) => onChange({ ...value, tonic: t.value }))}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {TONICS.map((tonic) => (
            <option key={tonic}>{tonic}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Mode
        <select
          value={value.mode}
          onChange={blurAfter<HTMLSelectElement>((t) => onChange({ ...value, mode: t.value }))}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {MODES.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Tempo (♩ =)
        <input
          type="number"
          min={20}
          max={300}
          value={value.tempo}
          onChange={blurAfter<HTMLInputElement>((t) => onChange({ ...value, tempo: t.valueAsNumber }))}
          className="w-20 rounded border border-gray-300 px-2 py-1"
        />
      </label>
    </div>
  );
}
