/**
 * シナリオ本文 Markdown を記述規約(src/data/scenario/README.md)の見出しに沿って区画に分け、
 * 専用ページの下書き生成(scenario-draft-utils.ts)と表記の強調に使う構造を組み立てる。
 * 下書き生成スクリプトから Node で直接実行されるため、相対 import は `.ts` 付きで書き、
 * `@/` のエイリアスは使わない(specs/005-scenario/research.md R10)。
 */

import type { StatEntry } from "../types/scenario-npc.ts";

export type Heading = {
  /** 見出し行の原文(改行文字を含む)。網羅性の再構成に使う */
  source: string;
  depth: number;
  /** 見出しの文字列から末尾の補足 ` (…)` を除いたもの */
  text: string;
  /** 末尾の半角括弧の中身(読み仮名・姿の名前など) */
  kana?: string;
  /** ページ内リンク用。文書内で一意 */
  id: string;
};

export type Subsection = {
  heading: Heading;
  /** `#####` 以下を含む本文 */
  body: string;
};

export type SectionKind = "character" | "ending" | "reward" | "tome" | "topic";

export type Section = {
  kind: SectionKind;
  heading: Heading;
  body: string;
  subsections: Subsection[];
};

export type ChapterKind =
  | "gm-info"
  | "handout"
  | "recommended-skills"
  | "npcs"
  | "introduction"
  | "climax"
  | "ending"
  | "scene";

export type Chapter = {
  kind: ChapterKind;
  heading: Heading;
  body: string;
  sections: Section[];
};

export type ScenarioDocument = {
  /** H1 より前の原文 */
  preamble: string;
  subtitle?: string;
  title?: Heading;
  /** H1 から最初の `##` までの本文 */
  lead: string;
  chapters: Chapter[];
};

const CHAPTER_KINDS: Record<string, ChapterKind> = {
  "GM 向け情報": "gm-info",
  "特殊 HO": "handout",
  推奨技能: "recommended-skills",
  "主な NPC": "npcs",
  シナリオの導入: "introduction",
  クライマックス: "climax",
  シナリオ終了: "ending",
};

/** 規約 2 章の固定セクションの並び(場面は含まない) */
export const FIXED_CHAPTER_ORDER: ChapterKind[] = [
  "gm-info",
  "handout",
  "recommended-skills",
  "npcs",
  "introduction",
  "climax",
  "ending",
];

const CHARACTER_SUBSECTION_PREFIXES = ["ステータス", "技能", "セリフ例"];

