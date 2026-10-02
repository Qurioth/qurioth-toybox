import { BookOpenText, Clock3, UsersRound } from "lucide-react";
import type { Scenario } from "@/data/scenario/scenario-list";
import { formatRange } from "@/utils/scenario-filter";
import ScenarioMarkdown from "./ScenarioMarkdown";

/** 詳細画面の冒頭。対応システム・人数・プレイ時間・概要リードをまとめて示す */
const ScenarioOverview = ({
  scenario,
  title,
  subtitle,
  lead,
}: {
  scenario: Scenario;
  title: string;
  subtitle?: string;
  lead: string;
}) => (
  <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/40">
    <div>
      {subtitle && (
        <p className="text-sm italic text-zinc-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
      <h1 className="text-3xl font-bold leading-tight text-zinc-950 dark:text-white">
        {title}
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
          {formatRange(scenario.playTimeHours.min, scenario.playTimeHours.max)}
          時間程度
        </dd>
      </div>
    </dl>
    <ScenarioMarkdown markdown={lead} />
  </header>
);

export default ScenarioOverview;
