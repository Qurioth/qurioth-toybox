import { type Section, toCharacter } from "@/utils/scenario-structure-utils";
import ScenarioHeading from "./ScenarioHeading";
import ScenarioMarkdown from "./ScenarioMarkdown";

/** NPC・神話生物のカード。登場する章によらず同じ見せ方にする(FR-019) */
const ScenarioCharacter = ({ section }: { section: Section }) => {
  const character = toCharacter(section);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {character.portrait && (
          // biome-ignore lint/performance/noImgElement: markdown-provided image, size unknown at build time
          <img
            src={character.portrait.src}
            alt={character.portrait.alt}
            className="size-32 shrink-0 rounded-md object-cover sm:size-40"
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <ScenarioHeading heading={section.heading} />
          <ScenarioMarkdown markdown={character.profile} />
        </div>
      </div>
      {character.subsections.map((subsection) => (
        <section
          key={subsection.heading.id}
          className="flex flex-col gap-1 border-t border-zinc-200 pt-3 dark:border-slate-700"
        >
          <ScenarioHeading heading={subsection.heading} className="text-base" />
          <ScenarioMarkdown markdown={subsection.body} />
        </section>
      ))}
    </article>
  );
};

export default ScenarioCharacter;
