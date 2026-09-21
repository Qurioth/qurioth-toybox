# Contract: 成長チェック(`src/utils/growth-check-utils.ts`)と絞り込み(`src/utils/grep-utils.ts`)

## `parseCheckRoll(content: string): ParsedCheckRoll | null`

| `content` | 出力 |
|---|---|
| `CC<=65 【目星】 (1D100<=65) ボーナス・ペナルティダイス[0] ＞ 13 ＞ 13 ＞ イクストリーム成功` | `{ diceModifier: 0, skill: "【目星】", succeeded: true }` |
| `CC<=60　【DEX】 (1D100<=60) … ＞ 52 ＞ 52 ＞ レギュラー成功`(全角空白) | `{ diceModifier: 0, skill: "【DEX】", succeeded: true }` |
| `CC<=80h 【知識】 (1D100<=40) … ＞ 35 ＞ 35 ＞ 成功` | `{ diceModifier: 0, skill: "【知識】", succeeded: true }` |
| `CC<=75 h【知識】 (1D100<=75) … ＞ 99 ＞ 99 ＞ 失敗` | `{ diceModifier: 0, skill: "【知識】", succeeded: false }` |
| `CC1<=42 射撃（拳銃） (1D100<=42) ボーナス・ペナルティダイス[1] ＞ 57, 47 ＞ 47 ＞ 失敗` | `{ diceModifier: 1, skill: "射撃（拳銃）", succeeded: false }` |
| `CC-1<=65 【射撃（サブマシンガン）】（精神世界 (1D100<=65) ボーナス・ペナルティダイス[-1] ＞ 42, 12 ＞ 42 ＞ レギュラー成功` | `{ diceModifier: -1, skill: "【射撃（サブマシンガン）】（精神世界", succeeded: true }` |
| `CC<=50 (1D100<=50) … ＞ 10 ＞ 10 ＞ ハード成功`(技能名なし) | `{ diceModifier: 0, skill: "", succeeded: true }` |
| `CC<=30 【回避】 (1D100<=30) … ＞ 100 ＞ 100 ＞ ファンブル` | `{ diceModifier: 0, skill: "【回避】", succeeded: false }` |
| `1d100<=50 → 23 成功`(`CC` 系でない) | `null` |
| `1D10 回避 / (1D10) ＞ 3` | `null` |
| `こんにちは` | `null` |

## `collectGrowthChecks(logs, selectName, selectTab, options): GrowthCheck[]`

- `selectTab: ""` は全タブ。`options.excludeMythosAndCredit: boolean`。
- 判定ルールは [data-model.md](../data-model.md) §3 の 1〜8。
- 戻り値は `skill` で重複なし、出現順、各件の `evidence` は初出の行。

代表ケース:

| 状況 | 結果 |
|---|---|
| 同じ技能で成功が2回 | 1件。`evidence` は1回目 |
| 同じ技能でボーナスあり成功 → ボーナスなし成功 | 1件。`evidence` はボーナスなしの行 |
| 同じ技能でボーナスあり成功のみ | 0件 |
| 成功と失敗が混在 | 1件 |
| `【DEX】` / `DEX` / `正気度ロール` / `【アイデア】` の成功 | 0件 |
| `【クトゥルフ神話】` の成功、`excludeMythosAndCredit: true` | 0件 |
| 同上、`excludeMythosAndCredit: false` | 1件 |
| 選んだタブに対象の名前の行がない | `[]` |
| `tab: ""` の行、`selectTab: ""` | 対象 |
| `tab: ""` の行、`selectTab: "main"` | 対象外 |

## `formatGrowthChecks(selectName, checks): string[]`

```text
["**呼子 星華**", "- 成長技能一覧", "  - `【医学】`", "  - `【応急手当】`"]
```

1行目は `**${selectName}**`、2行目は `- 成長技能一覧`、以降は技能名ごとに
`  - \`技能名\``(半角スペース2つでインデントした入れ子の箇条書き)。
`checks` が空なら `["**名前**", "- 成長技能一覧"]`。

## `grepTabnames(logs): string[]`

`tab` を重複なく、空文字を除き、ソートして返す(`grepCharactername` と同じ規則)。

## `grepDicelog(logs, selectName, checkLevelList, selectTab = ""): string[]`(既存・変更)

- 追加引数 `selectTab`。`""` なら従来通り、指定時はそのタブの行だけ。
- 出力行は `[${tab}] ${name} ${content}`。`tab` が空なら `${name} ${content}`。
