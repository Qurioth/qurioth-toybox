import { describe, expect, it } from "vitest";
import {
  type ScenarioListItem,
  filterScenarios,
  formatRange,
  getSystems,
  normalizeNumberInput,
  toNumberOrUndefined,
} from "./scenario-filter";

const scenarios: ScenarioListItem[] = [
  {
    id: "yomi",
    title: "黄泉比良坂",
    titleKana: "よもつひらさか",
    system: "クトゥルフ神話TRPG 7版",
    players: { min: 3, max: 4 },
    playTimeHours: { min: 4, max: 6 },
    summary: "",
  },
  {
    id: "marebito",
    title: "まれびとの島",
    titleKana: "まれびとのしま",
    system: "クトゥルフ神話TRPG 6版",
    players: { min: 2, max: 2 },
    playTimeHours: { min: 3, max: 3 },
    summary: "",
  },
  {
    id: "yuyake",
    title: "夏の日",
    titleKana: "なつのひ",
    system: "クトゥルフ神話TRPG 7版",
    players: { min: 1, max: 5 },
    playTimeHours: { min: 2, max: 8 },
    summary: "",
  },
];

const idsOf = (items: ScenarioListItem[]) => items.map((item) => item.id);
const noFilter = { titleQuery: "", system: "" };

describe("formatRange", () => {
  it("上下限が違えば範囲表記にする", () => {
    expect(formatRange(3, 4)).toBe("3～4");
  });

  it("上下限が同じなら1つだけ返す", () => {
    expect(formatRange(3, 3)).toBe("3");
  });
});

describe("toNumberOrUndefined", () => {
  it("未入力は undefined、それ以外は数値", () => {
    expect(toNumberOrUndefined("")).toBeUndefined();
    expect(toNumberOrUndefined("4")).toBe(4);
  });
});

describe("normalizeNumberInput", () => {
  it.each([
    ["12", "12"],
    ["1a2", "12"],
    ["123", "12"],
    ["abc", ""],
    ["0", ""],
    ["", ""],
    ["-3", "3"],
  ])("%s は %s になる", (input, expected) => {
    expect(normalizeNumberInput(input)).toBe(expected);
  });

  it("先頭が0でも2桁として扱う(01は01のまま)", () => {
    expect(normalizeNumberInput("01")).toBe("01");
  });
});

describe("getSystems", () => {
  it("重複を除き、登場順を保つ", () => {
    expect(getSystems(scenarios)).toEqual([
      "クトゥルフ神話TRPG 7版",
      "クトゥルフ神話TRPG 6版",
    ]);
  });
});

describe("filterScenarios", () => {
  it("条件なしなら全件", () => {
    expect(idsOf(filterScenarios(scenarios, noFilter))).toEqual([
      "yomi",
      "marebito",
      "yuyake",
    ]);
  });

  it("タイトルとふりがなの両方を検索対象にする", () => {
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, titleQuery: "黄泉" })),
    ).toEqual(["yomi"]);
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, titleQuery: "よもつ" })),
    ).toEqual(["yomi"]);
  });

  it("空白区切りはAND条件", () => {
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, titleQuery: "の 島" })),
    ).toEqual(["marebito"]);
  });

  it("システムは完全一致", () => {
    expect(
      idsOf(
        filterScenarios(scenarios, {
          ...noFilter,
          system: "クトゥルフ神話TRPG 7版",
        }),
      ),
    ).toEqual(["yomi", "yuyake"]);
  });

  it("人数は範囲に含まれるかで判定する", () => {
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, playerCount: 4 })),
    ).toEqual(["yomi", "yuyake"]);
    // 下限・上限そのものも含む
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, playerCount: 1 })),
    ).toEqual(["yuyake"]);
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, playerCount: 9 })),
    ).toEqual([]);
  });

  it("時間は範囲に含まれるかで判定する", () => {
    expect(
      idsOf(filterScenarios(scenarios, { ...noFilter, playTimeHours: 3 })),
    ).toEqual(["marebito", "yuyake"]);
  });

  it("条件はすべてAND", () => {
    expect(
      idsOf(
        filterScenarios(scenarios, {
          titleQuery: "の",
          system: "クトゥルフ神話TRPG 7版",
          playerCount: 2,
        }),
      ),
    ).toEqual(["yuyake"]);
  });

  it("undefined の条件は絞り込まない", () => {
    expect(
      idsOf(
        filterScenarios(scenarios, {
          ...noFilter,
          playerCount: undefined,
          playTimeHours: undefined,
        }),
      ),
    ).toHaveLength(3);
  });
});
