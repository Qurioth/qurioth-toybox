import type { MDXComponents } from "mdx/types";
import Figure, { MarkdownImage } from "@/components/scenario/Figure";
import Flowchart from "@/components/scenario/Flowchart";
import NpcCard from "@/components/scenario/NpcCard";
import {
  Dialogue,
  DocumentText,
  NotationCell,
  NotationListItem,
  NotationParagraph,
  NotationStrong,
} from "@/components/scenario/Notation";
import {
  Ending,
  ReadAloud,
  Reward,
  Tome,
} from "@/components/scenario/ScenarioBlocks";
import {
  ScenarioH2,
  ScenarioH3,
  ScenarioH4,
} from "@/components/scenario/ScenarioHeadings";
import ScenarioOverview from "@/components/scenario/ScenarioOverview";
import ScenarioToc from "@/components/scenario/ScenarioToc";
import StatGrid from "@/components/scenario/StatGrid";

/**
 * MDX(シナリオの専用ページ)の要素の見た目と、import せずに使える部品
 * (specs/005-scenario/contracts/mdx-page.md 3 章)
 */
const components: MDXComponents = {
  h2: ScenarioH2,
  h3: ScenarioH3,
  h4: ScenarioH4,
  strong: NotationStrong,
  p: NotationParagraph,
  li: NotationListItem,
  td: NotationCell,
  blockquote: Dialogue,
  pre: DocumentText,
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  img: MarkdownImage,
  ScenarioOverview,
  ScenarioToc,
  NpcCard,
  Figure,
  Flowchart,
  StatGrid,
  ReadAloud,
  Ending,
  Reward,
  Tome,
};

/** @next/mdx の規約で必須 */
export function useMDXComponents(): MDXComponents {
  return components;
}
