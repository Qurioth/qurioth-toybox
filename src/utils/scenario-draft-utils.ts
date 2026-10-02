/**
 * 既存のシナリオ本文 Markdown から、専用ページ(src/scenarios/<slug>/)の下書きを作る。
 * 変換の規則は specs/005-scenario/data-model.md「下書きへの変換」。
 * scripts/create-scenario-draft.ts から Node で直接実行されるため、相対 import は `.ts` 付きで書き、
 * 型は `import type` にする。`@/` のエイリアスは使わない(research.md R10)。
 */

import type {
  NpcSkill,
  NpcStatBlock,
  ScenarioNpc,
} from "../types/scenario-npc.ts";
import {
  type Heading,
  parseStatLines,
  type Section,
  splitScenarioMarkdown,
  type Subsection,
  toCharacter,
  toEnding,
  toTomeName,
} from "./scenario-structure-utils.ts";

export type ScenarioDraft = {
  indexTsx: string;
  contentMdx: string;
  npcsTs: string;
};

const FENCE_PATTERN = /^\s*(`{3,}|~{3,})/;
const COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;

/** 本文を空行で区切ったまとまりに分ける。コードブロックの中は分けない */
export const toBlocks = (markdown: string): string[] => {
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | undefined;

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const fenceMatch = line.match(FENCE_PATTERN);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1];
      else if (fenceMatch[1].startsWith(fence)) fence = undefined;
      current.push(line);
    } else if (!fence && line.trim() === "") {
      if (current.length > 0) blocks.push(current.join("\n"));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks;
};

/** インラインコードの外にある `{` `}` `<` をエスケープする */
const escapeLine = (line: string) =>
  line
    .split(/(`[^`]*`)/)
    .map((part, index) =>
      index % 2 === 1 ? part : part.replace(/[{}<]/g, "\\$&"),
    )
    .join("");

/** MDX で JSX として扱われる文字をエスケープし、HTML コメントを MDX のコメントにする */
export const escapeMdx = (block: string) => {
  if (FENCE_PATTERN.test(block)) return block;
  return block
    .split(COMMENT_PATTERN)
    .map((part, index) =>
      index % 2 === 1
        ? `{/*${part}*/}`
        : part.split("\n").map(escapeLine).join("\n"),
    )
    .join("");
};

const json = (value: unknown) => JSON.stringify(value);

const toStatBlock = (
  stats: NonNullable<ReturnType<typeof parseStatLines>>,
  label?: string,
): NpcStatBlock => ({
  ...(label ? { label } : {}),
  abilities: stats.abilities,
  derived: stats.derived,
});

/** まとまり 1 つを MDX にする。能力値の段落は <StatGrid> にする */
const convertBlock = (block: string) => {
  const stats = FENCE_PATTERN.test(block) ? undefined : parseStatLines(block);
  if (!stats) return escapeMdx(block);

  const statsProp = `stats={${json(toStatBlock(stats))}}`;
  if (stats.rest.length === 0) return `<StatGrid ${statsProp} />`;
  return [
    `<StatGrid ${statsProp}>`,
    escapeMdx(stats.rest.join("  \n")),
    "</StatGrid>",
  ].join("\n\n");
};

const convertMarkdown = (markdown: string) =>
  toBlocks(markdown).map(convertBlock).join("\n\n");

/** 見出し行(`#` を含む)を、文字列をエスケープして書き出す */
const headingLine = (heading: Heading) =>
  `${"#".repeat(heading.depth)} ${escapeMdx(rawHeadingText(heading))}`;