const HEADING_PATTERN = /^(#{1,6})[ \t]+(.+?)[ \t]*$/;
const FENCE_PATTERN = /^\s*(`{3,}|~{3,})/;
const TRAILING_NOTE_PATTERN = /^(.*\S)\s+\(([^()]*)\)$/;

const splitLines = (markdown: string) =>
  markdown.match(/[^\n]*\n|[^\n]+$/g) ?? [];

const toId = (raw: string, used: Map<string, number>) => {
  const base = raw.replace(/\s+/g, "-");
  const count = (used.get(base) ?? 0) + 1;
  used.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
};

const toHeading = (
  source: string,
  depth: number,
  raw: string,
  used: Map<string, number>,
): Heading => {
  const note = raw.match(TRAILING_NOTE_PATTERN);
  return {
    source,
    depth,
    text: note ? note[1] : raw,
    kana: note ? note[2] : undefined,
    id: toId(raw, used),
  };
};

const toChapterKind = (heading: Heading): ChapterKind =>
  CHAPTER_KINDS[heading.text] ?? "scene";

const toSectionKind = (
  chapterKind: ChapterKind,
  heading: Heading,
  subsections: Subsection[],
): SectionKind => {
  if (
    chapterKind === "npcs" ||
    subsections.some((subsection) =>
      CHARACTER_SUBSECTION_PREFIXES.some((prefix) =>
        subsection.heading.text.startsWith(prefix),
      ),
    )
  ) {
    return "character";
  }
  if (/^ED\s*\d+/.test(heading.text)) return "ending";
  if (heading.text.startsWith("その他報酬")) return "reward";
  if (/^『[^』]*』$/.test(heading.text)) return "tome";
  return "topic";
};

/**
 * 本文を見出しで区画に分ける。フェンス付きコードブロック内の `#` 行は見出しにしない。
 * `#####` 以下と、親のない深い見出しは区切らずに本文として残す。
 */
export const splitScenarioMarkdown = (markdown: string): ScenarioDocument => {
  const used = new Map<string, number>();
  const doc: ScenarioDocument = { preamble: "", lead: "", chapters: [] };
  let fence: string | undefined;
  let chapter: Chapter | undefined;
  let section: Section | undefined;
  let subsection: Subsection | undefined;

  const append = (line: string) => {
    if (subsection) subsection.body += line;
    else if (section) section.body += line;
    else if (chapter) chapter.body += line;
    else if (doc.title) doc.lead += line;
    else doc.preamble += line;
  };

  const closeSection = () => {
    if (chapter && section) {
      section.kind = toSectionKind(
        chapter.kind,
        section.heading,
        section.subsections,
      );
    }
    section = undefined;
    subsection = undefined;
  };

  for (const line of splitLines(markdown)) {
    const fenceMatch = line.match(FENCE_PATTERN);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = marker;
      else if (marker.startsWith(fence)) fence = undefined;
      append(line);
      continue;
    }

    const headingMatch = fence
      ? null
      : line.replace(/\r?\n$/, "").match(HEADING_PATTERN);
    const depth = headingMatch?.[1].length ?? 0;
    const raw = headingMatch?.[2] ?? "";

    if (depth === 1 && !doc.title && !chapter) {
      doc.title = toHeading(line, depth, raw, used);
    } else if (depth === 2) {
      closeSection();
      const heading = toHeading(line, depth, raw, used);
      chapter = {
        kind: toChapterKind(heading),
        heading,
        body: "",
        sections: [],
      };
      doc.chapters.push(chapter);
    } else if (depth === 3 && chapter) {
      closeSection();
      section = {
        kind: "topic",
        heading: toHeading(line, depth, raw, used),
        body: "",
        subsections: [],
      };
      chapter.sections.push(section);
    } else if (depth === 4 && section) {
      subsection = { heading: toHeading(line, depth, raw, used), body: "" };
      section.subsections.push(subsection);
    } else {
      append(line);
    }
  }
  closeSection();

  const subtitle = doc.preamble.trim().match(/^_(.+)_$/);
  if (subtitle) doc.subtitle = subtitle[1];

  return doc;
};

/** 分割結果を元の Markdown に戻す。網羅性(行の欠落がないこと)の確認に使う */
export const restoreScenarioMarkdown = (doc: ScenarioDocument) =>
  [
    doc.preamble,
    doc.title?.source ?? "",
    doc.lead,
    ...doc.chapters.flatMap((chapter) => [
      chapter.heading.source,
      chapter.body,
      ...chapter.sections.flatMap((section) => [
        section.heading.source,
        section.body,
        ...section.subsections.flatMap((subsection) => [
          subsection.heading.source,
          subsection.body,
        ]),
      ]),
    ]),
  ].join("");

export type { StatEntry };

export type StatBlock = {
  abilities: StatEntry[];
  derived: StatEntry[];
  rest: string[];
};

const ABILITY_LINE_PATTERN = /^(?:STR|CON|POW|DEX|APP|SIZ|INT|EDU)\s*:/;
const ABILITY_ENTRY_PATTERN = /(STR|CON|POW|DEX|APP|SIZ|INT|EDU)\s*:\s*/g;
const DERIVED_LINE_PATTERN = /^[^\s:：]+\s*:/;
const DERIVED_ENTRY_PATTERN = /(?:^|\s)([^\s:：]+)\s*:\s*/g;

const toEntries = (line: string, pattern: RegExp): StatEntry[] => {
  const matches = [...line.matchAll(pattern)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? line.length;
    return { label: match[1], value: line.slice(start, end).trim() };
  });
};

/** 能力値を持たない存在(神格の化身、機械など)は、副次ステータスの `耐久力` から書き始める */
const DERIVED_ONLY_LINE_PATTERN = /^耐久力\s*:/;

/**
 * 能力値の段落を読む。1 行目が能力値の項目名(または能力値を持たない存在の `耐久力`)と
 * `:` で始まらなければ undefined。
 * 値は文字列のまま保持する(`15（初期値: 55）` や `105 - 10` もそのまま)
 */
