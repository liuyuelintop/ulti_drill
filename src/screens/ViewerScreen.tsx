import React, { useEffect, useMemo, useState } from "react";
import { usePlaybook } from "../data/playbookStore";
import { CATEGORY_LABELS } from "../data/types";
import { navigate } from "../lib/useHashRoute";
import { Icon } from "../components/Icon";
import { FieldStage, type FieldOrientation } from "../features/field/FieldStage";
import { usePlayback } from "../features/field/usePlayback";
import { playRegion, FULL_FIELD } from "../features/field/bounds";
import { useAutoOrientation } from "../lib/useAutoOrientation";
import type { DraggableItem } from "../features/playbook/types";
import { useFieldTheme } from "../lib/useFieldTheme";
import { describeFrame } from "../features/field/describe";

const SPEEDS = [0.5, 1, 1.5] as const;

export const ViewerScreen: React.FC<{ id: string }> = ({ id }) => {
  const { plays, loading } = usePlaybook();
  const play = useMemo(() => plays.find((p) => p.id === id), [plays, id]);
  const frames = useMemo(() => play?.frames ?? [], [play]);

  const { orientation, setOrientation, auto } = useAutoOrientation();
  const { themeName, toggleTheme } = useFieldTheme();
  const [notesOpen, setNotesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Zoom into the slice of field the play uses — the default, since reading the
  // play on a phone matters more than seeing empty grass.
  const [zoomed, setZoomed] = useState(true);
  const region = useMemo(
    () => (zoomed ? playRegion(frames) : FULL_FIELD),
    [zoomed, frames]
  );

  const { index, playing, speed, setSpeed, toggle, goTo, renderItems, prevItems } =
    usePlayback(frames);

  // Space bar scrubs playback on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /INPUT|TEXTAREA/.test(el.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "Escape") navigate("#/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, goTo, index]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: play?.name ?? "Play", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  };

  if (!play) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center">
        <p className="text-slate-400">
          {loading ? "Loading…" : "That play doesn't exist"}
        </p>
        {!loading && (
          <button
            onClick={() => navigate("#/")}
            className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white"
          >
            Back to playbook
          </button>
        )}
      </div>
    );
  }

  const note = play.frame_notes[index] ?? "";
  const hasNotes = Boolean(play.description) || play.frame_notes.some(Boolean);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-950">
      {/* Top bar */}
      <header className="z-20 flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate("#/")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="Back"
        >
          <Icon name="back" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold leading-tight text-white">
            {play.name}
          </h1>
          <p className="truncate text-[11px] text-slate-500">
            {CATEGORY_LABELS[play.category]} · {frames.length}{" "}
            {frames.length === 1 ? "frame" : "frames"}
            {play.author ? ` · ${play.author}` : ""}
          </p>
        </div>

        <button
          onClick={share}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 active:bg-slate-800"
          aria-label="Share link"
        >
          <Icon name={copied ? "check" : "share"} size={18} />
        </button>
        <button
          onClick={() =>
            setOrientation(orientation === "vertical" ? "horizontal" : "vertical")
          }
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl active:bg-slate-800 ${
            auto ? "text-slate-300" : "text-sky-400"
          }`}
          aria-label="Rotate field"
        >
          <Icon name="rotate" size={18} />
        </button>
        <button
          onClick={() => navigate(`#/p/${play.id}/edit`)}
          aria-label="Edit"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-3 text-[13px] font-bold text-slate-100 active:bg-slate-700"
        >
          <Icon name="edit" size={16} />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Field */}
        <div className="relative min-h-0 flex-1 bg-slate-900">
          <FieldStage
            items={renderItems}
            trailFrom={prevItems}
            showTrails={!playing}
            orientation={orientation as FieldOrientation}
            region={region}
            themeName={themeName}
            ariaLabel={describeFrame(renderItems, index, frames.length, note)}
            className="absolute inset-0"
          />
          <Legend items={renderItems} hasTrails={index > 0} />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={
                themeName === "grass"
                  ? "Switch to the high-contrast diagram field"
                  : "Switch to the grass field"
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur active:bg-black/70"
            >
              <Icon name="contrast" size={16} />
            </button>
            <button
              onClick={() => setZoomed((v) => !v)}
              className="h-8 rounded-lg bg-black/55 px-2.5 text-[11px] font-bold text-white backdrop-blur active:bg-black/70"
            >
              {zoomed ? "Full field" : "Fit to play"}
            </button>
          </div>
        </div>

        {/* Notes: sidebar on wide screens, sheet on phones */}
        {hasNotes && (
          <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-slate-800 bg-slate-950 p-4 lg:block">
            {play.description && (
              <>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  About this play
                </h2>
                <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {play.description}
                </p>
              </>
            )}
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Frame notes
            </h2>
            <ol className="space-y-2">
              {frames.map((_, i) => (
                <li key={i}>
                  <button
                    onClick={() => goTo(i)}
                    className={`flex w-full gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                      i === index
                        ? "border-sky-500/50 bg-sky-500/10"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        i === index ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-snug text-slate-300">
                      {play.frame_notes[i] || (
                        <span className="text-slate-600">No note yet</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>

      {/* Frame note strip (phones / tablets) */}
      {hasNotes && (
        <div className="shrink-0 border-t border-slate-800 bg-slate-900 lg:hidden">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left"
          >
            <Icon name="note" size={15} className="mt-0.5 shrink-0 text-sky-400" />
            <span
              className={`flex-1 text-[13px] leading-snug text-slate-300 ${
                notesOpen ? "" : "line-clamp-2"
              }`}
            >
              {note || play.description || "No note on this frame yet"}
            </span>
            <Icon
              name={notesOpen ? "chevronDown" : "chevronUp"}
              size={16}
              className="mt-0.5 shrink-0 text-slate-500"
            />
          </button>

          {notesOpen && play.description && (
            <div className="max-h-[30dvh] overflow-y-auto border-t border-slate-800 px-4 py-3">
              <h2 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                About this play
              </h2>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-400">
                {play.description}
              </p>
            </div>
          )}
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {describeFrame(frames[index] ?? [], index, frames.length, note)}
      </p>

      {/* Playback controls */}
      <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={toggle}
            disabled={frames.length < 2}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/25 transition-transform active:scale-95 disabled:opacity-30"
            aria-label={playing ? "Pause" : "Play"}
          >
            <Icon name={playing ? "pause" : "play"} size={22} />
          </button>

          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-hide">
            {frames.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-10 min-w-10 shrink-0 rounded-lg text-[13px] font-bold transition-colors ${
                  i === index
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed as 1) + 1) % SPEEDS.length])}
            className="h-10 shrink-0 rounded-lg border border-slate-800 px-2.5 font-mono text-[13px] font-bold text-slate-300 active:bg-slate-800"
          >
            {speed}x
          </button>
        </div>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ legend */

/**
 * The notation is only obvious if you already know it. Shows just the marks the
 * current frame actually uses, so it stays out of the way on a phone.
 */
const Legend: React.FC<{ items: DraggableItem[]; hasTrails: boolean }> = ({
  items,
  hasTrails,
}) => {
  const has = (type: string) => items.some((i) => i.type === type);
  const entries: { key: string; mark: React.ReactNode; label: string }[] = [];

  if (has("offense"))
    entries.push({
      key: "o",
      mark: <span className="h-2.5 w-2.5 rounded-full bg-red-500" />,
      label: "Offence",
    });
  if (has("defense"))
    entries.push({
      key: "d",
      mark: <span className="h-2.5 w-2.5 rounded-[2px] bg-blue-600" />,
      label: "Defence",
    });
  if (has("cone"))
    entries.push({
      key: "c",
      mark: (
        <span className="h-0 w-0 border-x-[5px] border-b-[9px] border-x-transparent border-b-amber-500" />
      ),
      label: "Cone",
    });
  if (hasTrails) {
    entries.push({
      key: "throw",
      mark: <span className="h-0.5 w-4 rounded bg-white" />,
      label: "Throw",
    });
    entries.push({
      key: "run",
      mark: (
        <span className="h-0.5 w-4 rounded bg-[repeating-linear-gradient(90deg,white_0_4px,transparent_4px_7px)]" />
      ),
      label: "Run",
    });
  }

  // One row is not a key, it is clutter.
  if (entries.length < 2) return null;

  return (
    <ul className="pointer-events-none absolute bottom-3 left-3 flex max-w-[60%] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg bg-black/45 px-2 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-1.5">
          {entry.mark}
          {entry.label}
        </li>
      ))}
    </ul>
  );
};

export default ViewerScreen;
