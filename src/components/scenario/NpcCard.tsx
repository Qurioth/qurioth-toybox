import type { ReactNode } from "react";
import type { ScenarioNpc } from "@/types/scenario-npc";
import CopyKomaButton from "./CopyKomaButton";
import StatGrid from "./StatGrid";
import ZoomableImage from "./ZoomableImage";

const toHeadingId = (npc: ScenarioNpc) =>
  [npc.name, npc.kana && `(${npc.kana})`]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, "-");

/**
 * NPC・神話生物のカード(specs/005-scenario/contracts/mdx-page.md 3 章)。
 * 名前・立ち絵・プロフィール・能力値・技能はデータから、セリフ例などの自由な記述は子要素から出す
 */
const NpcCard = ({
  npc,
  children,
}: {
  npc: ScenarioNpc;
  children?: ReactNode;
}) => (
  <article
    aria-label={npc.name}
    className="not-prose my-6 flex flex-col gap-3 rounded-lg border border-[--scenario-border] bg-[--scenario-surface] p-4 shadow-sm dark:border-[--scenario-border-dark] dark:bg-[--scenario-surface-dark]"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {npc.portrait && (
        <div className="shrink-0 self-center sm:max-w-[40%] sm:self-start">
          <ZoomableImage
            src={npc.portrait.src}
            alt={npc.portrait.alt ?? npc.name}
            className="max-h-80 w-auto max-w-full rounded-md object-contain"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-2">
        <h3
          id={toHeadingId(npc)}
          data-toc
          data-toc-label={npc.name}
          className="scroll-mt-24 text-xl font-bold text-zinc-950 dark:text-white"
        >
          {npc.name}
          {npc.kana && (
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-slate-400">
              ({npc.kana})
            </span>
          )}
        </h3>
        <CopyKomaButton npc={npc} />
        {npc.profile && (
          <p className="whitespace-pre-line leading-7 text-zinc-800 dark:text-slate-100">
            {npc.profile}
          </p>
        )}
      </div>
    </div>
    {npc.stats?.map((stats, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: stat blocks are static
      <StatGrid key={index} stats={stats} />
    ))}
    {npc.skills && npc.skills.length > 0 && (
      <section className="border-t border-zinc-200 pt-3 dark:border-slate-700">
        <h4 className="mb-1 font-bold text-zinc-900 dark:text-white">技能</h4>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-800 dark:text-slate-100">
          {npc.skills.map((skill) => (
            <li key={`${skill.name}-${skill.value}`}>
              {skill.name}: {skill.value}%
              {skill.note && (
                <span className="ml-1 text-zinc-500 dark:text-slate-400">
                  {skill.note}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    )}
    {children && (
      <div className="prose dark:prose-dark max-w-none border-t border-zinc-200 pt-3 dark:border-slate-700">
        {children}
      </div>
    )}
  </article>
);

export default NpcCard;
