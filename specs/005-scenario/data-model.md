# Data Model: シナリオ詳細画面の構造化表示

**Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

本文 Markdown を解釈して得る構造(表示用のモデル)を定義する。永続化されるのは従来どおり
Markdown と `scenario-list.ts` のエントリだけで、以下のモデルは表示のたびに Markdown から
組み立てる。型の名前は実装の目安で、`src/utils/scenario-structure-utils.ts` に置く。

## 登録データ(`scenario-list.ts`)

既存の `Scenario` 型に 1 項目を足す。

| 項目 | 型 | 説明 |
| -- | -- | -- |
| (既存)`title` / `titleKana` / `system` / `players` / `playTimeHours` / `summary` / `markdown` | — | 変更なし |
| `structured` | `true`(任意) | 構造化表示へ移行済みであることを示す。無ければ従来の整形表示(FR-010 / FR-027) |

**検証ルール**:

- `structured: true` は `system` にクトゥルフ神話TRPGを含むシナリオにだけ付ける(FR-029)。
  データ適合テストで確認する。

## 構造(`ScenarioDocument`)

```text
ScenarioDocument
├── preamble: Markdown           # H1 より前の原文
├── subtitle?: string            # preamble の斜体 1 行(装飾を除いた文字列)
├── title?: Heading              # H1
├── lead: Markdown               # H1 から最初の ## までの本文(概要リード)
└── chapters: Chapter[]          # ## ごと。本文の出現順
    └── Chapter
        ├── kind: ChapterKind
        ├── heading: Heading
        ├── body: Markdown       # ## 直下、最初の ### までの本文
        └── sections: Section[]  # ### ごと
            └── Section
                ├── kind: SectionKind
                ├── heading: Heading
                ├── body: Markdown           # ### 直下、最初の #### までの本文
                └── subsections: Subsection[]  # #### ごと
                    └── Subsection
                        ├── heading: Heading
                        └── body: Markdown   # ##### 以下はこの中に Markdown のまま含める
```

### Heading

| 項目 | 型 | 説明 |
| -- | -- | -- |
| `text` | string | 見出しの文字列から読み仮名の括弧を除いたもの(`沖嶋 深月`) |
| `kana` | string? | 末尾の半角括弧 ` (…)` の中身(`オキシマ ミツキ`、`夜間`、`怪物の姿`) |
| `source` | string | 見出し行の原文(改行文字を含む)。網羅性テストで元の本文を再構成するのに使う |
| `id` | string | ページ内リンク用。見出しの文字列(`#` を除いたもの)の空白を `-` に置換したもの。重複時は `-2`, `-3` … を付ける |

規約では、読み仮名とそれ以外の補足(`(夜間)` など)が同じ半角括弧になる。そのため `kana` は
「括弧の中身」として扱い、表示側では見出しの補足として小さく添えるだけにする(読み仮名か
どうかを区別しない)。

### ChapterKind

| 値 | 判定(`##` の `text`) | 備考 |
| -- | -- | -- |
| `gm-info` | `GM 向け情報` | |
| `handout` | `特殊 HO` | |
| `recommended-skills` | `推奨技能` | |
| `npcs` | `主な NPC` | 直下の `###` はすべて `character` |
| `introduction` | `シナリオの導入` | |
| `climax` | `クライマックス` | |
| `ending` | `シナリオ終了` | |
| `scene` | 上記以外 | 場所・場面。`###` は調査対象 |

### SectionKind

上から順に判定し、最初に当てはまったものを採る。

| 値 | 判定 | 表示 |
| -- | -- | -- |
| `character` | 親が `npcs`、または `####` に `ステータス` / `技能` / `セリフ例` で始まるものを持つ | 人物カード(Character) |
| `ending` | `text` が `ED` + 数字で始まる | エンディング。番号と `【】` 内の名称を見出しにする |
| `reward` | `text` が `その他報酬` で始まる | その他報酬。エンディングと区別した見た目 |
| `tome` | `text` が `『` で始まり `』` で終わる | 魔導書・アーティファクトのカード |
| `topic` | 上記以外 | 調査対象などの汎用区画 |

### Character(`kind = character` の Section から導出)

