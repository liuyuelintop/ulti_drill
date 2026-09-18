import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlaybook } from "../data/playbookStore";
import {
  CATEGORY_LABELS,
  emptyPlay,
  type Play,
  type PlayCategory,
} from "../data/types";
import { navigate } from "../lib/useHashRoute";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { FieldStage, type FieldOrientation } from "../features/field/FieldStage";
import { describeFrame } from "../features/field/describe";
import { useAutoOrientation } from "../lib/useAutoOrientation";
import { useFieldTheme } from "../lib/useFieldTheme";
import { DEFAULT_STANDARD } from "../features/playbook/constants/standards";
import {
  addItem,
  applyTeamSize,
  countByType,
  createInitialFrames,
  relabelItem,
  removeItem,
} from "../features/playbook/utils/team";
import type { DraggableItem } from "../features/playbook/types";

const CATEGORIES: PlayCategory[] = ["play", "formation", "drill"];

const EMPTY_FRAMES: DraggableItem[][] = [];
const EMPTY_FRAME: DraggableItem[] = [];

const { length: FIELD_L } = DEFAULT_STANDARD.dimensions;
/** Deep enough to undo a bad session, short enough to stay cheap. */
const HISTORY_LIMIT = 60;

/** Only field furniture can be deleted one at a time; players come in numbered sets. */
const isFurniture = (item?: DraggableItem) =>
  item?.type === "cone" || item?.type === "text";

/**
 * Where a new cone or note lands: mid-field, fanned out so a second one doesn't
 * hide under the first.
 */
/** Columns and rows of the fan new cones and notes are dropped into. */
const DROP_COLUMNS = 3;
const DROP_ROWS = 3;

/**
 * New cones and notes land along the near sideline rather than mid-field: the
 * middle is where every stack and every handler set already is, and dropping a
 * cone on top of the thrower makes it look like nothing happened. Spread wide
 * enough that a note's text does not cover the cone beside it.
 */
const dropSpot = (frame: DraggableItem[]) => {
  const n = frame.filter((i) => i.type === "cone" || i.type === "text").length;
  const slot = n % (DROP_COLUMNS * DROP_ROWS);
  return {
    x: FIELD_L / 2 - 13 + (slot % DROP_COLUMNS) * 13,
    y: 5 + Math.floor(slot / DROP_COLUMNS) * 5,
  };
};

