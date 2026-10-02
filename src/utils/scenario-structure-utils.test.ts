import { describe, expect, it } from "vitest";
import {
  buildScenarioToc,
  classifyStrong,
  isReadAloud,
  parseStatLines,
  restoreScenarioMarkdown,
  type Section,
  splitDifficulty,
  splitNotation,
  splitScenarioMarkdown,
  toCharacter,
  toEnding,
  toTomeName,
} from "./scenario-structure-utils";

const sample = `_The Sample_

# サンプル

このシナリオは"クトゥルフ神話TRPG ルールブック 7版"に対応したシナリオである。
舞台は現代の日本。

## GM 向け情報

真相。

## 主な NPC

### 沖嶋 深月 (オキシマ ミツキ)

![沖嶋 深月](/images/sample/mitsuki.png)
女性。

#### ステータス

STR: 55 CON: 75

### 案内人

プロフィールだけの人物。

## 潮上灯台跡 (夜間)

### 机

\`\`\`
# これは見出しではない
日記の本文
\`\`\`

#### 日誌

##### 20XX 年 XX 月 XX 日

細分は本文に残る。

### 『食屍鬼写本』

- 著者：不明

### 机

同名の調査対象。

## クライマックス

### 神話生物

#### ステータス

STR: 60

## シナリオ終了

### ED1 【帰還】

正気度回復: 1D10

### その他報酬 (任意)

#### 全員生還

正気度回復: 1D4
`;

describe("splitScenarioMarkdown", () => {
  const doc = splitScenarioMarkdown(sample);

  it("サブタイトル・タイトル・リードを切り出す", () => {
    expect(doc.subtitle).toBe("The Sample");
    expect(doc.title?.text).toBe("サンプル");
    expect(doc.lead).toContain("舞台は現代の日本。");
    expect(doc.lead).not.toContain("真相。");
  });

  it("## を章、### を節、#### を小節に分ける", () => {
    expect(doc.chapters.map((chapter) => chapter.heading.text)).toEqual([
      "GM 向け情報",
      "主な NPC",
      "潮上灯台跡",
      "クライマックス",
      "シナリオ終了",
    ]);
    expect(doc.chapters[1].sections[0].subsections[0].heading.text).toBe(
      "ステータス",
    );
  });

  it("フェンス内の # 行を見出しにしない", () => {
    const desk = doc.chapters[2].sections[0];
    expect(desk.body).toContain("# これは見出しではない");
    expect(
      desk.subsections.map((subsection) => subsection.heading.text),
    ).toEqual(["日誌"]);
  });

  it("##### は小節の本文に残す", () => {
    const diary = doc.chapters[2].sections[0].subsections[0];
    expect(diary.body).toContain("##### 20XX 年 XX 月 XX 日");
    expect(diary.body).toContain("細分は本文に残る。");
  });

  it("末尾の半角括弧を補足として分ける", () => {
    const npc = doc.chapters[1].sections[0].heading;
    expect(npc.text).toBe("沖嶋 深月");
    expect(npc.kana).toBe("オキシマ ミツキ");
    expect(doc.chapters[2].heading.kana).toBe("夜間");
  });

  it("重複する見出しの id に連番を付ける", () => {
    const [first, , second] = doc.chapters[2].sections;
    expect(first.heading.id).toBe("机");
    expect(second.heading.id).toBe("机-2");
    expect(doc.chapters[1].sections[0].heading.id).toBe(
      "沖嶋-深月-(オキシマ-ミツキ)",
    );
  });

  it("章の種別を見出し名で判定する", () => {
    expect(doc.chapters.map((chapter) => chapter.kind)).toEqual([
      "gm-info",
      "npcs",
      "scene",
      "climax",
      "ending",
    ]);
  });

  it("節の種別を判定する", () => {
    const kinds = doc.chapters.map((chapter) =>
      chapter.sections.map((section) => section.kind),
    );
    expect(kinds).toEqual([
      [],
      ["character", "character"],
      ["topic", "tome", "topic"],
      ["character"],
      ["ending", "reward"],
    ]);
  });

  it("分割結果を連結すると元の Markdown に戻る", () => {
    expect(restoreScenarioMarkdown(doc)).toBe(sample);
  });

  it("末尾に改行のない本文や H1 のない本文も元に戻る", () => {
    for (const markdown of ["# タイトル\n\n本文", "## 章だけ\n本文", ""]) {
      expect(restoreScenarioMarkdown(splitScenarioMarkdown(markdown))).toBe(
        markdown,
      );
    }
  });
});

