import type { InstrumentKind } from "../src/player";

/** The instrument kind chosen in the picker; every instrument in the post plays this kind. */
export const selection = $state<{ kind: InstrumentKind }>({ kind: "bell" });
