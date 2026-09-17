import React, { useMemo, useState } from "react";
import { usePlaybook } from "../data/playbookStore";
import { CATEGORY_LABELS, type Play, type PlayCategory } from "../data/types";
import { navigate } from "../lib/useHashRoute";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { PlayThumb } from "../components/PlayThumb";
import { AuthorPrompt } from "../components/AuthorPrompt";
import { SetupBanner } from "../components/SetupBanner";

type Filter = "all" | PlayCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "play", label: "战术" },
  { key: "formation", label: "站位" },
  { key: "drill", label: "训练" },
];

const CATEGORY_STYLES: Record<PlayCategory, string> = {
  play: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  formation: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  drill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (Number.isNaN(mins)) return "";
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
};

const PlayCard: React.FC<{ play: Play }> = ({ play }) => (
  <button
    onClick={() => navigate(`#/p/${play.id}`)}
    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition-colors hover:border-slate-600 active:border-sky-500"
  >
    <div className="relative h-28 w-full sm:h-32">
      <PlayThumb frames={play.frames} className="h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900 to-transparent" />
      <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
        {play.frames.length} 帧
      </span>
    </div>

    <div className="flex flex-1 flex-col gap-2 p-3.5">
      <div className="flex items-start gap-2">
        <h3 className="flex-1 text-base font-bold leading-tight text-slate-50">
          {play.name}
        </h3>
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[play.category]}`}
        >
          {CATEGORY_LABELS[play.category]}
        </span>
      </div>

      {play.description && (
        <p className="line-clamp-2 text-[13px] leading-snug text-slate-400">
          {play.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-slate-500">
        {play.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">
            {tag}
          </span>
        ))}
        <span className="ml-auto truncate">
          {play.author ? `${play.author} · ` : ""}
          {timeAgo(play.updated_at)}
        </span>
      </div>
    </div>
  </button>
);

export const LibraryScreen: React.FC = () => {
  const { plays, loading, source, warning, needsSetup, author, refresh, seed } =
    usePlaybook();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plays.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [plays, filter, query]);

  return (
    <div className="min-h-dvh bg-slate-950 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex-1">
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              战术库
            </h1>
            <p className="text-xs text-slate-500">
              {loading ? "加载中…" : `${plays.length} 套战术`}
            </p>
          </div>

          <button
            onClick={() => void refresh()}
            title="刷新"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-400 active:bg-slate-800"
          >
            <Icon name="refresh" size={18} />
          </button>

          <span
            className={`flex h-10 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold ${
              source === "cloud"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            <Icon name={source === "cloud" ? "cloud" : "cloudOff"} size={15} />
            <span className="hidden sm:inline">
              {source === "cloud" ? "云端同步" : "本机"}
            </span>
          </span>

          <Button
            variant="primary"
            aria-label="新建战术"
            onClick={() => navigate("#/new")}
          >
            <Icon name="plus" size={18} />
            <span className="hidden sm:inline">新建</span>
          </Button>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 pb-3">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索战术名 / 标签 / 说明"
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500"
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-8 shrink-0 rounded-lg px-3 text-[13px] font-semibold transition-colors ${
                  filter === f.key
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <AuthorPrompt />
        {(needsSetup || (source === "local" && warning)) && (
          <SetupBanner needsSetup={needsSetup} warning={warning} />
        )}

        {loading && plays.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-300">
              {plays.length === 0 ? "战术库还是空的" : "没有匹配的战术"}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              {plays.length === 0
                ? "先导入几套内置站位和战术打底，再在上面改成你们队自己的。"
                : "换个关键词或切换分类试试。"}
            </p>
            {plays.length === 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => void seed()}>
                  导入内置战术
                </Button>
                <Button onClick={() => navigate("#/new")}>
                  <Icon name="plus" size={18} />
                  从零新建
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((play) => (
              <PlayCard key={play.id} play={play} />
            ))}
          </div>
        )}
      </main>

      {author && (
        <p className="pb-6 text-center text-xs text-slate-600">
          当前身份：{author} · 保存战术时会署名
        </p>
      )}
    </div>
  );
};

export default LibraryScreen;