describe("buildScenarioToc", () => {
  const toc = buildScenarioToc(splitScenarioMarkdown(sample));

  it("全章を並べ、人物・エンディング・その他報酬だけを入れ子にする", () => {
    expect(
      toc.map((item) => [
        item.label,
        item.children.map((child) => child.label),
      ]),
    ).toEqual([
      ["GM 向け情報", []],
      ["主な NPC", ["沖嶋 深月", "案内人"]],
      ["潮上灯台跡", []],
      ["クライマックス", ["神話生物"]],
      ["シナリオ終了", ["ED1 【帰還】", "その他報酬"]],
    ]);
  });

  it("見出しの id で移動先を指す", () => {
    expect(toc[1].children[0].id).toBe("沖嶋-深月-(オキシマ-ミツキ)");
    expect(toc[2].id).toBe("潮上灯台跡-(夜間)");
  });
});

describe("parseStatLines", () => {
  it("1 行目を能力値、2 行目以降を副次ステータスとして読む", () => {
    expect(
      parseStatLines(
        "STR: 55 CON: 75 POW: 45 DEX: 60 APP: 60 SIZ: 60 INT: 85 EDU: 53\n耐久力: 13 マジック・ポイント: 9 ダメージ・ボーナス: +0",
      ),
    ).toEqual({
      abilities: [
        { label: "STR", value: "55" },
        { label: "CON", value: "75" },
        { label: "POW", value: "45" },
        { label: "DEX", value: "60" },
        { label: "APP", value: "60" },
        { label: "SIZ", value: "60" },
        { label: "INT", value: "85" },
        { label: "EDU", value: "53" },
      ],
      derived: [
        { label: "耐久力", value: "13" },
        { label: "マジック・ポイント", value: "9" },
        { label: "ダメージ・ボーナス", value: "+0" },
      ],
      rest: [],
    });
  });

  it("持たない能力値は飛ばしたまま読む", () => {
    expect(
      parseStatLines("STR: 60 CON: 50 DEX: 70 SIZ: 80")?.abilities.map(
        (entry) => entry.label,
      ),
    ).toEqual(["STR", "CON", "DEX", "SIZ"]);
  });

  it("数値以外の値も文字列のまま保持する", () => {
    expect(
      parseStatLines(
        "STR: 105 - 10 CON: 110 - 10 POW: 15（初期値: 55） DEX: 90",
      )?.abilities,
    ).toEqual([
      { label: "STR", value: "105 - 10" },
      { label: "CON", value: "110 - 10" },
      { label: "POW", value: "15（初期値: 55）" },
      { label: "DEX", value: "90" },
    ]);
  });

  it("形に合わない行は rest に残す", () => {
    expect(parseStatLines("STR: 60\n※ 状況によって変わる")?.rest).toEqual([
      "※ 状況によって変わる",
    ]);
  });

  it("能力値を持たない存在は耐久力から書き始めた段落を副次ステータスとして読む", () => {
    expect(parseStatLines("耐久力: 60 装甲: 4")).toEqual({
      abilities: [],
      derived: [
        { label: "耐久力", value: "60" },
        { label: "装甲", value: "4" },
      ],
      rest: [],
    });
  });

  it("能力値・耐久力で始まらない段落は能力値として扱わない", () => {
    expect(parseStatLines("近接戦闘: 50% ダメージ 1D6")).toBeUndefined();
    expect(parseStatLines("マジック・ポイント: 9")).toBeUndefined();
    expect(parseStatLines("扉を開けると STR: 50 の怪物がいる")).toBeUndefined();
  });
});

