import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import scenarios from "@/data/scenario/scenario-list";
import type { ScenarioNpc } from "@/types/scenario-npc";
import {
  createScenarioDraft,
  escapeMdx,
  parseSkills,
} from "./scenario-draft-utils";

/** 行末の半角スペース 2 つ(改行)を落とさないよう、行の配列から本文を作る */
const lines = (...source: string[]) => source.join("\n");

const npcsOf = (npcsTs: string): Record<string, ScenarioNpc> =>
  JSON.parse(
    npcsTs.slice(
      npcsTs.indexOf("export const npcs = ") + "export const npcs = ".length,
      npcsTs.lastIndexOf(" satisfies"),
    ),
  );

const sample = lines(
  "_The Sample_",
  "",
  "# サンプル",
  "",
  "舞台は現代の日本。",
  "",
  "## 主な NPC",
  "",
  "### 沖嶋 深月 (オキシマ ミツキ)",
  "",
  "![沖嶋 深月](/images/sample/mitsuki.png)",
  "女性。写真家。  ",
  "探索者たちの共通の知人。",
  "",
  "#### ステータス",
  "",
  "STR: 55 CON: 75 POW: 45 DEX: 60  ",
  "耐久力: 13 マジック・ポイント: 9",
  "",
  "#### 技能",
  "",
  "芸術／製作（写真術）: 65% 目星: 45%  ",
  "近接戦闘（格闘）: 25% ダメージ 1D3+DB",
  "",
  "#### セリフ例",
  "",
  "> 「こんにちは」",
  "",
  "### 膨らんだ女",
  "",
  "#### 技能",
  "",
  "攻撃回数: 2 + 1D6",
  "回避: 45%",
  "",
  "## 廃墟",
  "",
  "<!-- メモ -->",
  "",
  "### 奥の部屋",
  "",
  "**〈目星〉** に成功すると {日誌} を得る。`{そのまま}`",
  "",
  "```",
  "# 作中の {文字}",
  "```",
  "",
  "#### 保護プログラム",
  "",
  "##### ステータス",
  "",
  "STR: 60 DEX: 50  ",
  "**正気度喪失：0 ／ 1D6**",
  "",
  "### 『黒霜石』 (コクソウセキ)",
  "",
  "- 記載されている言語：日本語",
  "",
  "## シナリオ終了",
  "",
  "### ED1 【帰還】",
  "",
  "正気度回復: 1D10",
  "",
  "### その他報酬 (任意)",
  "",
  "#### 全員生還",
  "",
  "正気度回復: 1D4",
  "",
);

