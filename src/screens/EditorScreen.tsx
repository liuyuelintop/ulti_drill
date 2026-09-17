import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAutoOrientation } from "../lib/useAutoOrientation";
import {
  applyTeamSize,
  countByType,
  createInitialFrames,
} from "../features/playbook/utils/team";
import type { DraggableItem } from "../features/playbook/types";

const CATEGORIES: PlayCategory[] = ["play", "formation", "drill"];

const EMPTY_FRAMES: DraggableItem[][] = [];
const EMPTY_FRAME: DraggableItem[] = [];

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
  const { orientation, setOrientation } = useAutoOrientation();

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

  const patch = useCallback((changes: Partial<Play>) => {
    setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
    setDirty(true);
  }, []);

  const moveItem = useCallback(
    (itemId: string, x: number, y: number) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const nextFrames = prev.frames.map((frame, i) =>
          i === frameIndex
            ? frame.map((item) => (item.id === itemId ? { ...item, x, y } : item))
            : frame
        );
        return { ...prev, frames: nextFrames };
      });
      setDirty(true);
    },
    [frameIndex]
  );

  const setFrames = useCallback(
    (nextFrames: DraggableItem[][], notes?: string[]) => {
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              frames: nextFrames,
              frame_notes: notes ?? nextFrames.map((_, i) => prev.frame_notes[i] ?? ""),
            }
          : prev
      );
      setDirty(true);
    },
    []
  );

  const addFrame = () => {
    if (!draft) return;
    const clone = structuredClone(currentFrame);
    const nextFrames = [
      ...frames.slice(0, frameIndex + 1),
      clone,
      ...frames.slice(frameIndex + 1),
    ];
    const nextNotes = [
      ...draft.frame_notes.slice(0, frameIndex + 1),
      "",
      ...draft.frame_notes.slice(frameIndex + 1),
    ];
    setFrames(nextFrames, nextNotes);
    setFrameIndex(frameIndex + 1);
  };

  const deleteFrame = () => {
    if (!draft || frames.length <= 1) return;
    setFrames(
      frames.filter((_, i) => i !== frameIndex),
      draft.frame_notes.filter((_, i) => i !== frameIndex)
    );
    setFrameIndex(Math.max(0, frameIndex - 1));
  };

  const setRoster = (offense: number, defense: number) => {
    setFrames(applyTeamSize(frames, offense, defense));
  };

  const setNote = (value: string) => {
    if (!draft) return;
    const notes = [...draft.frame_notes];
    notes[frameIndex] = value;
    patch({ frame_notes: notes });
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
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Name this play"
          maxLength={40}
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
          editable
          selectedId={selectedId}
          onMove={moveItem}
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
              dot="bg-red-500"
              value={roster.offense}
              min={1}
              max={7}
              onChange={(v) => setRoster(v, roster.defense)}
            />
            <FieldStepper
              label="Defence"
              dot="bg-blue-500"
              value={roster.defense}
              min={0}
              max={7}
              onChange={(v) => setRoster(roster.offense, v)}
            />
          </div>
        </div>
      </div>

      {/* Frame note */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-2">
        <input
          value={draft.frame_notes[frameIndex] ?? ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Note for frame ${frameIndex + 1}, e.g. "2 fakes the in-cut then goes deep"`}
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
          onPatch={patch}
          onRoster={setRoster}
          onDelete={handleDelete}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ sheet */

interface SettingsSheetProps {
  draft: Play;
  roster: { offense: number; defense: number };
  canDelete: boolean;
  onPatch: (changes: Partial<Play>) => void;
  onRoster: (offense: number, defense: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** Compact roster control shown over the field on wider screens. */
const FieldStepper: React.FC<{
  label: string;
  dot: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, dot, value, min, max, onChange }) => (
  <div className="flex items-center gap-1.5 rounded-lg bg-black/55 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-white backdrop-blur">
    <span className={`h-2 w-2 rounded-full ${dot}`} />
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
        className="h-8 w-8 rounded-lg bg-slate-800 text-lg font-bold text-slate-200 disabled:opacity-30"
      >
        +
      </button>
    </div>
  </div>
);

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  draft,
  roster,
  canDelete,
  onPatch,
  onRoster,
  onDelete,
  onClose,
}) => (
  <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center">
    <div
      className="absolute inset-0"
      onClick={onClose}
      role="presentation"
    />
    <div className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border-t border-slate-800 bg-slate-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl sm:border">
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

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Description
      </label>
      <textarea
        value={draft.description}
        onChange={(e) => onPatch({ description: e.target.value })}
        rows={4}
        placeholder="When to call it, what makes it work, common mistakes…"
        className="mb-4 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 p-3 text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Tags (comma separated)
      </label>
      <input
        value={draft.tags.join(", ")}
        onChange={(e) =>
          onPatch({
            tags: e.target.value
              .split(/[,，]/)
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        placeholder="pull play, huck, vs zone"
        className="mb-4 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Players on field
      </label>
      <p className="mb-1.5 text-[11px] text-slate-600">
        Applies to every frame in this play.
      </p>
      <div className="mb-4 space-y-2">
        <Stepper
          label="Offence (red)"
          value={roster.offense}
          min={1}
          max={7}
          onChange={(v) => onRoster(v, roster.defense)}
        />
        <Stepper
          label="Defence (blue)"
          value={roster.defense}
          min={0}
          max={7}
          onChange={(v) => onRoster(roster.offense, v)}
        />
      </div>

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
