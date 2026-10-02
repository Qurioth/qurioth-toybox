"use client";

import { BookOpenText, Clock3, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { formatRange } from "@/utils/scenario-filter";
import { useScenarioInfo } from "./ScenarioInfoContext";

/**
 * 専用ページの冒頭。登録情報(システム・人数・プレイ時間)とタイトルは詳細画面から受け取り、
 * リード(舞台・前提)は子要素で受け取る
 */
const ScenarioOverview = ({
  subtitle,
  children,
}: {
  subtitle?: string;
  children?: ReactNode;
}) => {
  const scenario = useScenarioInfo();
  if (!scenario) return null;

  return (
    <header className="not-prose my-6 flex flex-col gap-4 rounded-lg border border-[--scenario-border] bg-[--scenario-surface] p-5 shadow-sm dark:border-[--scenario-border-dark] dark:bg-[--scenario-surface-dark]">
      <div>
        {subtitle && (
          <p className="text-sm italic text-zinc-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
        <h1 className="text-3xl font-bold leading-tight text-zinc-950 dark:text-white">
          {scenario.title}
        </h1>
      </div>
      <dl className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-slate-300">
        <div className="inline-flex items-center gap-1.5">
          <dt>
            <BookOpenText className="size-4" aria-label="システム" />
          </dt>
          <dd>{scenario.system}</dd>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <dt>
            <UsersRound className="size-4" aria-label="人数" />
          </dt>
          <dd>{formatRange(scenario.players.min, scenario.players.max)}人</dd>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <dt>
            <Clock3 className="size-4" aria-label="プレイ時間" />
          </dt>
          <dd>
            {formatRange(
              scenario.playTimeHours.min,
              scenario.playTimeHours.max,
            )}
            時間程度
          </dd>
        </div>
      </dl>
      {children && (
        <div className="prose dark:prose-dark max-w-none">{children}</div>
      )}
    </header>
  );
};

export default ScenarioOverview;
