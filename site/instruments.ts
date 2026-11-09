import type { Component } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { SVGAttributes } from "svelte/elements";
import { formatSlot, type ScaleNote } from "../src/melody";
import type { InstrumentKind } from "../src/player";
import { WHISTLES, whistleOf, type Whistle } from "../src/whistles";

/** How a note reads in the post: the number of the instrument that plays it, or, when none does, its degree with no octave mark. */
export function noteLabel(note: ScaleNote): string {
	const whistle = whistleOf(note);
	return whistle === null
		? formatSlot({ ...note, octave: 0 })
		: String(numberFor(whistle));
}

/** Cracker instruments are numbered 1–8, low to high. */
export type InstrumentNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type Artwork = Component<SVGAttributes<SVGSVGElement>>;

const ARTWORK = import.meta.glob<Artwork>("./assets/instruments/*.svg", {
	query: "?component",
	import: "default",
	eager: true
});

const ICONS = import.meta.glob<Artwork>("./assets/icons/*.svg", {
	query: "?component",
	import: "default",
	eager: true
});

/** How each instrument kind is named in the post's controls. */
export const KIND_LABELS: Record<InstrumentKind, string> = {
	bell: "Bells",
	whistle: "Whistles",
	xylophone: "Xylophones"
};

/** The tallest artwork of any kind, in px; a row reserves it so its height holds when the kind changes. */
export const ARTWORK_HEIGHT = __ARTWORK_HEIGHT__;

export function artwork(
	kind: InstrumentKind,
	number: InstrumentNumber
): Artwork {
	return ARTWORK[`./assets/instruments/${kind}-${number}.svg`];
}

/** A single-colour outline icon of an instrument kind, stroked in `currentColor`. */
export function icon(kind: InstrumentKind): Artwork {
	return ICONS[`./assets/icons/${kind}.svg`];
}

/** The whistle (scale note) an instrument of any kind plays. */
export function whistleFor(number: InstrumentNumber): Whistle {
	return WHISTLES[number - 1];
}

/** The instrument number that plays a whistle's note; the inverse of `whistleFor`. */
export function numberFor(whistle: Whistle): InstrumentNumber {
	return (WHISTLES.indexOf(whistle) + 1) as InstrumentNumber;
}

/**
 * Which parts (`data-part` groups) of each artwork to measure: sound waves sit either side of
 * `span`, level with the middle of `level`; bells swing from the middle of `pivot`, their handle.
 */
const PARTS: Record<
	InstrumentKind,
	{ span: string; level: string; pivot?: string }
> = {
	bell: { span: "body", level: "body", pivot: "handle" },
	whistle: { span: "mouthpiece", level: "window" },
	xylophone: { span: "frame", level: "frame" }
};

/** Measures the artwork inside the stage and exposes its wave and pivot positions as CSS custom properties. */
export function anchor(kind: InstrumentKind): Attachment<HTMLElement> {
	return (stage) => {
		const svg = stage.querySelector("svg");
		if (!svg) throw new Error(`No ${kind} artwork to measure`);
		// A part's fill layer is its silhouette; the whole group's box would include its unclipped shade.
		// Boxes are in the artwork's user space, so shift them by its cropped viewBox origin into the stage's.
		const origin = svg.viewBox.baseVal;
		const box = (part: string) => {
			const fill = svg.querySelector<SVGGraphicsElement>(
				`[data-part="${part}"] > [data-layer="fill"]`
			);
			if (!fill) throw new Error(`No ${part} in the ${kind} artwork`);
			const { x, y, width, height } = fill.getBBox();
			return { x: x - origin.x, y: y - origin.y, width, height };
		};
		const { span, level, pivot } = PARTS[kind];
		const spanBox = box(span);
		const levelBox = box(level);
		stage.style.setProperty("--wave-left", `${spanBox.x}px`);
		stage.style.setProperty("--wave-right", `${spanBox.x + spanBox.width}px`);
		stage.style.setProperty(
			"--wave-y",
			`${levelBox.y + levelBox.height / 2}px`
		);
		if (pivot === undefined) return;
		const pivotBox = box(pivot);
		stage.style.setProperty(
			"--pivot-x",
			`${pivotBox.x + pivotBox.width / 2}px`
		);
		stage.style.setProperty(
			"--pivot-y",
			`${pivotBox.y + pivotBox.height / 2}px`
		);
	};
}

/**
 * Gives every instrument in a row an equal slot and shrinks the row to fit its width on one line:
 * sets `--slot` to the widest artwork's natural width, and `--fit` (at most 1) to the row's width
 * over the slots' natural width plus their unscaled `--instrument-gap`s.
 * Each child of the row holds one instrument, whose first `<svg>` is its artwork.
 */
export const fit: Attachment<HTMLElement> = (row) => {
	const resize = () => {
		const items = [...row.children];
		const slot = Math.max(
			...items.map((item) => {
				const svg = item.querySelector("svg");
				if (!svg) throw new Error("No artwork to fit in the instruments row");
				return svg.width.baseVal.value;
			})
		);
		const gap = parseFloat(
			getComputedStyle(row).getPropertyValue("--instrument-gap")
		);
		const natural = slot * items.length + gap * (items.length - 1);
		row.style.setProperty("--slot", `${slot}px`);
		row.style.setProperty("--fit", `${Math.min(1, row.clientWidth / natural)}`);
	};
	const observer = new ResizeObserver(resize);
	observer.observe(row);
	return () => observer.disconnect();
};
