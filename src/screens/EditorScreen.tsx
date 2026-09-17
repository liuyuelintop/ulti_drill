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
    if (dirty && !window.confirm("有未保存的改动，确定离开吗？")) return;
    navigate(id ? `#/p/${id}` : "#/");
  };

  const handleDelete = async () => {
    if (!draft || !id) return;
    if (!window.confirm(`删除「${draft.name}」？队友那边也会消失，且无法撤销。`)) return;
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
        {loading ? "加载中…" : "找不到这套战术"}
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
          aria-label="返回"
        >
          <Icon name="back" />
        </button>

        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="给战术起个名字"
          maxLength={40}
          className="h-10 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-900 px-3 text-[15px] font-bold text-white placeholder:font-normal placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />

        <button
          onClick={() =>
            setOrientation(orientation === "vertical" ? "horizontal" : "vertical")
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="旋转球场"
        >
          <Icon name="rotate" size={18} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="战术设置"
        >
          <Icon name="note" size={18} />
        </button>
        <Button
          variant="primary"
          aria-label="保存"
          onClick={handleSave}
          disabled={saving}
        >
          <Icon name="check" size={18} />
          <span className="hidden sm:inline">{saving ? "保存中" : "保存"}</span>
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
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          第 {frameIndex + 1} / {frames.length} 帧 · 拖动球员摆位
        </div>
      </div>

      {/* Frame note */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-2">
        <input
          value={draft.frame_notes[frameIndex] ?? ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`第 ${frameIndex + 1} 帧要点，比如「2 号假切内线再跑深」`}
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
              加一帧
            </button>
          </div>

          <button
            onClick={deleteFrame}
            disabled={frames.length <= 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 active:bg-slate-800 disabled:opacity-30"
            aria-label="删除当前帧"
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
        <h2 className="flex-1 text-lg font-bold text-white">战术设置</h2>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 active:bg-slate-800"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        分类
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
        战术说明
      </label>
      <textarea
        value={draft.description}
        onChange={(e) => onPatch({ description: e.target.value })}
        rows={4}
        placeholder="什么时候用、关键点是什么、常见失误…"
        className="mb-4 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 p-3 text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        标签（逗号分隔）
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
        placeholder="起手, 长传, 打 zone"
        className="mb-4 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        上场人数（会应用到所有帧）
      </label>
      <div className="mb-4 space-y-2">
        <Stepper
          label="进攻（红）"
          value={roster.offense}
          min={1}
          max={7}
          onChange={(v) => onRoster(v, roster.defense)}
        />
        <Stepper
          label="防守（蓝）"
          value={roster.defense}
          min={0}
          max={7}
          onChange={(v) => onRoster(roster.offense, v)}
        />
      </div>

      {canDelete && (
        <Button variant="danger" size="lg" className="w-full" onClick={onDelete}>
          <Icon name="trash" size={17} />
          删除这套战术
        </Button>
      )}
    </div>
  </div>
);

export default EditorScreen;
