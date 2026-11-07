import type { EditorAction } from "./editor";

const KEY_ACTIONS: Record<string, EditorAction> = {
	" ": { type: "insert", slot: null },
	"'": { type: "octave", delta: 1 },
	",": { type: "octave", delta: -1 },
	"#": { type: "accidental", value: 1 },
	b: { type: "accidental", value: -1 },
	Backspace: { type: "backspace" },
	ArrowLeft: { type: "move", delta: -1 },
	ArrowRight: { type: "move", delta: 1 }
};

const FORM_FIELDS = new Set(["INPUT", "SELECT", "TEXTAREA"]);

export function isFormField(target: EventTarget | null): boolean {
	return target instanceof HTMLElement && FORM_FIELDS.has(target.tagName);
}

/** Maps a keypress to an editor action, ignoring keys typed into form fields. */
export function shortcutFor(event: KeyboardEvent): EditorAction | undefined {
	if (isFormField(event.target)) return undefined;
	if (event.metaKey || event.ctrlKey || event.altKey) return undefined;
	if (/^[1-7]$/.test(event.key)) {
		return {
			type: "insert",
			slot: { degree: Number(event.key), accidental: 0, octave: 0 }
		};
	}
	return KEY_ACTIONS[event.key];
}
