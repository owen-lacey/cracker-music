import { useEffect, useEffectEvent, useState } from "react";
import { type Carol, carols, type Sheet } from "./carols";
import { CarolList } from "./components/CarolList";
import { MelodyView } from "./components/MelodyView";
import { Pad } from "./components/Pad";
import { applyEdit, type EditorAction, type EditorState, emptyEditor, selectionRange } from "./editor";
import { formatMelody, parseMelody } from "./melody";
import { midiFor } from "./pitch";
import { play, preview, stop } from "./player";
import { isFormField, shortcutFor } from "./shortcuts";

const PREVIEWED_ACTIONS = new Set<EditorAction["type"]>(["insert", "octave"]);

function toSheet(carol: Carol, editor: EditorState): Sheet {
  return { title: carol.title, tune: carol.tune, melody: formatMelody(editor.slots) };
}

function isDirty(current: Sheet, saved: Sheet | undefined): boolean {
  return saved ? JSON.stringify(current) !== JSON.stringify(saved) : current.melody.length > 0;
}

export function App() {
  const [saved, setSaved] = useState<Record<string, Sheet>>({});
  const [carol, setCarol] = useState<Carol>(carols[0]);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [playing, setPlaying] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  const sheet = toSheet(carol, editor);
  const dirty = isDirty(sheet, saved[carol.slug]);

  useEffect(() => {
    fetch("/api/carols")
      .then((res) => res.json())
      .then(setSaved)
      .catch((error: Error) => setStatus(`Failed to load saved carols: ${error.message}`));
  }, []);

  function edit(action: EditorAction) {
    const next = applyEdit(editor, action);
    setEditor(next);
    const slot = next.slots[next.cursor - 1];
    if (PREVIEWED_ACTIONS.has(action.type) && slot) void preview(midiFor(slot));
  }

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const action = shortcutFor(event);
    if (!action) return;
    event.preventDefault();
    edit(action);
  });

  const onCopy = useEffectEvent((event: ClipboardEvent) => {
    if (isFormField(event.target) || !editor.selection) return;
    const { start, end } = selectionRange(editor.selection);
    event.clipboardData?.setData("text/plain", formatMelody(editor.slots.slice(start, end)));
    event.preventDefault();
  });

  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    if (isFormField(event.target)) return;
    event.preventDefault();
    const text = (event.clipboardData?.getData("text/plain") ?? "").replace(/[\r\n]/g, "");
    try {
      edit({ type: "paste", slots: parseMelody(text) });
      setStatus("");
    } catch (error) {
      setStatus(`Paste failed: ${(error as Error).message}`);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, []);

  function select(next: Carol) {
    if (dirty && !window.confirm(`Discard unsaved changes to ${carol.title}?`)) return;
    const existing = saved[next.slug];
    stopPlayback();
    setCarol(next);
    setEditor(applyEdit(emptyEditor, { type: "load", slots: existing ? parseMelody(existing.melody) : [] }));
    setStatus("");
  }

  async function save() {
    const res = await fetch(`/api/carols/${carol.slug}`, { method: "PUT", body: JSON.stringify(sheet) });
    if (!res.ok) {
      setStatus(`Save failed: ${res.status} ${res.statusText}`);
      return;
    }
    setSaved({ ...saved, [carol.slug]: sheet });
    setStatus(`Saved data/carols/${carol.slug}.json`);
  }

  function stopPlayback() {
    stop();
    setPlaying(false);
    setActiveSlot(null);
  }

  function togglePlay() {
    if (playing) {
      stopPlayback();
      return;
    }
    const start = editor.selection ? selectionRange(editor.selection).start : 0;
    const midis = editor.slots.slice(start).map((slot) => (slot ? midiFor(slot) : null));
    setPlaying(true);
    void play(midis, (index) => setActiveSlot(start + index), () => {
      setPlaying(false);
      setActiveSlot(null);
    });
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <CarolList carols={carols} saved={saved} selected={carol} onSelect={select} />
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold">
          {carol.title}
          {carol.tune && <span className="font-normal text-gray-500"> ({carol.tune})</span>}
          {dirty && <span className="ml-2 text-sm font-normal text-amber-600">unsaved</span>}
        </h1>
        <MelodyView
          slots={editor.slots}
          cursor={editor.cursor}
          activeSlot={activeSlot}
          selection={editor.selection}
          onAction={edit}
        />
        <p className="text-sm text-gray-600">
          {editor.slots.length} slots ({editor.slots.length / 4} beats). Keys: 1–7, then ' or , for octave; # or b
          before a degree; space = rest; ← → move; Backspace deletes. Drag or shift-click to select; ⌘C / ⌘V to copy
          and paste.
        </p>
        <Pad accidental={editor.accidental} onAction={edit} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={togglePlay}
            className="rounded bg-gray-800 px-4 py-2 text-white">
            {playing ? "Stop" : editor.selection === null ? "Play" : "Play from selection"}
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void save()}
            disabled={!dirty}
            className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-40"
          >
            Save
          </button>
          <span className="text-sm text-gray-600">{status}</span>
        </div>
      </main>
    </div>
  );
}
