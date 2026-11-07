import type { Component } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { SVGAttributes } from "svelte/elements";
import type { InstrumentKind } from "../src/player";
import { WHISTLES, type Whistle } from "../src/whistles";

/** Cracker instruments are numbered 1–8, low to high. */
export type InstrumentNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type Artwork = Component<SVGAttributes<SVGSVGElement>>;

const ARTWORK = import.meta.glob<Artwork>("./assets/instruments/*.svg", {
	query: "?component",
	import: "default",
	eager: true
});

export function artwork(
	kind: InstrumentKind,
	number: InstrumentNumber
): Artwork {
	return ARTWORK[`./assets/instruments/${kind}-${number}.svg`];
}

/** The whistle (scale note) an instrument of any kind plays. */
export function whistleFor(number: InstrumentNumber): Whistle {
	return WHISTLES[number - 1];
}

/**
 * Which children of each artwork's <svg> to measure: sound waves sit either side of `span`,
 * level with the middle of `level`; bells swing from the middle of `pivot`, their handle.
 */
const PARTS: Record<
	InstrumentKind,
	{ span: number; level: number; pivot?: number }
> = {
	bell: { span: 1, level: 1, pivot: 0 },
	whistle: { span: 2, level: 4 },
	xylophone: { span: 0, level: 0 }
};

/** Measures the artwork inside the stage and exposes its wave and pivot positions as CSS custom properties. */
export function anchor(kind: InstrumentKind): Attachment<HTMLElement> {
	return (stage) => {
		const svg = stage.querySelector("svg");
		if (!svg) throw new Error(`No ${kind} artwork to measure`);
		const box = (index: number) =>
			(svg.children[index] as SVGGraphicsElement).getBBox();
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
