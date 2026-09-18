# Ultimate Playbook

A shared ultimate frisbee playbook, built phone-first for the sideline. Plays are
short animations: a handful of key frames, and the app interpolates between them.

Live: https://ulti-drill.vercel.app/

## What it is, and what it is not

The product bet is **the sideline**, not the drawing board: a captain pulling out a
phone between points and getting seven people on the same page in thirty seconds.
Everything below follows from that — portrait rotation, zoom-to-play, offline
fallback, big touch targets.

It is deliberately *not* a general multi-sport play designer.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind v4 (via `@tailwindcss/vite`, no
`tailwind.config.js`) · Konva 10 / react-konva (canvas) · Supabase REST called
with plain `fetch` (no SDK) · Vitest.

## Layout

```text
src/
├── app/App.tsx           # Hash routes + Suspense boundary
├── data/                 # Play model, cloud/local repository, global store
├── lib/                  # Supabase REST client, hash router, orientation, field theme
├── features/
│   ├── field/            # Field canvas: scaling, rotation, tokens, trails, playback
│   └── playbook/         # Field standards, item model, formation/roster helpers
├── screens/              # Library / Viewer / Editor
└── components/           # Shared UI
```

`LibraryScreen` is in the entry bundle; `ViewerScreen` and `EditorScreen` are
lazy — Konva is most of the weight and the library never needs it.

## Coordinate system

The field standard is WFDF: **100 m × 37 m**, 18 m end zones, brick mark 18 m from
the goal line. Every `x` / `y` is in **metres**, origin at the outer corner of the
left end zone, so a play renders proportionally at any size. `FieldStage` converts
to pixels once, via a `scale` it derives from the container.

Vertical orientation rotates the whole group −90°, mapping field `(x, y)` to
screen `(y, −x)`, which puts the attacking end zone at the top. Labels are
counter-rotated so numbers stay upright.

## The item model

```ts
type ItemType = "offense" | "defense" | "disc" | "cone" | "text";

interface DraggableItem {
  id: string;        // stable across frames — this is what playback interpolates
  x: number;         // metres
  y: number;
  type: ItemType;
  label?: string;    // jersey number, or the drawn note for `text`
  cx?: number;       // quadratic Bézier control point for the path INTO this
  cy?: number;       // position from the previous frame
}
```

Two invariants matter:

- **Ids are stable across frames.** `usePlayback` matches items between frames by
  id; a renamed id makes a player teleport. Roster items are `offense-1..n`,
  `defense-1..n`, `disc`.
- **Cones and notes are not roster.** `applyTeamSize` rebuilds the numbered
  players from a template, and must carry everything else through untouched.

A play looks like this:

```jsonc
{
  "name": "Facial",
  "category": "play",
  "description": "Pull play…",
  "tags": ["pull play", "huck"],
  "frames": [
    [ { "id": "disc", "type": "disc", "x": 31.9, "y": 19.1, "label": "" },
      { "id": "offense-1", "type": "offense", "x": 30, "y": 18.5, "label": "1" } ]
  ],
  "frame_notes": ["1 has the disc, 2 sets up behind as the dump"]
}
```

`type` values are the stored data; the UI says Offence and Defence.

## Notation

Deliberately the standard sports-diagram vocabulary, and encoded by **shape** as
well as colour so it survives red–green colour blindness and greyscale printing:

| Mark | Meaning |
| --- | --- |
| Red circle | Attacker |
| Blue rounded square | Defender |
| Amber triangle | Cone |
| Small white circle | Disc |
| Solid arrow | The throw |
| Dashed arrow | A run |

`Legend` in `ViewerScreen` shows only the marks the current frame uses, and stays
hidden when there is fewer than two things to explain.

## Curved paths

A straight line cannot express the most common cut in the sport — fake in, go
deep. An item's optional `cx`/`cy` is the control point of a quadratic Bézier for
its path *into* that frame.

The control point is off-curve, but the handle people drag sits *on* the curve at
`t = 0.5`. `handleToControl` / `controlToHandle` in `features/playbook/types.ts`
convert between them; both `TrailsLayer` (drawing) and `usePlayback` (animating)
go through `pointOnPath`.

## Field themes

`grass` and `diagram`, in `features/field/theme.ts`, chosen per device and
remembered in localStorage by `useFieldTheme`. Diagram is flat and high-contrast:
no mown stripes, dark lines on near-white. It is the one to use in direct sunlight
or when a play is going to be printed.

Every stage takes a `themeName` prop rather than reading context, because Konva
renders through its own reconciler.

## Storage

Supabase REST, table `plays`, columns matching the `Play` interface. Run
[`docs-supabase-setup.sql`](./docs-supabase-setup.sql) once in the Supabase
dashboard → SQL Editor; the app shows a banner with one-click copy of it.

When the cloud is unreachable, `playRepo` falls back to localStorage and the UI
says so rather than looking broken. The last successful cloud read is cached, so
a first offline run still has the team's plays.

> RLS is wide open: anyone with the URL can read and write. Fine for a squad,
> not for a public link. Saves are a whole-row upsert with no optimistic lock, so
> two people editing the same play at once will silently clobber each other —
> the largest known correctness gap.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + bundle
pnpm lint
pnpm test       # vitest, pure model/geometry functions
```

## Conventions

See `dev_principles.md`. In practice, for this repo:

- Logic lives in `features/*/utils` as pure functions, and is tested there.
  Screens stay declarative.
- Field maths is in metres everywhere; pixels appear only inside `FieldStage`.
- Comments explain *why*, not what. Dead code gets deleted, not commented out.
