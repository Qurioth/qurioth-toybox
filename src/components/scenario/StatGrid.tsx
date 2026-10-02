import type { ReactNode } from "react";
import type { NpcStatBlock } from "@/types/scenario-npc";

/**
 * 能力値の格子。狭い画面で 4 列、md 以上で 8 列。
 * 項目の形に合わない記述(正気度喪失など)は子要素として格子の下に出す
 */
const StatGrid = ({
  stats,
  children,
}: {
  stats: NpcStatBlock;
  children?: ReactNode;
}) => (
  <div data-notation="stats" className="not-prose my-3 flex flex-col gap-2">
    {stats.label && (
      <p className="text-sm font-bold text-zinc-700 dark:text-slate-200">
        {stats.label}
      </p>
    )}
    {stats.abilities.length > 0 && (
      <dl className="grid grid-cols-4 gap-1 md:grid-cols-8">
        {stats.abilities.map((entry) => (
          <div
            key={entry.label}
            className="flex flex-col items-center rounded border border-zinc-300 bg-zinc-50 px-1 py-1 text-center dark:border-slate-600 dark:bg-slate-800/60"
          >
            <dt className="text-xs font-bold tracking-wide text-zinc-500 dark:text-slate-400">
              {entry.label}
            </dt>
            <dd className="break-all text-sm font-bold text-zinc-900 dark:text-slate-100">
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    )}
    {stats.derived.length > 0 && (
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {stats.derived.map((entry, index) => (
          <div
            // 同じ項目名が並ぶこともあるため位置で区別する
            // biome-ignore lint/suspicious/noArrayIndexKey: entries are static and never reordered
            key={`${entry.label}-${index}`}
            className="inline-flex gap-1"
          >
            <dt className="text-zinc-500 dark:text-slate-400">{entry.label}</dt>
            <dd className="font-bold text-zinc-900 dark:text-slate-100">
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    )}
    {children && (
      <div className="prose dark:prose-dark max-w-none text-sm">{children}</div>
    )}
  </div>
);

export default StatGrid;
