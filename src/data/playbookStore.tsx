/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Play } from "./types";
import {
  listPlays,
  savePlay as repoSave,
  deletePlay as repoDelete,
  seedPlaybook,
  getAuthor,
  setAuthor as persistAuthor,
  type RepoResult,
  type Source,
} from "./playRepo";

interface PlaybookValue {
  plays: Play[];
  loading: boolean;
  source: Source;
  warning?: string;
  needsSetup: boolean;
  author: string;
  setAuthor: (name: string) => void;
  refresh: () => Promise<void>;
  save: (play: Play) => Promise<Play>;
  remove: (id: string) => Promise<void>;
  seed: () => Promise<void>;
}

const PlaybookContext = createContext<PlaybookValue | null>(null);

export const usePlaybook = (): PlaybookValue => {
  const ctx = useContext(PlaybookContext);
  if (!ctx) throw new Error("usePlaybook must be used inside <PlaybookProvider>");
  return ctx;
};

export const PlaybookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<Source>("cloud");
  const [warning, setWarning] = useState<string | undefined>();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [author, setAuthorState] = useState(getAuthor());

  const applyResult = useCallback((res: RepoResult) => {
    setPlays(res.plays);
    setSource(res.source);
    setWarning(res.warning);
    setNeedsSetup(Boolean(res.needsSetup));
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    applyResult(await listPlays());
  }, [applyResult]);

  // Initial load. `loading` already starts true, so nothing is set until the
  // request resolves.
  useEffect(() => {
    let cancelled = false;
    void listPlays().then((res) => {
      if (!cancelled) applyResult(res);
    });
    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  const setAuthor = useCallback((name: string) => {
    persistAuthor(name);
    setAuthorState(name);
  }, []);

  const save = useCallback(async (play: Play) => {
    const res = await repoSave(play);
    const saved = res.plays[0];
    setSource(res.source);
    setWarning(res.warning);
    setNeedsSetup(Boolean(res.needsSetup));
    setPlays((prev) => {
      const next = prev.filter((p) => p.id !== saved.id);
      return [saved, ...next];
    });
    return saved;
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await repoDelete(id);
    setSource(res.source);
    setWarning(res.warning);
    setPlays((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const seed = useCallback(async () => {
    setLoading(true);
    applyResult(await seedPlaybook(author));
  }, [author, applyResult]);

  const value = useMemo<PlaybookValue>(
    () => ({
      plays,
      loading,
      source,
      warning,
      needsSetup,
      author,
      setAuthor,
      refresh,
      save,
      remove,
      seed,
    }),
    [plays, loading, source, warning, needsSetup, author, setAuthor, refresh, save, remove, seed]
  );

  return (
    <PlaybookContext.Provider value={value}>{children}</PlaybookContext.Provider>
  );
};
