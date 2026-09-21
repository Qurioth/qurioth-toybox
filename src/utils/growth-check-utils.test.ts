import { describe, expect, it } from "vitest";
import type { DiceLog } from "@/types/DiceLog";
import {
  collectGrowthChecks,
  formatGrowthChecks,
  parseCheckRoll,
} from "./growth-check-utils";

/** CCFOLIA の CC コマンドの結果部分を組み立てる */
const result = (
  target: number,
  modifier: number,
  value: string,
  tail: string,
) =>
  `(1D100<=${target}) ボーナス・ペナルティダイス[${modifier}] ＞ ${value} ＞ ${tail}`;

describe("parseCheckRoll", () => {
  it("通常の判定行から技能名と成功を読み取る", () => {
    const content = `CC<=65 【目星】 ${result(65, 0, "13", "13 ＞ イクストリーム成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "【目星】",
      succeeded: true,
    });
  });

  it("コマンドと技能名の間が全角スペースでも読み取る", () => {
    const content = `CC<=60　【DEX】 ${result(60, 0, "52", "52 ＞ レギュラー成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "【DEX】",
      succeeded: true,
    });
  });

  it("難易度指定 h が技能値の直後にあっても読み取る", () => {
    const content = `CC<=80h 【知識】 ${result(40, 0, "35", "35 ＞ 成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "【知識】",
      succeeded: true,
    });
  });

  it("難易度指定 h が技能名の直前にあっても読み取る", () => {
    const content = `CC<=75 h【知識】 ${result(75, 0, "99", "99 ＞ 失敗")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "【知識】",
      succeeded: false,
    });
  });

  it("難易度指定 e(イクストリーム)も技能名から外す", () => {
    const content = `CC<=61e 操縦（ヘリコプター） ${result(12, 0, "3", "3 ＞ 成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "操縦（ヘリコプター）",
      succeeded: true,
    });
  });

  it("難易度指定の直後に空白がなくても技能名から外す", () => {
    const content = `CC<=61h操縦（ヘリコプター） ${result(30, 0, "24", "24 ＞ 成功")}`;

    expect(parseCheckRoll(content)?.skill).toBe("操縦（ヘリコプター）");
  });

  it("EDU のように e/h で始まる技能名は難易度指定とみなさない", () => {
    expect(
      parseCheckRoll(`CC<=50 EDU ${result(50, 0, "10", "10 ＞ ハード成功")}`)
        ?.skill,
    ).toBe("EDU");
    expect(
      parseCheckRoll(`CC<=50 hoge ${result(50, 0, "10", "10 ＞ ハード成功")}`)
        ?.skill,
    ).toBe("hoge");
  });

  it("ボーナス・ダイスの数を正の値として読み取る", () => {
    const content = `CC1<=42 射撃（拳銃） ${result(42, 1, "57, 47", "47 ＞ 失敗")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 1,
      skill: "射撃（拳銃）",
      succeeded: false,
    });
  });

  it("ペナルティ・ダイスの数を負の値として読み取り、閉じ括弧が欠けた技能名もそのまま取る", () => {
    const content = `CC-1<=65 【射撃（サブマシンガン）】（精神世界 ${result(65, -1, "42, 12", "42 ＞ レギュラー成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: -1,
      skill: "【射撃（サブマシンガン）】（精神世界",
      succeeded: true,
    });
  });

  it("技能名がない判定行は skill が空文字になる", () => {
    const content = `CC<=50 ${result(50, 0, "10", "10 ＞ ハード成功")}`;

    expect(parseCheckRoll(content)).toEqual({
      diceModifier: 0,
      skill: "",
      succeeded: true,
    });
  });

  it("ファンブルは成功ではない", () => {
    const content = `CC<=30 【回避】 ${result(30, 0, "100", "100 ＞ ファンブル")}`;

    expect(parseCheckRoll(content)?.succeeded).toBe(false);
  });

  it("クリティカルは成功として扱う", () => {
    const content = `CC<=30 【回避】 ${result(30, 0, "1", "1 ＞ クリティカル")}`;

    expect(parseCheckRoll(content)?.succeeded).toBe(true);
  });

  it("CC 系でない判定行や発言は null を返す", () => {
    expect(parseCheckRoll("1d100<=50 → 23 成功")).toBeNull();
    expect(parseCheckRoll("1D10 回避 (1D10) ＞ 3")).toBeNull();
    expect(parseCheckRoll("こんにちは")).toBeNull();
  });
});

describe("collectGrowthChecks", () => {
  const roll = (
    name: string,
    command: string,
    tail: string,
    tab = "main",
    modifier = 0,
  ): DiceLog => ({
    tab,
    name,
    content: `${command} ${result(50, modifier, "10", tail)}`,
  });
  const success = "10 ＞ レギュラー成功";
  const failure = "70 ＞ 失敗";
  const options = { excludeMythosAndCredit: true };

  it("同じ技能で複数回成功しても1件にまとめ、根拠は初出の行になる", () => {
    const logs = [
      roll("アリス", "CC<=50 【目星】", success),
      roll("アリス", "CC<=50 【目星】", "5 ＞ ハード成功"),
    ];

    const checks = collectGrowthChecks(logs, "アリス", "", options);

    expect(checks).toHaveLength(1);
    expect(checks[0]).toEqual({ skill: "【目星】", evidence: logs[0] });
  });

  it("ボーナスありの成功は根拠にならず、ボーナスなしの成功があればその行が根拠になる", () => {
    const logs = [
      roll("アリス", "CC1<=50 【目星】", success, "main", 1),
      roll("アリス", "CC<=50 【目星】", success),
    ];

    const checks = collectGrowthChecks(logs, "アリス", "", options);

    expect(checks).toEqual([{ skill: "【目星】", evidence: logs[1] }]);
  });

  it("ボーナスありの成功しかない技能は対象にならない", () => {
    const logs = [roll("アリス", "CC2<=50 【目星】", success, "main", 2)];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
  });

  it("ペナルティありの成功は対象になる", () => {
    const logs = [roll("アリス", "CC-1<=50 【目星】", success, "main", -1)];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toHaveLength(1);
  });

  it("成功と失敗が混在していれば対象になる", () => {
    const logs = [
      roll("アリス", "CC<=50 【目星】", failure),
      roll("アリス", "CC<=50 【目星】", success),
    ];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([
      { skill: "【目星】", evidence: logs[1] },
    ]);
  });

  it("失敗しかない技能は対象にならない", () => {
    const logs = [roll("アリス", "CC<=50 【目星】", failure)];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
  });

  it("特性値・アイデア・知識・幸運・正気度ロールは括弧の有無によらず対象外", () => {
    const logs = [
      roll("アリス", "CC<=50 【DEX】", success),
      roll("アリス", "CC<=50 DEX", success),
      roll("アリス", "CC<=50 STR", success),
      roll("アリス", "CC<=50 【アイデア】", success),
      roll("アリス", "CC<=50 知識", success),
      roll("アリス", "CC<=50 幸運", success),
      roll("アリス", "CC<=50 正気度ロール", success),
      roll("アリス", "CC<=50 【正気度ロール】", success),
    ];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
  });

  it("除外は完全一致で行い、特性値名を含むだけの技能は対象になる", () => {
    const logs = [roll("アリス", "CC<=50 幸運回復", success)];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toHaveLength(1);
  });

  it("クトゥルフ神話・信用は除外オプションが真なら対象外、偽なら対象", () => {
    const logs = [
      roll("アリス", "CC<=50 【クトゥルフ神話】", success),
      roll("アリス", "CC<=50 信用", success),
    ];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
    expect(
      collectGrowthChecks(logs, "アリス", "", {
        excludeMythosAndCredit: false,
      }).map((check) => check.skill),
    ).toEqual(["【クトゥルフ神話】", "信用"]);
  });

  it("技能名のない判定行は対象にならない", () => {
    const logs = [roll("アリス", "CC<=50", success)];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
  });

  it("括弧の有無や後置の注記が違えば別の技能として両方載る(正規化しない)", () => {
    const logs = [
      roll("アリス", "CC<=50 【目星】", success),
      roll("アリス", "CC<=50 目星", success),
      roll("アリス", "CC<=50 【回避】（精神世界）", success),
    ];

    expect(
      collectGrowthChecks(logs, "アリス", "", options).map((c) => c.skill),
    ).toEqual(["【目星】", "目星", "【回避】（精神世界）"]);
  });

  it("同じ技能を通常・ハード・イクストリームで振っても1つにまとめる", () => {
    const logs = [
      roll("アリス", "CC<=91h 機械修理", "43 ＞ 成功"),
      roll("アリス", "CC<=91e 機械修理", "17 ＞ 成功"),
      roll("アリス", "CC<=91 機械修理", success),
    ];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([
      { skill: "機械修理", evidence: logs[0] },
    ]);
  });

  it("他のキャラクターの判定は含めない", () => {
    const logs = [
      roll("アリス", "CC<=50 【目星】", success),
      roll("ボブ", "CC<=50 【聞き耳】", success),
    ];

    expect(
      collectGrowthChecks(logs, "アリス", "", options).map((c) => c.skill),
    ).toEqual(["【目星】"]);
  });

  it("タブを指定するとそのタブの行だけを対象にする", () => {
    const logs = [
      roll("アリス", "CC<=50 【目星】", success, "main"),
      roll("アリス", "CC<=50 【聞き耳】", success, "other"),
    ];

    expect(
      collectGrowthChecks(logs, "アリス", "other", options).map((c) => c.skill),
    ).toEqual(["【聞き耳】"]);
    expect(collectGrowthChecks(logs, "アリス", "info", options)).toEqual([]);
  });

  it("タブが空の行は「すべて」のときだけ対象になる", () => {
    const logs = [roll("アリス", "CC<=50 【目星】", success, "")];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toHaveLength(1);
    expect(collectGrowthChecks(logs, "アリス", "main", options)).toEqual([]);
  });

  it("CC 系でない行だけのログでは空になる", () => {
    const logs: DiceLog[] = [
      { tab: "main", name: "アリス", content: "1d100<=50 → 23 成功" },
    ];

    expect(collectGrowthChecks(logs, "アリス", "", options)).toEqual([]);
  });
});

describe("formatGrowthChecks", () => {
  it("名前の見出しの下に技能名をインラインコードの入れ子リストで並べる", () => {
    const evidence: DiceLog = { tab: "main", name: "アリス", content: "" };

    expect(
      formatGrowthChecks("アリス", [
        { skill: "【医学】", evidence },
        { skill: "【応急手当】", evidence },
      ]),
    ).toEqual([
      "**アリス**",
      "- 成長技能一覧",
      "  - `【医学】`",
      "  - `【応急手当】`",
    ]);
  });

  it("空でも名前と箇条書きの見出しは返す", () => {
    expect(formatGrowthChecks("アリス", [])).toEqual([
      "**アリス**",
      "- 成長技能一覧",
    ]);
  });
});
