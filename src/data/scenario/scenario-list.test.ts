import { describe, expect, it } from "vitest";
import {
  type ChapterKind,
  FIXED_CHAPTER_ORDER,
  parseStatLines,
  restoreScenarioMarkdown,
  splitScenarioMarkdown,
} from "@/utils/scenario-structure-utils";
import scenarios from "./scenario-list";

const entries = Object.entries(scenarios);
const structuredEntries = entries.filter(([, scenario]) => scenario.structured);

const REQUIRED_CHAPTERS: ChapterKind[] = [
  "gm-info",
  "npcs",
  "introduction",
  "ending",
];
const ABILITY_ORDER = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];

/** フェンス付きコードブロック(作中テキスト)を除いた行 */
const linesOutsideFences = (markdown: string) => {
  let inFence = false;
  return markdown.split("\n").filter((line) => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      return false;
    }
    return !inFence;
  });
};

/** `ステータス` で始まる見出し(#### / #####)の直後の段落 */
const statParagraphs = (markdown: string) => {
  const lines = linesOutsideFences(markdown);
  return lines.flatMap((line, index) => {
    if (!/^#{4,6}\s+ステータス/.test(line)) return [];
    const start = lines.findIndex(
      (candidate, candidateIndex) =>
        candidateIndex > index && candidate.trim() !== "",
    );
    const end = lines.findIndex(
      (candidate, candidateIndex) =>
        candidateIndex > start && candidate.trim() === "",
    );
    return [
      {
        heading: line,
        paragraph: lines.slice(start, end === -1 ? undefined : end).join("\n"),
      },
    ];
  });
};

describe("登録済みの全シナリオ", () => {
  it.each(entries)("%s の本文を区画に分けても行が欠落しない", (_, scenario) => {
    expect(
      restoreScenarioMarkdown(splitScenarioMarkdown(scenario.markdown)),
    ).toBe(scenario.markdown);
  });
});

describe.runIf(structuredEntries.length > 0)(
  "構造化表示へ移行済みのシナリオ(contracts/structured-markdown.md)",
  () => {
    it.each(structuredEntries)(
      "%s はクトゥルフ神話TRPG のシナリオである",
      (_, scenario) => {
        expect(scenario.system).toContain("クトゥルフ神話TRPG");
      },
    );

    it.each(structuredEntries)(
      "%s は必須の章を持ち、固定の章が規約の順に並ぶ",
      (_, scenario) => {
        const kinds = splitScenarioMarkdown(scenario.markdown)
          .chapters.map((chapter) => chapter.kind)
          .filter((kind) => kind !== "scene");

        expect(kinds).toEqual(expect.arrayContaining(REQUIRED_CHAPTERS));
        expect(kinds).toEqual(
          [...kinds].sort(
            (a, b) =>
              FIXED_CHAPTER_ORDER.indexOf(a) - FIXED_CHAPTER_ORDER.indexOf(b),
          ),
        );
      },
    );

    it.each(structuredEntries)(
      "%s のステータスは能力値として読み取れ、規約の順に並ぶ",
      (_, scenario) => {
        const problems = statParagraphs(scenario.markdown).flatMap(
          ({ heading, paragraph }) => {
            const stats = parseStatLines(paragraph);
            if (!stats) return [`${heading}: 能力値として読めない`];
            const order = stats.abilities.map((entry) =>
              ABILITY_ORDER.indexOf(entry.label),
            );
            return order.every(
              (value, index) => index === 0 || order[index - 1] < value,
            )
              ? []
              : [
                  `${heading}: 能力値の順序が規約と違う (${paragraph.split("\n")[0]})`,
                ];
          },
        );
        expect(problems).toEqual([]);
      },
    );

    it.each(structuredEntries)(
      "%s には太字の外に「正気度喪失：」がない",
      (_, scenario) => {
        const unbolded = linesOutsideFences(scenario.markdown).filter((line) =>
          line.replace(/\*\*[^*]+\*\*/g, "").includes("正気度喪失："),
        );
        expect(unbolded).toEqual([]);
      },
    );
  },
);
