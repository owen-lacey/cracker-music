/**
 * Swung carols are written on the straight slot grid; playback delays every odd slot by a
 * third of a slot, so each pair of slots plays long-short, 2:1.
 */
export const SWING_DELAY = 1 / 3;

/** How late, in slots, the slot at this index sounds. */
export function swingDelay(index: number, swing: boolean): number {
	return swing && index % 2 === 1 ? SWING_DELAY : 0;
}
