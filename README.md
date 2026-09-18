# Ultimate Playbook 🥏

Your team's ultimate frisbee playbook. Watch plays animate on your phone,
edit them anywhere, everyone stays in sync.

Live: https://ulti-drill.vercel.app/

## What it does

- **Playbook** — plays, formations and drills in one library, searchable by name,
  tag or description. Every card carries a thumbnail so you can spot a play at a glance.
- **Watch a play** (phone-first) — in portrait the field rotates so the attack runs
  up the screen and fills it, then zooms to the slice of field the play actually uses.
  Step through frames or hit play; dashed arrows show who moved where.
- **Edit a play** — drag players on phone or laptop. Bend a run into a curve by
  dragging the dot on its arrow, so a fake-in-go-deep cut is one frame rather than
  four. Drop cones and on-field notes. Add and delete frames, change how many
  players are on the field (applies across every frame), write a description and
  tags. Undo and redo with Ctrl/Cmd-Z.
- **Cloud sync** — everyone opening the same URL sees the same playbook. If the cloud is
  unreachable it falls back to local storage, so the sideline still works without signal,
  and syncs again on refresh.
- **Reads in the sun** — a flat, high-contrast diagram theme alongside the grass one,
  and attackers, defenders and cones are told apart by shape as well as colour, so
  the diagram still works in greyscale and for red–green colour blindness.

## First-time setup: create the table

Cloud storage is Supabase. Run [`docs-supabase-setup.sql`](./docs-supabase-setup.sql)
once in your Supabase dashboard → **SQL Editor**. The app also shows a banner with a
one-click copy of that SQL.

Before the table exists the app doesn't break — it says so and falls back to local storage.

> The RLS policies are wide open: anyone with the URL can read and write the playbook.
> Fine for a squad, but don't post the link publicly.

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + bundle
pnpm lint
pnpm test       # vitest — model, geometry and framing maths
```

The Supabase URL and anon key are baked into `src/lib/supabase.ts` as defaults (the anon
key is a public browser-side credential; RLS is the real boundary). To point at a
different Supabase project, copy `.env.example` to `.env` and override them.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · Konva (canvas) · Supabase REST (plain fetch, no SDK)

## Layout

```text
src/
├── data/            # Play model, cloud/local repository, global store
├── lib/             # Supabase REST client, hash router, screen orientation
├── features/
│   ├── field/       # Field canvas: scaling, rotation, players, trails, playback
│   └── playbook/    # Field standards, coordinate maths, formation/roster helpers
├── screens/         # Library / Viewer / Editor
└── components/      # Shared UI
```

## Coordinate system

The field standard is WFDF by default: **100 m × 37 m**, 18 m end zones, brick mark 18 m
from the goal line. Every `x` / `y` in a play is in **metres**, with the origin at the
outer corner of the left end zone — independent of screen pixels, so a play renders
proportionally at any size.

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

Item `type` is `offense`, `defense`, `disc`, `cone` or `text` — those are the stored
data values and stay as-is; the UI labels the first two Offence and Defence. An item
may also carry `cx` / `cy`, the control point of the curve it follows into that frame.

See [`GEMINI.md`](./GEMINI.md) for the architecture, the notation and the invariants
worth knowing before changing the field code.
