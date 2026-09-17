import React, { useState } from "react";
import { usePlaybook } from "../data/playbookStore";
import { Icon } from "./Icon";
import { Button } from "./Button";

/** One-time nickname capture so teammates can see who changed what. */
export const AuthorPrompt: React.FC = () => {
  const { author, setAuthor } = usePlaybook();
  const [draft, setDraft] = useState("");

  if (author) return null;

  const submit = () => {
    const name = draft.trim();
    if (name) setAuthor(name);
  };

  return (
    <div className="mb-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-200">
        <Icon name="user" size={16} />
        What's your name?
      </div>
      <p className="mb-3 text-[13px] text-sky-100/70">
        So your teammates know who wrote and edited each play. Stored on this
        device only.
      </p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. Sam"
          maxLength={20}
          className="h-11 flex-1 rounded-xl border border-sky-500/30 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-400 focus:outline-none"
        />
        <Button variant="primary" onClick={submit} disabled={!draft.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default AuthorPrompt;
