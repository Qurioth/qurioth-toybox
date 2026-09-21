# Contract: ログ変換(`src/utils/convert-utils.ts`)

ファイルの中身(文字列)を `DiceLog[]` に変換する純粋関数群。画面はこの入口だけを呼ぶ。

## `parseDicelog(raw: string): DiceLog[]`

形式を自動判別して変換する(R1)。

| 入力 | 出力 |
|---|---|
| CCFOLIA の HTML 書き出し | `convertDicelog(raw)` の結果 |
| CCFOLIA の JSON 書き出し(`{ "messages": [...] }`) | `convertJsonDicelog(parsed)` の結果 |
| `{` で始まるが JSON として読めない / `messages` が配列でない | `[]` |
| 空文字 | `[]` |

例外を投げない。

## `convertDicelog(htmlString: string): DiceLog[]`(既存・変更)

- 変更点: `tab` から角括弧を外す(`[main]` → `main`)。それ以外の振る舞いは現状維持。

## `convertJsonDicelog(json: unknown): DiceLog[]`

`messages` の各要素を1行に変換する。詳細は [data-model.md](../data-model.md) §1。

| `messages[i]` | 出力 |
|---|---|
| `{ name: "A", text: "こんにちは", channelName: "main", type: "text" }` | `{ tab: "main", name: "A", content: "こんにちは" }` |
| `{ name: "A", text: "CC<=30 【回避】", channelName: "main", type: "text", extend: { roll: { result: "(1D100<=30) ボーナス・ペナルティダイス[0] ＞ 88 ＞ 88 ＞ 失敗" } } }` | `{ tab: "main", name: "A", content: "CC<=30 【回避】 (1D100<=30) ボーナス・ペナルティダイス[0] ＞ 88 ＞ 88 ＞ 失敗" }` |
| `{ name: "A", text: "1行目\n2行目", channelName: "other", type: "text" }` | `{ tab: "other", name: "A", content: "1行目 / 2行目" }` |
| `{ name: "", text: "[ A ] SAN : 45 → 44", channelName: "main", type: "system" }` | (生成しない) |
| `name` / `channelName` が文字列でない | 該当フィールドは `""` |
