import { BookMarked } from "lucide-react";
import { type Section, toTomeName } from "@/utils/scenario-structure-utils";
import ScenarioHeading from "./ScenarioHeading";
import ScenarioMarkdown from "./ScenarioMarkdown";

/**
 * 魔導書・アーティファクトのカード。属性の箇条書きは書式(出典・判定)を保つため
 * 本文のまま描画する(FR-024)
 */
const ScenarioTome = ({ section }: { section: Section }) => (
  <article
    aria-label={toTomeName(section)}
    className="flex flex-col gap-3 rounded-lg border-2 border-amber-700/40 bg-amber-50/60 p-4 dark:border-amber-400/40 dark:bg-amber-950/20"
  >
    <div className="flex items-center gap-2">
      <BookMarked
        className="size-5 shrink-0 text-amber-800 dark:text-amber-300"
        aria-hidden="true"
      />
      <ScenarioHeading heading={section.heading} />
    </div>
    <ScenarioMarkdown markdown={section.body} />
    {section.subsections.map((subsection) => (
      <div key={subsection.heading.id} className="flex flex-col gap-1">
        <ScenarioHeading heading={subsection.heading} className="text-base" />
        <ScenarioMarkdown markdown={subsection.body} />
      </div>
    ))}
  </article>
);

export default ScenarioTome;
