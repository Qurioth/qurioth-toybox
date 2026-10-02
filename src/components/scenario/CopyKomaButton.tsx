"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import type { ScenarioNpc } from "@/types/scenario-npc";
import { toCcfoliaKoma } from "@/utils/ccfolia-koma-utils";

const MESSAGES = {
  copied: "コピーしました。CCFOLIA の部屋に貼り付けてください",
  failed: "コピーできませんでした",
} as const;

/** NPC を CCFOLIA のコマとしてクリップボードにコピーする(contracts/ccfolia-koma.md) */
const CopyKomaButton = ({ npc }: { npc: ScenarioNpc }) => {
  const [result, setResult] = useState<keyof typeof MESSAGES>();

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(undefined), 3000);
    return () => clearTimeout(timer);
  }, [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(toCcfoliaKoma(npc)));
      setResult("copied");
    } catch {
      setResult("failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-md border border-[--scenario-border] px-3 py-1 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 dark:border-[--scenario-border-dark] dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Copy className="size-4" aria-hidden="true" />
        CCFOLIA にコピー
      </button>
      <span
        aria-live="polite"
        className="text-xs text-zinc-500 dark:text-slate-400"
      >
        {result && MESSAGES[result]}
      </span>
    </div>
  );
};

export default CopyKomaButton;
