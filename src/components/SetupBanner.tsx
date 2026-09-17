import React, { useState } from "react";
import { Icon } from "./Icon";

const SQL = `create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  category text not null default 'play',
  description text not null default '',
  tags text[] not null default '{}',
  frames jsonb not null default '[]'::jsonb,
  frame_notes jsonb not null default '[]'::jsonb,
  author text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plays enable row level security;

create policy "team read"   on public.plays for select using (true);
create policy "team insert" on public.plays for insert with check (true);
create policy "team update" on public.plays for update using (true) with check (true);
create policy "team delete" on public.plays for delete using (true);`;

interface SetupBannerProps {
  needsSetup: boolean;
  warning?: string;
}

/** Shown when the cloud table is missing or unreachable, so nothing looks broken. */
export const SetupBanner: React.FC<SetupBannerProps> = ({ needsSetup, warning }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setOpen(true);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-2.5">
        <Icon name="cloudOff" size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-200">
            {needsSetup ? "云端还没建表 —— 当前改动只存在这台设备" : "离线模式"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-100/70">
            {needsSetup
              ? "去 Supabase 控制台 → SQL Editor，粘贴下面这段 SQL 运行一次，队友之间就能实时共享战术了。"
              : `${warning ?? "暂时连不上云端"} —— 战术照常可看可改，联网后刷新即可同步。`}
          </p>

          {needsSetup && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={copy}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-[13px] font-bold text-amber-950 active:bg-amber-300"
              >
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "已复制" : "复制建表 SQL"}
              </button>
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 text-[13px] font-semibold text-amber-200"
              >
                <Icon name={open ? "chevronUp" : "chevronDown"} size={15} />
                {open ? "收起" : "查看 SQL"}
              </button>
            </div>
          )}

          {open && (
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-300">
              {SQL}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupBanner;