describe("toCharacter", () => {
  const characters = splitScenarioMarkdown(sample).chapters[1].sections;

  it("本文先頭の画像を立ち絵として分け、残りをプロフィールにする", () => {
    const character = toCharacter(characters[0]);
    expect(character.portrait).toEqual({
      alt: "沖嶋 深月",
      src: "/images/sample/mitsuki.png",
    });
    expect(character.profile.trim()).toBe("女性。");
  });

  it("立ち絵がなければ本文をそのままプロフィールにする", () => {
    const character = toCharacter(characters[1]);
    expect(character.portrait).toBeUndefined();
    expect(character.profile.trim()).toBe("プロフィールだけの人物。");
  });

  it("小節を出現順のまま保ち、姿ごとのステータスを分けて持つ", () => {
    const [creature] = splitScenarioMarkdown(`## クライマックス

### 膨らんだ女

#### ステータス

POW: 50

#### 技能

回避: 45%

#### ステータス (怪物の姿)

POW: 500
`).chapters[0].sections;
    expect(
      toCharacter(creature).subsections.map((subsection) => [
        subsection.heading.text,
        subsection.heading.kana,
      ]),
    ).toEqual([
      ["ステータス", undefined],
      ["技能", undefined],
      ["ステータス", "怪物の姿"],
    ]);
  });
});

describe("表記の分類", () => {
  it("太字の中身を判定・正気度喪失・それ以外に分ける", () => {
    expect(classifyStrong("〈目星〉")).toEqual({ kind: "check" });
    expect(classifyStrong("〈INT〉のボーナス・ダイス 1 個")).toEqual({
      kind: "check",
    });
    expect(classifyStrong("正気度喪失：0 ／ 1D6")).toEqual({
      kind: "sanity-loss",
      success: "0",
      failure: "1D6",
    });
    expect(classifyStrong("正気度喪失：1D10")).toEqual({
      kind: "sanity-loss",
      fixed: "1D10",
    });
    expect(classifyStrong("正気度喪失")).toEqual({ kind: "sanity-loss" });
    expect(classifyStrong("重要")).toEqual({ kind: "plain" });
  });

  it("地の文から呪文・魔導書・正気度回復を区切る", () => {
    expect(
      splitNotation("『食屍鬼写本』に《カーの分配》が載る。正気度回復: 1D6。"),
    ).toEqual([
      { kind: "tome", text: "『食屍鬼写本』" },
      { kind: "text", text: "に" },
      { kind: "spell", text: "《カーの分配》" },
      { kind: "text", text: "が載る。" },
      { kind: "sanity-recovery", text: "正気度回復: 1D6" },
      { kind: "text", text: "。" },
    ]);
  });

  it("コロンの後に空白がない正気度回復も区切る", () => {
    expect(splitNotation("正気度回復:1D4")).toEqual([
      { kind: "sanity-recovery", text: "正気度回復:1D4" },
    ]);
  });

  it("判定の直後の難易度を取り出す", () => {
    expect(splitDifficulty(" のハード に成功すると")).toEqual({
      difficulty: " のハード",
      rest: " に成功すると",
    });
    expect(splitDifficulty(" のイクストリーム")?.difficulty).toBe(
      " のイクストリーム",
    );
    expect(splitDifficulty(" に成功する")).toBeUndefined();
  });
});

describe("エンディング・魔導書・読み上げ文", () => {
  const sectionOf = (markdown: string): Section =>
    splitScenarioMarkdown(markdown).chapters[0].sections[0];

  it("ED の番号と名称を分ける", () => {
    expect(
      toEnding(sectionOf("## シナリオ終了\n### ED1 【腐海より戻りし者】\n")),
    ).toEqual({ number: "1", name: "腐海より戻りし者" });
    expect(toEnding(sectionOf("## シナリオ終了\n### ED2 生還\n"))).toEqual({
      number: "2",
      name: "生還",
    });
  });

  it("魔導書の名前を『』から取り出す", () => {
    expect(toTomeName(sectionOf("## 廃墟\n### 『フサン謎の七書』\n"))).toBe(
      "フサン謎の七書",
    );
  });

  it("読み上げ文の目印を見分ける", () => {
    expect(isReadAloud("[!読み上げ]\n扉を開けると")).toBe(true);
    expect(isReadAloud("「こんにちは」")).toBe(false);
  });
});
