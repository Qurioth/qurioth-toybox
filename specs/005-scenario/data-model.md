# Data Model: シナリオごとの専用ページ

**Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

## シナリオの登録(`src/data/scenario/scenario-list.ts`)

既存の `Scenario` 型を次のように変える。

| 項目 | 型 | 変更 | 説明 |
| -- | -- | -- | -- |
| `title` / `titleKana` / `system` / `players` / `playTimeHours` / `summary` | — | なし | 一覧と詳細の共通情報 |
| `markdown` | `string`(任意) | 必須 → 任意 | 未移行のシナリオの本文。移行したら削除する |
| `page` | `() => Promise<{ default: ComponentType }>`(任意) | 追加 | 専用ページ。`() => import("@/scenarios/<slug>")` |
| `structured` | — | 削除 | 2026-10-02 版の構造化表示の印 |

**検証ルール**(`scenario-list.test.ts`):

- 各エントリは `markdown` と `page` のちょうど一方を持つ(二重管理しない。どちらも無いシナリオは
  作らない)。
- `page` を持つシナリオの `src/scenarios/<slug>/` には `index.tsx` と `content.mdx` がある。

## 専用ページ(`src/scenarios/<slug>/`)

```text
src/scenarios/<slug>/
├── index.tsx     # default export のページ部品。<ScenarioPage theme={…}> で包み、<Content /> を置く
├── content.mdx   # 本文。Markdown + 部品
└── npcs.ts       # export const npcs = { … } satisfies Record<string, ScenarioNpc>
```

ページ独自の部品(タブ、ハンドアウトなど)が要るときは、同じディレクトリに `*.tsx` を足してよい。

### ScenarioTheme(`<ScenarioPage theme>` の props)

CSS カスタムプロパティとして外枠に設定し、部品はこれを参照する。どれも省略でき、省略時は既定の色に
なる。

| 項目 | CSS 変数 | 用途 |
| -- | -- | -- |
| `accent` | `--scenario-accent` | 見出しの線、目次の現在の項目、ED の番号など |
| `surface` | `--scenario-surface` | カードの背景 |
| `border` | `--scenario-border` | カードの枠 |
| `dark` | (上記のダークモード用の値) | `{ accent, surface, border }` |

## NPC データ(`src/types/scenario-npc.ts`)

```ts
type ScenarioNpc = {
  name: string;                 // 例: "沖嶋 深月"
  kana?: string;                // 見出しの補足。例: "オキシマ ミツキ"
  portrait?: {
    src: string;
    alt?: string;
    // カードの丸いアイコンに映す範囲を変えたいときに書く。x・y は顔の中心、width はアイコンに収める幅
    // (どれも画像に対する %)。省略時は画像の幅いっぱいを映し、上から少し下を見せる
    face?: { x?: number; y?: number; width?: number };
  };
  profile?: string;             // プロフィール(プレーンテキスト、改行あり)。コマのメモにも使う
  stats?: NpcStatBlock[];       // 0 個以上。複数の姿はここで分ける
  skills?: NpcSkill[];          // チャットパレットとカードの技能欄に使う
};

type NpcStatBlock = {
  label?: string;               // 例: "怪物の姿"
  abilities: StatEntry[];       // STR〜EDU のうち持つもの。規約の順
  derived: StatEntry[];         // 耐久力・マジック・ポイント・正気度・ダメージ・ボーナス など
};

type StatEntry = { label: string; value: string };   // 値は文字列のまま(`105 - 10` なども可)

type NpcSkill = {
  name: string;                 // 例: "目星"、"運転（自動車）"
  value: number;                // 例: 55
  note?: string;                // 値の後ろの補足。例: "ダメージ 1D3+DB"
};
```

**検証ルール**:

- `stats[].abilities` は STR・CON・POW・DEX・APP・SIZ・INT・EDU の順(FR-019)。下書きの生成と、
  専用ページを持つシナリオの `npcs.ts` へのテストで確かめる。
- `skills[].value` は 0〜999 の整数。
- 能力値を持たない存在は `abilities: []` で、`derived` から書き始める(耐久力のみの存在など)。

**MDX 側の書き方**: カードの見た目のうち、データにしない記述(セリフ例・呪文・装甲・正気度喪失・
行動パターン・備考など)は `<NpcCard>` の子要素として MDX で書く。

```mdx
<NpcCard npc={npcs.mitsuki}>

#### セリフ例

> 「こんにちは」  
> 「また来たの？」

</NpcCard>
```

## CCFOLIA のコマ(`src/utils/ccfolia-koma-utils.ts`)

`toCcfoliaKoma(npc: ScenarioNpc): CharacterClipboardData` で作る。形式は CCFOLIA 公式の
Clipboard API (beta)。項目ごとの対応は [contracts/ccfolia-koma.md](contracts/ccfolia-koma.md)。

## 下書きへの変換(`src/utils/scenario-draft-utils.ts`)

`createScenarioDraft(id, scenario): { indexTsx, contentMdx, npcsTs }`。2026-10-02 版の
`splitScenarioMarkdown` の結果(`ScenarioDocument`)を、次の規則で書き出す。

| 元の本文 | 下書き |
| -- | -- |
| サブタイトル・H1・リード | `<ScenarioOverview>` の子要素(リード)。タイトル・人数・時間は登録情報から部品が出す |
| `##` の章 | `## 見出し` のまま |
| 人物(`SectionKind = character`)の `###` | `npcs.ts` に `ScenarioNpc` を足し、`<NpcCard npc={npcs.<key>}>` を置く。立ち絵・プロフィール・`ステータス` の小節・(解析できれば)`技能` の小節はデータへ。他の小節は子要素の MDX |
| 人物以外の能力値の段落(場面内の敵など) | `<StatGrid stats={…}>`。形に合わない行(正気度喪失など)は子要素の MDX |
| `ED<番号> 【名称】` の `###` | `<Ending number="1" name="…">` |
| `その他報酬` の `###` | `<Reward>` |
| `『…』` の `###` | `<Tome name="…">`(見出しの補足があれば `kana`) |
| その他の `###` / `####` / 段落 | Markdown のまま |
| HTML コメント | MDX のコメント `{/* … */}` |
| `{` `}` `<`(コードブロックとインラインコードの外) | エスケープ(`\{` `\}` `\<`) |

**技能の解析**: `技能` の小節の各行から `名前: 数値%` を順に取り出し、数値の後ろからの次の技能の前
までを `note` にする。最初の技能より前に文字列がある行(`攻撃回数: 2 + 1D6` など)を含む場合や、
取り出した技能を並べ直すと元の文字列に戻らない場合は、データにせず小節を子要素の MDX として残す
(欠落させない)。

**キーの決め方**: `npcs` のキーは、立ち絵のファイル名(`mitsuki.png` → `mitsuki`)があればそれを使い、
なければ `npc1`, `npc2` … とする(オーナーが後で直す)。

**不変条件(テストで確認)**: 元の本文の空でない各行から見出し記号・リストの記号・引用の記号・太字の
記号・前後の空白を除いた文字列が、`contentMdx` か `npcsTs` のどちらかに含まれる。