const rawHeadingText = (heading: Heading) =>
  heading.source.replace(/^#+[ \t]+/, "").trimEnd();

const joinParts = (parts: string[]) =>
  parts.filter((part) => part.trim() !== "").join("\n\n");

const convertSubsections = (subsections: Subsection[]) =>
  subsections.map((subsection) =>
    joinParts([
      headingLine(subsection.heading),
      convertMarkdown(subsection.body),
    ]),
  );

const SKILL_PATTERN = /([^\s:：]+)\s*:\s*(\d+)%/g;

/**
 * 技能の小節を NpcSkill の並びにする。各行が技能から始まり、並べ直すと元の文字列に戻る
 * 場合だけ成功する(戻らなければ undefined で、小節は MDX のまま残す)
 */
export const parseSkills = (body: string): NpcSkill[] | undefined => {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length === 0) return undefined;

  const skills: NpcSkill[] = [];
  for (const line of lines) {
    const matches = [...line.matchAll(SKILL_PATTERN)];
    if (matches.length === 0 || matches[0].index !== 0) return undefined;
    const lineSkills = matches.map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[index + 1]?.index ?? line.length;
      const note = line.slice(start, end).trim();
      return {
        name: match[1],
        value: Number(match[2]),
        ...(note ? { note } : {}),
      };
    });
    const rebuilt = lineSkills
      .map(
        (skill) =>
          `${skill.name}: ${skill.value}%${skill.note ? ` ${skill.note}` : ""}`,
      )
      .join(" ");
    const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
    if (normalize(rebuilt) !== normalize(line)) return undefined;
    skills.push(...lineSkills);
  }
  return skills;
};

