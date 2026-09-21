# Data Model: JSONログ対応・成長チェック一覧・タブ絞り込み

**Feature**: [spec.md](./spec.md) / **Plan**: [plan.md](./plan.md) / **Research**: [research.md](./research.md)

保存されるデータはない。すべてブラウザ内の一時的な値。

---

## 1. `DiceLog`(既存、`src/types/DiceLog.ts`)

ログの1行。HTML / JSON のどちらから来ても、変換後はこの形だけを扱う。

| フィールド | 型 | 内容 | HTML 由来 | JSON 由来 |
|---|---|---|---|---|
| `tab` | `string` | タブ名。**角括弧なし**(R5)。取り出せない行は `""` | `<span> [main]</span>` → `main` | `channelName` |
| `name` | `string` | 発言者名。空文字は名前一覧から除外 | `<span>name</span>` | `name` |
| `content` | `string` | 本文。1行に整形済み(改行は ` / `)、HTMLエスケープ復元済み | `:<span>…</span>` | `text`(+ ロール行は半角スペース + `extend.roll.result`) |

**変換ルール(JSON → DiceLog)**:

- `messages` の各要素を1行にする。`type === "system"` の要素は**生成しない**(FR-015)。
- `name` / `channelName` が文字列でなければ `""`。
- `text` 内の改行(`\n`)は ` / ` に置き換え、各断片の前後空白を落とし、空断片は捨てる
  (HTML の `toSingleLineContent` と同じ規則)。
- `extend.roll.result` が文字列なら `content = <整形済み text> + " " + result`。

**変換ルール(ファイル文字列 → DiceLog[])**(`parseDicelog`、R1):

```text
trim して "{" で始まる
  ├─ JSON.parse 成功 かつ messages が配列 → convertJsonDicelog
  └─ それ以外(parse 失敗 / messages なし)   → []  (FR-016)
それ以外 → convertDicelog(既存 HTML 変換)
```

## 2. `ParsedCheckRoll`(新規、`src/types/GrowthCheck.ts`)

`content` を解析した「判定行」の情報(R3)。判定行でない `content` に対しては `null`。

| フィールド | 型 | 内容 |
|---|---|---|
| `diceModifier` | `number` | `CC` 直後の数。正=ボーナス、負=ペナルティ、未指定=0 |
| `skill` | `string` | 技能名。前後空白のみ除去、`【】` はそのまま。空文字あり得る |
| `succeeded` | `boolean` | 末尾セグメントが `成功` / `レギュラー成功` / `ハード成功` / `イクストリーム成功` / `クリティカル` のいずれか |

**検証**: `content` が正規表現
`^CC(-?\d+)?<=\d+\s*(?:[eh](?=[^a-z0-9]|$))?\s*(.*?)\s*\(1D100<=\d+\)`(`i`)に一致しなければ
`null`(`CC` 系でない → FR-033)。難易度指定 `h` / `e` は技能名に含めない。直後が英数字なら
難易度指定ではなく技能名の頭文字(`EDU` など)とみなす。

## 3. `GrowthCheck`(新規、`src/types/GrowthCheck.ts`)

成長チェック一覧の1件。技能名ごとに1つ(FR-025)。

| フィールド | 型 | 内容 |
|---|---|---|
| `skill` | `string` | 技能名(`ParsedCheckRoll.skill` と同じ文字列) |
| `evidence` | `DiceLog` | 根拠になった判定行。同じ技能で複数該当した場合は**最初に現れた行**(FR-031) |

**成長チェック対象の決定ルール**(`collectGrowthChecks`):

入力: `DiceLog[]`、対象の名前、タブ(`""` なら全タブ)、`excludeMythosAndCredit: boolean`。

行ごとに次を**すべて**満たすとき対象。順序はこの通り(早く落とすほど安い)。

1. `log.name` が対象の名前を含む(既存 `grepDicelog` と同じ一致規則)
2. タブが `""` または `log.tab === タブ`(FR-019。タブが `""` の行は「すべて」のときのみ、FR-020)
3. `parseCheckRoll(log.content)` が `null` でない(FR-033)
4. `succeeded === true`(FR-022)
5. `diceModifier <= 0`(FR-023。ペナルティと通常は可、ボーナスは不可)
6. `skill !== ""`(FR-030)
7. `skill` のコア(先頭 `【` と末尾 `】` を外した文字列)が常時除外集合に**含まれない**(FR-026)
8. `excludeMythosAndCredit` が真のとき、コアが `クトゥルフ神話` / `信用` に**含まれない**(FR-027)

対象になった行を `skill` で重複排除し(初出を残す)、出現順で並べる。

**出力整形**(`formatGrowthChecks(name, checks)` → `string[]`):

```text
**<name>**
- 成長技能一覧
  - `<skill 1>`
  - `<skill 2>`
  …
```

`checks` が空でも名前と「- 成長技能一覧」の2行は出す(既存 `grepDicelog` の空結果と同じく
見出しだけが残る振る舞い)。

## 4. 定数(`src/constants/dicelog.ts`)

| 名前 | 値 | 用途 |
|---|---|---|
| `DICELOG_RESULT`(既存) | クリティカル / 成功 / 失敗 / ファンブル | 成功度チェックボックス(変更なし) |
| `GROWTH_CHECK_SUCCESS_RESULTS` | `["クリティカル", "イクストリーム成功", "ハード成功", "レギュラー成功", "成功"]` | `succeeded` 判定(末尾セグメントとの完全一致) |
| `GROWTH_CHECK_ALWAYS_EXCLUDED` | `STR CON DEX APP POW SIZ INT EDU アイデア 知識 幸運 正気度ロール` | ルール7 |
| `GROWTH_CHECK_OPTIONAL_EXCLUDED` | `クトゥルフ神話 信用` | ルール8 |

## 5. 画面の状態(`page.tsx`)

| 状態 | 型 | 初期値 | 更新契機 |
|---|---|---|---|
| `dicelog`(ref) | `DiceLog[]` | `[]` | ファイル読み込み |
| `nameList` | `string[]` | `[]` | ファイル読み込み(`grepCharactername`、タブによらず全体) |
| `tabList` | `string[]` | `[]` | ファイル読み込み(`grepTabnames`) |
| `fileVersion` | `number` | `0` | ファイル読み込みごとに +1(タブ `Select` の `key`、FR-018) |
| `selectName`(ref) | `string` | `""` | 名前プルダウン |
| `selectTab`(ref) | `string` | `""`(=すべて) | タブプルダウン(「すべて」選択時は `""` に戻す) |
| `checkLevelList`(ref) | `string[]` | クリティカル・成功 | 成功度チェックボックス(既存) |
| `excludeMythosAndCredit`(ref) | `boolean` | `true` | 除外チェックボックス(FR-027) |
| `resultText` | `string[]` | `[]` | 実行(`grepDicelog`) |
| `growthChecks` | `GrowthCheck[]` | `[]` | 実行(`collectGrowthChecks`)。表示は `formatGrowthChecks` と根拠行に展開 |

状態遷移はファイル読み込み → 選択 → 実行の一方向のみ。実行は何度でもやり直せる。