export const EditorScreen: React.FC<{ id: string | null }> = ({ id }) => {
  const { plays, loading, save, remove, author } = usePlaybook();

  const [draft, setDraft] = useState<Play | null>(() =>
    id === null
      ? {
          ...emptyPlay(""),
          frames: createInitialFrames(),
          frame_notes: [""],
        }
      : null
  );
  const [frameIndex, setFrameIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(id === null);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [past, setPast] = useState<Play[]>([]);
  const [future, setFuture] = useState<Play[]>([]);
  const { orientation, setOrientation } = useAutoOrientation();
  const { themeName, toggleTheme } = useFieldTheme();
  const labelRef = useRef<HTMLInputElement>(null);
  /** Collapses a run of related edits (a drag, a burst of typing) into one undo. */
  const gestureRef = useRef<string | null>(null);

  // The play may still be loading when this screen mounts; adopt it as the
  // draft the first render after it arrives.
  const source = id === null ? null : (plays.find((p) => p.id === id) ?? null);
  if (draft === null && source !== null) {
    setDraft(structuredClone(source));
  }

  const frames = useMemo(() => draft?.frames ?? EMPTY_FRAMES, [draft]);
  const currentFrame = useMemo(
    () => frames[frameIndex] ?? EMPTY_FRAME,
    [frames, frameIndex]
  );
  const roster = useMemo(() => countByType(currentFrame), [currentFrame]);
  const selected = useMemo(
    () => currentFrame.find((i) => i.id === selectedId),
    [currentFrame, selectedId]
  );

  /**
   * Snapshot the draft before changing it. Passing the same `gesture` twice in a
   * row folds those edits together, so dragging a player is one undo step rather
   * than one per pointer move.
   */
  const snapshot = useCallback(
    (gesture?: string) => {
      if (!draft) return;
      if (gesture !== undefined && gestureRef.current === gesture) return;
      gestureRef.current = gesture ?? null;
      setPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), draft]);
      setFuture([]);
    },
    [draft]
  );

  const endGesture = useCallback(() => {
    gestureRef.current = null;
  }, []);

  const patch = useCallback(
    (changes: Partial<Play>, gesture?: string) => {
      snapshot(gesture);
      setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
      setDirty(true);
    },
    [snapshot]
  );

  const setFrames = useCallback(
    (nextFrames: DraggableItem[][], notes?: string[], gesture?: string) => {
      snapshot(gesture);
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              frames: nextFrames,
              frame_notes:
                notes ?? nextFrames.map((_, i) => prev.frame_notes[i] ?? ""),
            }
          : prev
      );
      setDirty(true);
    },
    [snapshot]
  );

  const moveItem = useCallback(
    (itemId: string, x: number, y: number) => {
      setFrames(
        frames.map((frame, i) =>
          i === frameIndex
            ? frame.map((item) => (item.id === itemId ? { ...item, x, y } : item))
            : frame
        )
      );
      endGesture();
    },
    [frames, frameIndex, setFrames, endGesture]
  );

  /** Bend the path a player takes into this frame. */
  const curveItem = useCallback(
    (itemId: string, cx: number, cy: number, done: boolean) => {
      setFrames(
        frames.map((frame, i) =>
          i === frameIndex
            ? frame.map((item) =>
                item.id === itemId ? { ...item, cx, cy } : item
              )
            : frame
        ),
        undefined,
        `curve:${itemId}`
      );
      if (done) endGesture();
    },
    [frames, frameIndex, setFrames, endGesture]
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      if (!prev.length || !draft) return prev;
      setFuture((f) => [draft, ...f].slice(0, HISTORY_LIMIT));
      setDraft(prev[prev.length - 1]);
      setDirty(true);
      gestureRef.current = null;
      return prev.slice(0, -1);
    });
  }, [draft]);

  const redo = useCallback(() => {
    setFuture((next) => {
      if (!next.length || !draft) return next;
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), draft]);
      setDraft(next[0]);
      setDirty(true);
      gestureRef.current = null;
      return next.slice(1);
    });
  }, [draft]);

  const addFrame = () => {
    if (!draft) return;
    const clone = structuredClone(currentFrame);
    setFrames(
      [...frames.slice(0, frameIndex + 1), clone, ...frames.slice(frameIndex + 1)],
      [
        ...draft.frame_notes.slice(0, frameIndex + 1),
        "",
        ...draft.frame_notes.slice(frameIndex + 1),
      ]
    );
    setFrameIndex(frameIndex + 1);
    endGesture();
  };

  const deleteFrame = () => {
    if (!draft || frames.length <= 1) return;
    setFrames(
      frames.filter((_, i) => i !== frameIndex),
      draft.frame_notes.filter((_, i) => i !== frameIndex)
    );
    setFrameIndex(Math.max(0, frameIndex - 1));
    endGesture();
  };

  const setRoster = (offense: number, defense: number) => {
    setFrames(applyTeamSize(frames, offense, defense));
    endGesture();
  };

  const addFurniture = (type: "cone" | "text") => {
    const { frames: next, id: newId } = addItem(
      frames,
      type,
      dropSpot(currentFrame),
      type === "text" ? "Note" : ""
    );
    setFrames(next);
    setSelectedId(newId);
    endGesture();
    if (type === "text") {
      // Straight into naming it — an unnamed note is useless.
      requestAnimationFrame(() => labelRef.current?.select());
    }
  };

  const deleteSelected = useCallback(() => {
    if (!isFurniture(selected) || !selectedId) return;
    setFrames(removeItem(frames, selectedId));
    setSelectedId(null);
    endGesture();
  }, [selected, selectedId, frames, setFrames, endGesture]);

  const setNote = (value: string) => {
    if (!draft) return;
    const notes = [...draft.frame_notes];
    notes[frameIndex] = value;
    patch({ frame_notes: notes }, `note:${frameIndex}`);
  };

  const handleSave = async () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setSettingsOpen(true);
      return;
    }
    setSaving(true);
    const saved = await save({ ...draft, name, author: draft.author || author });
    setSaving(false);
    setDirty(false);
    navigate(`#/p/${saved.id}`);
  };

  const handleBack = () => {
    if (dirty && !window.confirm("You have unsaved changes. Leave anyway?"))
      return;
    navigate(id ? `#/p/${id}` : "#/");
  };

  const handleDelete = async () => {
    if (!draft || !id) return;
    if (
      !window.confirm(
        `Delete "${draft.name}"? It disappears for your teammates too, and this can't be undone.`
      )
    )
      return;
    await remove(id);
    navigate("#/");
  };

  // Warn before a tab close swallows unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /INPUT|TEXTAREA/.test(el.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        if (!isFurniture(selected)) return;
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, deleteSelected, selected]);

  if (!draft) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-slate-400">
        {loading ? "Loading…" : "That play doesn't exist"}
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-950">
      {/* Top bar */}
      <header className="z-20 flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="Back"
        >
          <Icon name="back" />
        </button>

        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value }, "name")}
          placeholder="Name this play"
          maxLength={40}
          aria-label="Play name"
          className="h-10 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-900 px-3 text-[15px] font-bold text-white placeholder:font-normal placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />

        <button
          onClick={() =>
            setOrientation(orientation === "vertical" ? "horizontal" : "vertical")
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="Rotate field"
        >
          <Icon name="rotate" size={18} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold text-slate-300 active:bg-slate-800"
          aria-label="Play settings"
        >
          <Icon name="sliders" size={18} />
          <span className="hidden md:inline">Settings</span>
        </button>
        <Button
          variant="primary"
          aria-label="Save"
          onClick={handleSave}
          disabled={saving}
        >
          <Icon name="check" size={18} />
          <span className="hidden sm:inline">{saving ? "Saving…" : "Save"}</span>
        </Button>
      </header>

      {/* Field */}
      <div className="relative min-h-0 flex-1 bg-slate-900">
        <FieldStage
          items={currentFrame}
          trailFrom={frameIndex > 0 ? frames[frameIndex - 1] : undefined}
          ghostItems={frameIndex > 0 ? frames[frameIndex - 1] : undefined}
          orientation={orientation as FieldOrientation}
          themeName={themeName}
          ariaLabel={describeFrame(currentFrame, frameIndex, frames.length)}
          editable
          selectedId={selectedId}
          onMove={moveItem}
          onCurve={curveItem}
          onSelect={setSelectedId}
          className="absolute inset-0"
        />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="pointer-events-none rounded-lg bg-black/45 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
            Frame {frameIndex + 1} of {frames.length}
            {/* Kept short on phones so it clears the end zone label. */}
            <span className="hidden sm:inline"> · drag players to position</span>
          </span>
          {/* Phones get these in the settings sheet instead, where there's room. */}
          <div className="hidden items-center gap-2 sm:flex">
            <FieldStepper
              label="Offence"
              swatch="rounded-full bg-red-500"
              value={roster.offense}
              min={1}
              max={7}
              onChange={(v) => setRoster(v, roster.defense)}
            />
            <FieldStepper
              label="Defence"
              swatch="rounded-[3px] bg-blue-600"
              value={roster.defense}
              min={0}
              max={7}
              onChange={(v) => setRoster(roster.offense, v)}
            />
          </div>
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <OverlayButton label="Undo" icon="undo" onClick={undo} disabled={!past.length} />
          <OverlayButton
            label="Redo"
            icon="redo"
            onClick={redo}
            disabled={!future.length}
          />
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <OverlayButton
            label="Add cone"
            icon="cone"
            text="Cone"
            onClick={() => addFurniture("cone")}
          />
          <OverlayButton
            label="Add note on field"
            icon="text"
            text="Note"
            onClick={() => addFurniture("text")}
          />
        </div>

        {frameIndex > 0 && (
          <p className="pointer-events-none absolute bottom-3 left-3 max-w-[45%] rounded-lg bg-black/45 px-2.5 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur">
            Drag the dot on an arrow to bend the run
          </p>
        )}
      </div>

      {/* Selected item */}
      {isFurniture(selected) && selected && (
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-800 bg-slate-900 px-3 py-2">
          <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 text-[12px] font-bold text-slate-200">
            <Icon name={selected.type === "cone" ? "cone" : "text"} size={14} />
            {selected.type === "cone" ? "Cone" : "Note"}
          </span>
          {selected.type === "text" && (
            <input
              ref={labelRef}
              value={selected.label ?? ""}
              onChange={(e) =>
                setFrames(
                  relabelItem(frames, selected.id, e.target.value),
                  undefined,
                  `label:${selected.id}`
                )
              }
              placeholder="e.g. force forehand"
              maxLength={24}
              aria-label="Note text"
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
            />
          )}
          <span className="flex-1 text-[12px] text-slate-500 sm:text-right">
            {selected.type === "cone" ? "Appears in every frame" : ""}
          </span>
          <button
            onClick={deleteSelected}
            aria-label={`Delete this ${selected.type === "cone" ? "cone" : "note"}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 active:bg-slate-800"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      )}

      {/* Frame note */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-2">
        <input
          value={draft.frame_notes[frameIndex] ?? ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Note for frame ${frameIndex + 1}, e.g. "2 fakes the in-cut then goes deep"`}
          aria-label={`Coaching note for frame ${frameIndex + 1}`}
          className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Frame strip */}
      <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-hide">
            {frames.map((_, i) => (
              <button
                key={i}
                onClick={() => setFrameIndex(i)}
                aria-current={i === frameIndex}
                className={`h-10 min-w-10 shrink-0 rounded-lg text-[13px] font-bold transition-colors ${
                  i === frameIndex
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={addFrame}
              className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-dashed border-slate-700 px-2.5 text-[13px] font-bold text-sky-400 active:bg-slate-800"
            >
              <Icon name="plus" size={16} />
              Add frame
            </button>
          </div>

          <button
            onClick={deleteFrame}
            disabled={frames.length <= 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 active:bg-slate-800 disabled:opacity-30"
            aria-label="Delete this frame"
          >
            <Icon name="trash" size={17} />
          </button>
        </div>
      </footer>

      {settingsOpen && (
        <SettingsSheet
          draft={draft}
          roster={roster}
          canDelete={Boolean(id)}
          themeName={themeName}
          onToggleTheme={toggleTheme}
          onPatch={patch}
          onRoster={setRoster}
          onDelete={handleDelete}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- controls */

const OverlayButton: React.FC<{
  label: string;
  icon: "undo" | "redo" | "cone" | "text";
  text?: string;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, icon, text, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className="flex h-9 items-center gap-1.5 rounded-lg bg-black/55 px-2.5 text-[12px] font-bold text-white backdrop-blur active:bg-black/70 disabled:opacity-30"
  >
    <Icon name={icon} size={16} />
    {text && <span className="hidden sm:inline">{text}</span>}
  </button>
);

/** Compact roster control shown over the field on wider screens. */
const FieldStepper: React.FC<{
  label: string;
  swatch: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, swatch, value, min, max, onChange }) => (
  <div className="flex items-center gap-1.5 rounded-lg bg-black/55 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-white backdrop-blur">
    <span className={`h-2.5 w-2.5 ${swatch}`} />
    {label}
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`One fewer ${label} player`}
      className="ml-1 h-6 w-6 rounded bg-white/10 text-sm leading-none hover:bg-white/20 disabled:opacity-25"
    >
      −
    </button>
    <span className="w-4 text-center font-mono text-xs">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`One more ${label} player`}
      className="h-6 w-6 rounded bg-white/10 text-sm leading-none hover:bg-white/20 disabled:opacity-25"
    >
      +
    </button>
  </div>
);

const Stepper: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
    <span className="text-[13px] font-semibold text-slate-300">{label}</span>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`One fewer: ${label}`}
        className="h-8 w-8 rounded-lg bg-slate-800 text-lg font-bold text-slate-200 disabled:opacity-30"
      >
        −
      </button>
      <span className="w-5 text-center font-mono text-base font-bold text-white">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`One more: ${label}`}
        className="h-8 w-8 rounded-lg bg-slate-800 text-lg font-bold text-slate-200 disabled:opacity-30"
      >
        +
      </button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ sheet */

interface SettingsSheetProps {
  draft: Play;
  roster: { offense: number; defense: number };
  canDelete: boolean;
  themeName: string;
  onToggleTheme: () => void;
  onPatch: (changes: Partial<Play>, gesture?: string) => void;
  onRoster: (offense: number, defense: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  draft,
  roster,
  canDelete,
  themeName,
  onToggleTheme,
  onPatch,
  onRoster,
  onDelete,
  onClose,
}) => (
  <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center">
    <div className="absolute inset-0" onClick={onClose} role="presentation" />
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Play settings"
      className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border-t border-slate-800 bg-slate-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl sm:border"
    >
      <div className="mb-4 flex items-center">
        <h2 className="flex-1 text-lg font-bold text-white">Play settings</h2>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 active:bg-slate-800"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Category
      </label>
      <div className="mb-4 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onPatch({ category: c })}
            aria-pressed={draft.category === c}
            className={`h-10 flex-1 rounded-xl text-[13px] font-bold transition-colors ${
              draft.category === c
                ? "bg-sky-500 text-white"
                : "border border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <label
        htmlFor="play-description"
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
      >
        Description
      </label>
      <textarea
        id="play-description"
        value={draft.description}
        onChange={(e) => onPatch({ description: e.target.value }, "description")}
        rows={4}
        placeholder="When to call it, what makes it work, common mistakes…"
        className="mb-4 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 p-3 text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label
        htmlFor="play-tags"
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
      >
        Tags (comma separated)
      </label>
      <input
        id="play-tags"
        value={draft.tags.join(", ")}
        onChange={(e) =>
          onPatch(
            {
              tags: e.target.value
                .split(/[,，]/)
                .map((t) => t.trim())
                .filter(Boolean),
            },
            "tags"
          )
        }
        placeholder="pull play, huck, vs zone"
        className="mb-4 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Players on field
      </label>
      <p className="mb-1.5 text-[11px] text-slate-600">
        Applies to every frame in this play. Cones and notes are left alone.
      </p>
      <div className="mb-4 space-y-2">
        <Stepper
          label="Offence (red circles)"
          value={roster.offense}
          min={1}
          max={7}
          onChange={(v) => onRoster(v, roster.defense)}
        />
        <Stepper
          label="Defence (blue squares)"
          value={roster.defense}
          min={0}
          max={7}
          onChange={(v) => onRoster(roster.offense, v)}
        />
      </div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Field look
      </label>
      <button
        onClick={onToggleTheme}
        className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-left active:bg-slate-800"
      >
        <Icon name="contrast" size={18} className="shrink-0 text-slate-400" />
        <span className="flex-1">
          <span className="block text-[13px] font-semibold text-slate-200">
            {themeName === "grass" ? "Grass" : "Diagram"}
          </span>
          <span className="block text-[11px] text-slate-500">
            {themeName === "grass"
              ? "Tap for the flat, high-contrast look — better in sunlight and in print"
              : "Tap for the grass look"}
          </span>
        </span>
      </button>

      {canDelete && (
        <Button variant="danger" size="lg" className="w-full" onClick={onDelete}>
          <Icon name="trash" size={17} />
          Delete this play
        </Button>
      )}
    </div>
  </div>
);

export default EditorScreen;