describe("createScenarioDraft", () => {
  const draft = createScenarioDraft({
    id: "Sample",
    title: "サンプル",
    markdown: sample,
  });
  const npcs = npcsOf(draft.npcsTs);

  it("人物を NPC データにし、<NpcCard> を置く", () => {
    expect(npcs.mitsuki).toEqual({
      name: "沖嶋 深月",
      kana: "オキシマ ミツキ",
      portrait: { src: "/images/sample/mitsuki.png" },
      profile: "女性。写真家。\n探索者たちの共通の知人。",
      stats: [
        {
          abilities: [
            { label: "STR", value: "55" },
            { label: "CON", value: "75" },
            { label: "POW", value: "45" },
            { label: "DEX", value: "60" },
          ],
          derived: [
            { label: "耐久力", value: "13" },
            { label: "マジック・ポイント", value: "9" },
          ],
        },
      ],
      skills: [
        { name: "芸術／製作（写真術）", value: 65 },
        { name: "目星", value: 45 },
        { name: "近接戦闘（格闘）", value: 25, note: "ダメージ 1D3+DB" },
      ],
    });
    expect(draft.contentMdx).toContain("<NpcCard npc={npcs.mitsuki}>");
    expect(draft.contentMdx).toContain("#### セリフ例");
    expect(draft.contentMdx).not.toMatch(/^#### ステータス$/m);
  });

  it("技能を解析できない人物は、技能の小節を子要素に残す", () => {
    expect(npcs.npc2).toEqual({ name: "膨らんだ女" });
    expect(draft.contentMdx).toContain(
      lines("<NpcCard npc={npcs.npc2}>", "", "#### 技能"),
    );
    expect(draft.contentMdx).toContain("攻撃回数: 2 + 1D6");
  });

  it("人物以外の能力値の段落は <StatGrid> にし、形に合わない行は子要素にする", () => {
    expect(draft.contentMdx).toContain(
      '<StatGrid stats={{"abilities":[{"label":"STR","value":"60"},{"label":"DEX","value":"50"}],"derived":[]}}>',
    );
    expect(draft.contentMdx).toContain("**正気度喪失：0 ／ 1D6**");
  });

  it("ED・その他報酬・魔導書を部品にする", () => {
    expect(draft.contentMdx).toContain('<Ending number="1" name={"帰還"}>');
    expect(draft.contentMdx).toContain('<Reward title={"その他報酬 (任意)"}>');
    expect(draft.contentMdx).toContain(
      '<Tome name={"黒霜石"} kana={"コクソウセキ"}>',
    );
  });

  it("概要にサブタイトルとリードを入れ、H1 は登録のタイトルに任せる", () => {
    expect(draft.contentMdx).toContain(
      lines(
        '<ScenarioOverview subtitle={"The Sample"}>',
        "",
        "舞台は現代の日本。",
        "",
        "</ScenarioOverview>",
      ),
    );
    expect(draft.contentMdx).not.toContain("# サンプル");
  });

  it("MDX で壊れる文字をエスケープし、コメントを MDX のコメントにする", () => {
    expect(draft.contentMdx).toContain("{/* メモ */}");
    expect(draft.contentMdx).toContain("を得る。`{そのまま}`");
    expect(draft.contentMdx).toContain("\\{日誌\\}");
    expect(draft.contentMdx).toContain("# 作中の {文字}");
  });

  it("下書きは MDX としてコンパイルできる", async () => {
    await expect(
      compile(draft.contentMdx, { remarkPlugins: [remarkGfm] }),
    ).resolves.toBeDefined();
  });

  it("index.tsx は ScenarioPage で本文を包む", () => {
    expect(draft.indexTsx).toContain("export default function SampleScenario");
    expect(draft.indexTsx).toContain(
      '<ScenarioPage scenario={scenario} toc="sidebar">',
    );
  });
});

describe("escapeMdx", () => {
  it("< と波括弧をエスケープする", () => {
    expect(escapeMdx("a < b {c}")).toBe("a \\< b \\{c\\}");
  });
});

describe("parseSkills", () => {
  it("値の後ろの補足を note にする", () => {
    expect(parseSkills("近接戦闘: 60% ダメージ: 1D4+DB  \n回避: 30%")).toEqual([
      { name: "近接戦闘", value: 60, note: "ダメージ: 1D4+DB" },
      { name: "回避", value: 30 },
    ]);
  });

  it("技能で始まらない行があれば解析しない", () => {
    expect(parseSkills("攻撃回数: 1\n回避: 30%")).toBeUndefined();
    expect(parseSkills("")).toBeUndefined();
  });
});

/** 元の行の語が下書きのどこかに残っているかを比べるための正規化 */
const toTokens = (line: string) =>
  line
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, "$1 $2")
    .replace(/^\s*(#+|>|[-*]|\d+\.)\s+/, "")
    .replace(/[*_【】『』|()]/g, " ")
    .split(/[\s:：%]+/)
    .filter((token) => token !== "" && !/^-+$/.test(token));

const valuesOf = (value: unknown): string[] =>
  typeof value === "object" && value !== null
    ? Object.values(value).flatMap(valuesOf)
    : [String(value)];

describe.each(
  Object.entries(scenarios).flatMap(([id, scenario]) =>
    scenario.markdown === undefined
      ? []
      : [{ id, title: scenario.title, markdown: scenario.markdown }],
  ),
)("$id の下書き", ({ id, title, markdown }) => {
  const draft = createScenarioDraft({ id, title, markdown });

  it("MDX としてコンパイルできる", async () => {
    await expect(
      compile(draft.contentMdx, { remarkPlugins: [remarkGfm] }),
    ).resolves.toBeDefined();
  });

  it("元の本文の語が欠落しない", () => {
    const haystack = [
      draft.contentMdx.replace(/\\([{}<])/g, "$1"),
      ...valuesOf(npcsOf(draft.npcsTs)),
    ].join("\n");
    const missing = markdown
      .split("\n")
      // H1 は登録のタイトルとして、ステータス・技能の見出しは NPC カードの欄として表示される
      .filter(
        (line) =>
          line.trim() !== "" &&
          line.trim() !== `# ${title}` &&
          !/^#{4,}\s+(ステータス|技能)$/.test(line.trim()),
      )
      .flatMap((line) =>
        toTokens(line)
          .filter((token) => {
            const ending = token.match(/^ED(\d+)$/);
            return ending
              ? !haystack.includes(`number="${ending[1]}"`)
              : !haystack.includes(token);
          })
          .map((token) => `${token}  ← ${line.trim()}`),
      );
    expect(missing).toEqual([]);
  });
});