| 項目 | 由来 | 説明 |
| -- | -- | -- |
| `portrait` | `body` 先頭の画像 `![名前](…)` | 立ち絵。無ければ省略(Edge Case) |
| `profile` | `body` から立ち絵の行を除いたもの | プロフィール(性別・年齢・職業・来歴) |
| `subsections` | `####` すべて | 本文の出現順のまま並べる。`ステータス` で始まるものは見出しの補足(`(怪物の姿)` など)ごとに分かれ(FR-020 の「姿ごと」)、中の能力値の段落は StatBlock として描画する。`セリフ例` の引用は 1 行ずつ区切る(FR-022) |

`####` の並び順は本文の出現順を保つ。カード内の配置を整えるために並べ替えることはしない
(本文と照らし合わせやすくするため)。

### StatBlock

能力値の段落を行ごとに読む。能力値の段落とは、1 行目が `STR` `CON` `POW` `DEX` `APP` `SIZ`
`INT` `EDU` のいずれかと `:` で始まる段落を指す。能力値を持たない存在(アドゥムブラリ、
サーバーコアなど)は `耐久力:` から書き始めるので、1 行目が `耐久力:` の段落も副次
ステータスだけの能力値の段落として扱う。形に合わない行(`rest`)は、太字の正気度喪失などの
書式を保つため、段落の元の Markdown から取り出して本文と同じ書式で描画する。判定は見出しのレベルに依存させない。人物
カードの `#### ステータス` だけでなく、場面の中に `####` で置かれた敵の `##### ステータス`
(the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars の「保護プログラム」など)も、
同じ能力値表示になる。Markdown の描画時に段落単位で適用する。

| 項目 | 説明 |
| -- | -- |
| `abilities` | 1 行目から、`STR` `CON` `POW` `DEX` `APP` `SIZ` `INT` `EDU` のうち現れたものを `{ label, value }` で出現順に並べる |
| `derived` | 2 行目以降の `項目名: 値` の組。`耐久力` `マジック・ポイント` `正気度` `幸運` `ダメージ・ボーナス` `ビルド` `移動率` `装甲` `攻撃回数` など |
| `rest` | 上記の形に当てはまらない行(Markdown のまま) |

**検証ルール**:

- `value` は文字列のまま保持する。`15（初期値: 55）` や `105 - 10` のような数値以外の値も、
  そのまま表示する(FR-028)。
- 値の区切りは「次の `項目名:` の直前」とする(`STR: 105 - 10 CON: 110 - 10` は
  `105 - 10` と `110 - 10` に分かれる)。
- `ステータス` で始まる見出しの下に能力値の段落が 1 つも無い場合は、本文をそのまま表示する。
  データ適合テストでは失敗として検出する(移行時に直す)。

### Tome(`kind = tome` の Section から導出)

見出しの `『』` の中身を名前として取り出し、カードの枠の中に本文をそのまま表示する。
魔導書の属性(`記載されている言語` `著者` `正気度喪失` …)は規約どおりの箇条書きで書かれて
おり、値に出典(`**_基本ルールブック_** 準拠`)や判定の太字が入る。属性を解析して並べ直すと
この書式が失われるため、箇条書きのまま描画する(実装時に方針を変更)。

### Ending

| 項目 | 由来 |
| -- | -- |
| `number` | `ED` に続く数字 |
| `name` | `【…】` の中身。無ければ `text` 全体 |
| `body` / `subsections` | Section のまま |

## 目次(`TocItem`)

| 項目 | 説明 |
| -- | -- |
| `id` / `label` | 対象の `Heading.id` / `Heading.text` |
| `children` | その章の `character` / `ending` / `reward` の Section |

全章(`##`)を並べる。`topic` / `tome` の Section は載せない(research R6)。

## 網羅性の不変条件

次の式で Markdown を再構成したとき、入力と一致しなければならない(research R8)。

```text
preamble + title.source + lead
+ Σ chapters ( heading.source + body
  + Σ sections ( heading.source + body
    + Σ subsections ( heading.source + body ) ) )
```

ここで `preamble`、`source`、`body` などは、解釈前の Markdown をそのまま(改行文字を含めて)保持したものを指す。
`portrait` / `profile` / `StatBlock` / `Tome` / `Ending` は表示用の派生値で、この不変条件の
対象外とする。派生元の `body` は常に保持しておく。
