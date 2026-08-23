import { describe, expect, it } from "vitest";
import type { DiceLog } from "@/types/DiceLog";
import { grepCharactername, grepDicelog } from "./grep-utils";

// content の HTMLエスケープは convertDicelog が戻すため、ここでは復元済みの文字列を渡す
const sampleLogs: DiceLog[] = [
  { tab: "メイン", name: "アリス", content: "1d100<=50 → 23 成功" },
  { tab: "メイン", name: "アリス", content: "1d100<=50 → 88 失敗" },
  { tab: "メイン", name: "ボブ", content: "1d100<=50 → 10 成功" },
];

describe("grepDicelog", () => {
  it("成功度でフィルタして対象キャラクターの行だけ抽出する", () => {
    const result = grepDicelog(sampleLogs, "アリス", ["成功"]);
    expect(result).toEqual([
      "**アリス**",
      "```",
      "メイン アリス 1d100<=50 → 23 成功",
      "```",
    ]);
  });

  it("成功度リストが空の場合は対象キャラクターの全行を抽出する", () => {
    const result = grepDicelog(sampleLogs, "アリス", []);
    expect(result).toEqual([
      "**アリス**",
      "```",
      "メイン アリス 1d100<=50 → 23 成功",
      "メイン アリス 1d100<=50 → 88 失敗",
      "```",
    ]);
  });

  it("複数の成功度を選んでも1行が重複しない", () => {
    const logs: DiceLog[] = [
      {
        tab: "メイン",
        name: "アリス",
        content: "成功したように見えて失敗していた",
      },
    ];

    const result = grepDicelog(logs, "アリス", ["成功", "失敗"]);

    expect(result).toEqual([
      "**アリス**",
      "```",
      "メイン アリス 成功したように見えて失敗していた",
      "```",
    ]);
  });

  it("選んだ成功度のどれにも当てはまらない行は除外する", () => {
    const result = grepDicelog(sampleLogs, "アリス", ["ファンブル"]);

    expect(result).toEqual(["**アリス**", "```", "```"]);
  });

  it("該当するキャラクターがいない場合は見出しと囲みのみ返す", () => {
    const result = grepDicelog(sampleLogs, "存在しない", ["成功"]);
    expect(result).toEqual(["**存在しない**", "```", "```"]);
  });

  it("ログの並び順を保つ", () => {
    const result = grepDicelog(sampleLogs, "アリス", ["成功", "失敗"]);

    expect(result.slice(2, -1)).toEqual([
      "メイン アリス 1d100<=50 → 23 成功",
      "メイン アリス 1d100<=50 → 88 失敗",
    ]);
  });
});

describe("grepCharactername", () => {
  it("重複を除いてソート済みのキャラクター名一覧を返す", () => {
    const result = grepCharactername(sampleLogs);
    expect(result).toEqual(["アリス", "ボブ"]);
  });

  it("名前が空のログは一覧に含めない", () => {
    const logs: DiceLog[] = [
      { tab: "メイン", name: "", content: "システムメッセージ" },
      { tab: "メイン", name: "アリス", content: "1d100<=50 → 1 成功" },
    ];

    expect(grepCharactername(logs)).toEqual(["アリス"]);
  });

  it("ログが空の場合は空配列を返す", () => {
    expect(grepCharactername([])).toEqual([]);
  });
});
