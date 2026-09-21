import { describe, expect, it } from "vitest";
import type { DiceLog } from "@/types/DiceLog";
import { grepCharactername, grepDicelog, grepTabnames } from "./grep-utils";

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
      "[メイン] アリス 1d100<=50 → 23 成功",
      "```",
    ]);
  });

  it("成功度リストが空の場合は対象キャラクターの全行を抽出する", () => {
    const result = grepDicelog(sampleLogs, "アリス", []);
    expect(result).toEqual([
      "**アリス**",
      "```",
      "[メイン] アリス 1d100<=50 → 23 成功",
      "[メイン] アリス 1d100<=50 → 88 失敗",
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
      "[メイン] アリス 成功したように見えて失敗していた",
      "```",
    ]);
  });

  it("選んだ成功度のどれにも当てはまらない行は除外する", () => {
    const result = grepDicelog(sampleLogs, "アリス", ["ファンブル"]);

    expect(result).toEqual(["**アリス**", "```", "```"]);
  });

  it("tab が空の行は角括弧なしで出力する", () => {
    const logs: DiceLog[] = [
      { tab: "", name: "アリス", content: "1d100<=50 → 23 成功" },
    ];

    expect(grepDicelog(logs, "アリス", [])).toEqual([
      "**アリス**",
      "```",
      "アリス 1d100<=50 → 23 成功",
      "```",
    ]);
  });

  it("該当するキャラクターがいない場合は見出しと囲みのみ返す", () => {
    const result = grepDicelog(sampleLogs, "存在しない", ["成功"]);
    expect(result).toEqual(["**存在しない**", "```", "```"]);
  });

  it("ログの並び順を保つ", () => {
    const result = grepDicelog(sampleLogs, "アリス", ["成功", "失敗"]);

    expect(result.slice(2, -1)).toEqual([
      "[メイン] アリス 1d100<=50 → 23 成功",
      "[メイン] アリス 1d100<=50 → 88 失敗",
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

describe("grepDicelog のタブ絞り込み", () => {
  const logs: DiceLog[] = [
    { tab: "main", name: "アリス", content: "1d100<=50 → 23 成功" },
    { tab: "other", name: "アリス", content: "1d100<=50 → 5 成功" },
    { tab: "", name: "アリス", content: "タブなし 成功" },
  ];

  it("タブ未指定(空文字)なら全タブの行を返す", () => {
    expect(grepDicelog(logs, "アリス", [])).toEqual([
      "**アリス**",
      "```",
      "[main] アリス 1d100<=50 → 23 成功",
      "[other] アリス 1d100<=50 → 5 成功",
      "アリス タブなし 成功",
      "```",
    ]);
  });

  it("タブを指定するとそのタブの行だけを返し、タブが空の行は含めない", () => {
    expect(grepDicelog(logs, "アリス", [], "other")).toEqual([
      "**アリス**",
      "```",
      "[other] アリス 1d100<=50 → 5 成功",
      "```",
    ]);
  });

  it("該当するタブがなければ見出しと囲みのみ返す", () => {
    expect(grepDicelog(logs, "アリス", [], "info")).toEqual([
      "**アリス**",
      "```",
      "```",
    ]);
  });
});

describe("grepTabnames", () => {
  it("タブ名を重複なくソートして返し、空文字は除く", () => {
    const logs: DiceLog[] = [
      { tab: "other", name: "アリス", content: "" },
      { tab: "main", name: "ボブ", content: "" },
      { tab: "", name: "", content: "" },
      { tab: "main", name: "アリス", content: "" },
    ];

    expect(grepTabnames(logs)).toEqual(["main", "other"]);
  });

  it("ログが空なら空配列を返す", () => {
    expect(grepTabnames([])).toEqual([]);
  });
});
