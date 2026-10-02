import { type Section, toEnding } from "@/utils/scenario-structure-utils";
import ScenarioHeading from "./ScenarioHeading";
import ScenarioMarkdown from "./ScenarioMarkdown";

const Subsections = ({ section }: { section: Section }) =>
  section.subsections.map((subsection) => (
    <div key={subsection.heading.id} className="flex flex-col gap-1">
      <ScenarioHeading heading={subsection.heading} className="text-base" />
      <ScenarioMarkdown markdown={subsection.body} />
    </div>
  ));

/** エンディング(ED<番号> と名称を分けた見出し)とその他報酬(FR-025) */
const ScenarioEnding = ({ section }: { section: Section }) => {
  if (section.kind === "reward") {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-400 p-4 dark:border-slate-500">
        <ScenarioHeading heading={section.heading} />
        <ScenarioMarkdown markdown={section.body} />
        <Subsections section={section} />
      </section>
    );
  }

  const ending = toEnding(section);
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <h3
        id={section.heading.id}
        className="flex scroll-mt-24 flex-wrap items-baseline gap-2"
      >
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm font-bold text-white dark:bg-slate-200 dark:text-slate-900">
          ED{ending.number}
        </span>
        <span className="text-xl font-bold text-zinc-950 dark:text-white">
          {ending.name}
        </span>
      </h3>
      <ScenarioMarkdown markdown={section.body} />
      <Subsections section={section} />
    </section>
  );
};

export default ScenarioEnding;
