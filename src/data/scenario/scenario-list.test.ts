import { describe, expect, it } from "vitest";
import {
  restoreScenarioMarkdown,
  splitScenarioMarkdown,
} from "@/utils/scenario-structure-utils";
import scenarios from "./scenario-list";

const entries = Object.entries(scenarios);
const markdownEntries = entries.flatMap(([id, scenario]) =>
  scenario.markdown === undefined ? [] : [[id, scenario.markdown] as const],
);

describe("登録済みの全シナリオ", () => {
  it.each(entries)(
    "%s は本文(markdown)と専用ページ(page)のちょうど一方を持つ",
    (_, scenario) => {
      expect(
        [scenario.markdown, scenario.page].filter(
          (value) => value !== undefined,
        ),
      ).toHaveLength(1);
    },
  );

  it.each(markdownEntries)(
    "%s の本文を区画に分けても行が欠落しない",
    (_, markdown) => {
      expect(restoreScenarioMarkdown(splitScenarioMarkdown(markdown))).toBe(
        markdown,
      );
    },
  );
});
