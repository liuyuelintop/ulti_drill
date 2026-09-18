import { sb, SupabaseError, isCloudConfigured } from "../lib/supabase";
import { normalizePlay, type Play } from "./types";
import { seedPlays } from "./seed";

const TABLE = "plays";
const CACHE_KEY = "ulti.playbook.cache";
const LOCAL_KEY = "ulti.playbook.local";
const AUTHOR_KEY = "ulti.author";

const SELECT_COLS =
  "id,name,category,description,tags,frames,frame_notes,author,created_at,updated_at";

export type Source = "cloud" | "local";

export interface RepoResult {
  plays: Play[];
  source: Source;
  /** Present when we fell back to local storage. */
  warning?: string;
  /** True when the Supabase table has not been created yet. */
  needsSetup?: boolean;
}

/* ------------------------------------------------------------------ local */

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — non-fatal */
  }
};

export const getAuthor = (): string => {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? "";
  } catch {
    return "";
  }
};

export const setAuthor = (name: string) => {
  try {
    localStorage.setItem(AUTHOR_KEY, name);
  } catch {
    /* ignore */
  }
};

const localPlays = (): Play[] => {
  const stored = readJson<Play[] | null>(LOCAL_KEY, null);
  if (stored) return stored.map(normalizePlay);
  // First offline run: fall back to the last cloud snapshot, else the presets.
  const cached = readJson<Play[] | null>(CACHE_KEY, null);
  const initial = cached?.length ? cached.map(normalizePlay) : seedPlays(getAuthor());
  writeJson(LOCAL_KEY, initial);
  return initial;
};

const writeLocal = (plays: Play[]) => writeJson(LOCAL_KEY, plays);

/* ------------------------------------------------------------------ state */

let source: Source = isCloudConfigured ? "cloud" : "local";

const describe = (err: unknown) =>
  err instanceof SupabaseError ? err.message : "Cloud unavailable";

/* ------------------------------------------------------------------- read */

export async function listPlays(): Promise<RepoResult> {
  if (!isCloudConfigured) {
    source = "local";
    return { plays: localPlays(), source: "local", warning: "Cloud not configured" };
  }

  try {
    const rows = await sb.select<Play[]>(
      TABLE,
      `select=${SELECT_COLS}&order=updated_at.desc`
    );
    const plays = (rows ?? []).map(normalizePlay);
    source = "cloud";
    writeJson(CACHE_KEY, plays);
    return { plays, source: "cloud" };
  } catch (err) {
    source = "local";
    const needsSetup = err instanceof SupabaseError && err.missingTable;
    return {
      plays: localPlays(),
      source: "local",
      warning: describe(err),
      needsSetup,
    };
  }
}

/* ------------------------------------------------------------------ write */

const upsertLocal = (play: Play) => {
  const plays = localPlays();
  const idx = plays.findIndex((p) => p.id === play.id);
  if (idx >= 0) plays[idx] = play;
  else plays.unshift(play);
  writeLocal(plays);
};

/**
 * Save a play. Returns where it landed so the UI can tell the user whether
 * teammates will see it.
 */
export async function savePlay(play: Play): Promise<RepoResult> {
  const row: Play = { ...play, updated_at: new Date().toISOString() };

  if (isCloudConfigured) {
    try {
      const saved = await sb.upsert<Play[]>(TABLE, row);
      const result = normalizePlay(saved?.[0] ?? row);
      source = "cloud";
      upsertLocal(result); // keep an offline copy for the sideline
      return { plays: [result], source: "cloud" };
    } catch (err) {
      source = "local";
      upsertLocal(row);
      return {
        plays: [row],
        source: "local",
        warning: describe(err),
        needsSetup: err instanceof SupabaseError && err.missingTable,
      };
    }
  }

  upsertLocal(row);
  return { plays: [row], source: "local", warning: "Cloud not configured" };
}

export async function deletePlay(id: string): Promise<RepoResult> {
  if (isCloudConfigured) {
    try {
      await sb.remove(TABLE, `id=eq.${encodeURIComponent(id)}`);
      source = "cloud";
    } catch (err) {
      source = "local";
      const plays = localPlays().filter((p) => p.id !== id);
      writeLocal(plays);
      return { plays, source: "local", warning: describe(err) };
    }
  }
  const plays = localPlays().filter((p) => p.id !== id);
  writeLocal(plays);
  return { plays, source };
}

/** Push the built-in presets into whichever store is active. */
export async function seedPlaybook(author: string): Promise<RepoResult> {
  const plays = seedPlays(author);
  if (isCloudConfigured) {
    try {
      const saved = await sb.insert<Play[]>(TABLE, plays);
      source = "cloud";
      const result = (saved ?? plays).map(normalizePlay);
      writeJson(CACHE_KEY, result);
      return { plays: result, source: "cloud" };
    } catch (err) {
      source = "local";
      writeLocal(plays);
      return {
        plays,
        source: "local",
        warning: describe(err),
        needsSetup: err instanceof SupabaseError && err.missingTable,
      };
    }
  }
  writeLocal(plays);
  return { plays, source: "local" };
}