export const parseStatLines = (text: string): StatBlock | undefined => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const [first] = lines;
  if (!first) return undefined;

  const hasAbilities = ABILITY_LINE_PATTERN.test(first);
  if (!hasAbilities && !DERIVED_ONLY_LINE_PATTERN.test(first)) return undefined;

  const others = hasAbilities ? lines.slice(1) : lines;
  const block: StatBlock = {
    abilities: hasAbilities ? toEntries(first, ABILITY_ENTRY_PATTERN) : [],
    derived: [],
    rest: [],
  };
  for (const line of others) {
    if (DERIVED_LINE_PATTERN.test(line)) {
      block.derived.push(...toEntries(line, DERIVED_ENTRY_PATTERN));
    } else {
      block.rest.push(line);
    }
  }
  return block;
};

export type Character = {
  portrait?: { alt: string; src: string };
  /** 立ち絵の行を除いた本文 */
  profile: string;
  subsections: Subsection[];
};

const PORTRAIT_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)[ \t]*(?:\r?\n|$)/;

/** 人物カードの表示用に、本文先頭の立ち絵を分ける */
export const toCharacter = (section: Section): Character => {
  const body = section.body.replace(/^(?:[ \t]*\r?\n)+/, "");
  const portrait = body.match(PORTRAIT_PATTERN);
  return {
    portrait: portrait ? { alt: portrait[1], src: portrait[2] } : undefined,
    profile: portrait ? body.slice(portrait[0].length) : section.body,
    subsections: section.subsections,
  };
};

export type StrongNotation =
  | { kind: "check" }
  | { kind: "sanity-loss"; success?: string; failure?: string; fixed?: string }
  | { kind: "plain" };

/** 太字の中身を規約の書式に照らして分類する(research.md R3) */
export const classifyStrong = (text: string): StrongNotation => {
  const trimmed = text.trim();
  if (/^〈[^〉]+〉/.test(trimmed)) return { kind: "check" };

  const sanity = trimmed.match(/^正気度喪失(?:[：:]\s*(.+))?$/);
  if (sanity) {
    if (!sanity[1]) return { kind: "sanity-loss" };
    const [success, failure, ...extra] = sanity[1].split(/\s*／\s*/);
    return failure !== undefined && extra.length === 0
      ? { kind: "sanity-loss", success, failure }
      : { kind: "sanity-loss", fixed: sanity[1] };
  }
  return { kind: "plain" };
};

export type NotationSegment = {
  kind: "text" | "spell" | "tome" | "sanity-recovery";
  text: string;
};

const INLINE_NOTATION_PATTERN =
  /《[^》]+》|『[^』]+』|正気度回復\s*[:：]\s*[^\s。、,，]+/g;

/** 地の文の中の呪文・魔導書/アーティファクト・正気度回復を区切る */
export const splitNotation = (text: string): NotationSegment[] => {
  const segments: NotationSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_NOTATION_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ kind: "text", text: text.slice(last, index) });
    }
    const kind = match[0].startsWith("《")
      ? "spell"
      : match[0].startsWith("『")
        ? "tome"
        : "sanity-recovery";
    segments.push({ kind, text: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ kind: "text", text: text.slice(last) });
  }
  return segments;
};

/** 判定の太字の直後に置かれる難易度(` のハード` / ` のイクストリーム`)を取り出す */
export const splitDifficulty = (
  text: string,
): { difficulty: string; rest: string } | undefined => {
  const match = text.match(/^\s*の(?:ハード|イクストリーム)/);
  return match
    ? { difficulty: match[0], rest: text.slice(match[0].length) }
    : undefined;
};

/** `ED1 【名称】` を番号と名称に分ける */
export const toEnding = (
  section: Section,
): { number: string; name: string } => {
  const match = section.heading.text.match(
    /^ED\s*(\d+)\s*(?:【(.+)】)?\s*(.*)$/,
  );
  if (!match) return { number: "", name: section.heading.text };
  return { number: match[1], name: match[2] ?? match[3] ?? "" };
};

/** `『名前』` から名前を取り出す */
export const toTomeName = (section: Section) =>
  section.heading.text.replace(/^『(.*)』$/, "$1");
