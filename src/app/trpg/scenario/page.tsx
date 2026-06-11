import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import { ArrowRight, BookOpenText, Clock3, UsersRound } from "lucide-react";

const formatRange = (min: number, max: number) =>
  min === max ? `${min}` : `${min}～${max}`;

export default function Home() {
  const scenarioEntries = Object.entries(scenarios);

  const displayScenarios = () =>
    scenarioEntries.map(([key, scenario]) => (
      <a
        key={key}
        href={`/trpg/scenario/${key}`}
        className="group flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm transition hover:border-blue-400/80 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-slate-700/80 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-800/60"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 dark:border-slate-600/80 dark:text-slate-300">
              <BookOpenText className="size-3.5" aria-hidden="true" />
              {scenario.system}
            </p>
            <h2 className="text-2xl font-bold leading-tight text-zinc-950 dark:text-white">
              {scenario.title}
            </h2>
          </div>
          <ArrowRight
            className="mt-1 size-5 shrink-0 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-300"
            aria-hidden="true"
          />
        </div>
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound className="size-4" aria-hidden="true" />
            {scenario.players.min}～{scenario.players.max}人
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" aria-hidden="true" />
            {formatRange(
              scenario.playTimeHours.min,
              scenario.playTimeHours.max,
            )}
            時間程度
          </span>
        </div>
        <p className="mt-auto text-sm leading-7 text-zinc-700 dark:text-slate-200">
          {scenario.summary}
        </p>
      </a>
    ));

  return (
    <Template>
      <div className="mx-auto w-full max-w-[66rem]">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">
            Scenario
          </h1>
          <p className="text-sm text-zinc-600 dark:text-slate-300">
            {scenarioEntries.length}件のシナリオを公開しています。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{displayScenarios()}</div>
      </div>
    </Template>
  );
}
