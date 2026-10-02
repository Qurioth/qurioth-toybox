import type { Scenario } from "@/data/scenario/scenario-list";
import {
  buildScenarioToc,
  type Section,
  splitScenarioMarkdown,
} from "@/utils/scenario-structure-utils";
import ScenarioCharacter from "./ScenarioCharacter";
import ScenarioEnding from "./ScenarioEnding";
import ScenarioHeading from "./ScenarioHeading";
import ScenarioMarkdown from "./ScenarioMarkdown";
import ScenarioOverview from "./ScenarioOverview";
import ScenarioToc from "./ScenarioToc";
import ScenarioTome from "./ScenarioTome";

const ScenarioSection = ({ section }: { section: Section }) => {
  switch (section.kind) {
    case "character":
      return <ScenarioCharacter section={section} />;
    case "ending":
    case "reward":
      return <ScenarioEnding section={section} />;
    case "tome":
      return <ScenarioTome section={section} />;
    default:
      return <ScenarioTopic section={section} />;
  }
};

/** 調査対象などの汎用の区画 */
const ScenarioTopic = ({ section }: { section: Section }) => (
  <section className="flex flex-col gap-3">
    <ScenarioHeading heading={section.heading} />
    <ScenarioMarkdown markdown={section.body} />
    {section.subsections.map((subsection) => (
      <div key={subsection.heading.id} className="flex flex-col gap-2">
        <ScenarioHeading heading={subsection.heading} />
        <ScenarioMarkdown markdown={subsection.body} />
      </div>
    ))}
  </section>
);

/** 構造化表示へ移行済みのシナリオの詳細(specs/005-scenario/contracts/detail-view.md) */
const StructuredScenario = ({ scenario }: { scenario: Scenario }) => {
  const doc = splitScenarioMarkdown(scenario.markdown);

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="flex min-w-0 flex-col gap-10">
        <ScenarioOverview
          scenario={scenario}
          title={doc.title?.text ?? scenario.title}
          subtitle={doc.subtitle}
          lead={doc.lead}
        />
        {doc.chapters.map((chapter) => (
          <section key={chapter.heading.id} className="flex flex-col gap-6">
            <ScenarioHeading heading={chapter.heading} />
            <ScenarioMarkdown markdown={chapter.body} />
            {chapter.sections.map((section) => (
              <ScenarioSection key={section.heading.id} section={section} />
            ))}
          </section>
        ))}
      </div>
      <aside>
        <ScenarioToc items={buildScenarioToc(doc)} />
      </aside>
    </div>
  );
};

export default StructuredScenario;