/** 装飾のない地の文だけのプロフィールか(データにしても書式を失わない) */
const isPlainText = (text: string) =>
  !/(\*\*|`|!\[|\[|^\s*([-*>|#]|\d+\.)\s)/m.test(text);

const toPlainText = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

const NPC_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

const toNpcKey = (section: Section, used: Set<string>) => {
  const portrait = toCharacter(section).portrait?.src;
  const fileName =
    portrait
      ?.split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? "";
  const base = fileName.replace(/[-_](\w)/g, (_, char: string) =>
    char.toUpperCase(),
  );
  let key = NPC_KEY_PATTERN.test(base) && !used.has(base) ? base : "";
  for (let index = used.size + 1; !key; index += 1) {
    if (!used.has(`npc${index}`)) key = `npc${index}`;
  }
  used.add(key);
  return key;
};

/** 人物の節を NPC データと <NpcCard> にする */
const convertCharacter = (
  section: Section,
  key: string,
): { npc: ScenarioNpc; mdx: string } => {
  const character = toCharacter(section);
  const npc: ScenarioNpc = { name: section.heading.text };
  if (section.heading.kana) npc.kana = section.heading.kana;
  if (character.portrait) {
    npc.portrait = {
      src: character.portrait.src,
      ...(character.portrait.alt && character.portrait.alt !== npc.name
        ? { alt: character.portrait.alt }
        : {}),
    };
  }

  const children: string[] = [];
  const profile = character.profile.trim();
  if (profile) {
    if (isPlainText(profile)) npc.profile = toPlainText(profile);
    else children.push(convertMarkdown(profile));
  }

  const stats: NpcStatBlock[] = [];
  for (const subsection of character.subsections) {
    if (subsection.heading.text.startsWith("ステータス")) {
      const leftovers: string[] = [];
      for (const block of toBlocks(subsection.body)) {
        const parsed = FENCE_PATTERN.test(block)
          ? undefined
          : parseStatLines(block);
        if (parsed && parsed.rest.length === 0) {
          stats.push(toStatBlock(parsed, subsection.heading.kana));
        } else {
          leftovers.push(block);
        }
      }
      if (leftovers.length > 0) {
        children.push(
          joinParts([
            headingLine(subsection.heading),
            ...leftovers.map(convertBlock),
          ]),
        );
      }
      continue;
    }
    if (subsection.heading.text.startsWith("技能")) {
      const skills = parseSkills(subsection.body);
      if (skills) {
        npc.skills = skills;
        continue;
      }
    }
    children.push(...convertSubsections([subsection]));
  }
  if (stats.length > 0) npc.stats = stats;

  const open = `<NpcCard npc={npcs.${key}}`;
  const mdx =
    children.length === 0
      ? `${open} />`
      : joinParts([`${open}>`, ...children, "</NpcCard>"]);
  return { npc, mdx };
};

const wrap = (open: string, close: string, parts: string[]) =>
  joinParts([open, ...parts, close]);

/** 人物以外の節を MDX にする */
const convertSection = (section: Section) => {
  const inner = [
    convertMarkdown(section.body),
    ...convertSubsections(section.subsections),
  ];
  switch (section.kind) {
    case "ending": {
      const { number, name } = toEnding(section);
      return wrap(
        `<Ending number=${json(number)} name={${json(name)}}>`,
        "</Ending>",
        inner,
      );
    }
    case "reward":
      return wrap(
        `<Reward title={${json(rawHeadingText(section.heading))}}>`,
        "</Reward>",
        inner,
      );
    case "tome": {
      const kana = section.heading.kana
        ? ` kana={${json(section.heading.kana)}}`
        : "";
      return wrap(
        `<Tome name={${json(toTomeName(section))}}${kana}>`,
        "</Tome>",
        inner,
      );
    }
    default:
      return joinParts([headingLine(section.heading), ...inner]);
  }
};

const toComponentName = (id: string) =>
  `${id.replace(/[^A-Za-z0-9]/g, "")}Scenario`;

/** 既存の本文から専用ページの下書き(index.tsx / content.mdx / npcs.ts)を作る */
export const createScenarioDraft = ({
  id,
  title,
  markdown,
}: {
  id: string;
  title: string;
  markdown: string;
}): ScenarioDraft => {
  const doc = splitScenarioMarkdown(markdown);
  const usedKeys = new Set<string>();
  const npcs: Record<string, ScenarioNpc> = {};
  const parts: string[] = ['import { npcs } from "./npcs";'];

  const preamble = doc.subtitle
    ? doc.preamble.replace(/^\s*_.+_\s*$/m, "")
    : doc.preamble;
  parts.push(convertMarkdown(preamble));
  if (doc.title && doc.title.text !== title) {
    parts.push(`{/* 元のタイトル: ${rawHeadingText(doc.title)} */}`);
  }
  const subtitle = doc.subtitle ? ` subtitle={${json(doc.subtitle)}}` : "";
  parts.push(
    doc.lead.trim() === ""
      ? `<ScenarioOverview${subtitle} />`
      : wrap(`<ScenarioOverview${subtitle}>`, "</ScenarioOverview>", [
          convertMarkdown(doc.lead),
        ]),
  );

  for (const chapter of doc.chapters) {
    parts.push(headingLine(chapter.heading), convertMarkdown(chapter.body));
    for (const section of chapter.sections) {
      if (section.kind === "character") {
        const key = toNpcKey(section, usedKeys);
        const { npc, mdx } = convertCharacter(section, key);
        npcs[key] = npc;
        parts.push(mdx);
      } else {
        parts.push(convertSection(section));
      }
    }
  }

  const contentMdx = `${joinParts(parts)}\n`;
  const npcsTs = [
    'import type { ScenarioNpc } from "@/types/scenario-npc";',
    "",
    `/** ${title} の NPC・神話生物。NPC カードと CCFOLIA のコマはこのデータから作る */`,
    `export const npcs = ${JSON.stringify(npcs, null, 2)} satisfies Record<string, ScenarioNpc>;`,
    "",
  ].join("\n");
  const indexTsx = [
    'import ScenarioPage from "@/components/scenario/ScenarioPage";',
    'import type { ScenarioInfo } from "@/data/scenario/scenario-list";',
    'import Content from "./content.mdx";',
    "",
    "/**",
    ` * 「${title}」の専用ページ。`,
    ' * 配色は ScenarioPage の theme(例: { accent: "#0e7490", dark: { accent: "#67e8f9" } })で、',
    " * レイアウトや演出はこのファイルと content.mdx で自由に決める(src/scenarios/README.md)",
    " */",
    `export default function ${toComponentName(id)}({`,
    "  scenario,",
    "}: {",
    "  scenario: ScenarioInfo;",
    "}) {",
    "  return (",
    '    <ScenarioPage scenario={scenario} toc="sidebar">',
    "      <Content />",
    "    </ScenarioPage>",
    "  );",
    "}",
    "",
  ].join("\n");

  return { indexTsx, contentMdx, npcsTs };
};
