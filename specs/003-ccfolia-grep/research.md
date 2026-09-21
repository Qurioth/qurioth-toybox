# Research: JSONログ対応・成長チェック一覧・タブ絞り込み

**Feature**: [spec.md](./spec.md) / **Plan**: [plan.md](./plan.md) / **Date**: 2026-09-21

Technical Context に NEEDS CLARIFICATION はなかったが、設計上の分かれ道を以下に残す。
根拠の多くは実ログ(`硝子檻の虜囚は星海にて夢を見る_log.json`、503行・ロール439件)の
観察に基づく。実ログ自体はリポジトリに含めない。

---

## R1. 入力形式の判別方法

**Decision**: ファイルの中身を前後の空白を除いて見て、`{` で始まり `JSON.parse` に成功し、
かつ `messages` が配列なら JSON、それ以外は HTML として既存の `convertDicelog` に渡す。
拡張子・MIME は見ない。

**Rationale**: CCFOLIA の JSON 書き出しは最上位が `{ "messages": [...], "images": {...} }` で
固定。HTML は `<` で始まる。既存のテストは `.txt` / `text/plain` で HTML を渡しており、
拡張子に頼ると既存の使い方を壊す。`JSON.parse` の例外は握って HTML 扱いに落とすのではなく
「解釈できない」として空配列を返す(FR-016)。

**Alternatives considered**:
- 拡張子で判別 → 上記の通り既存テスト・運用と合わない。
- 利用者に形式を選ばせる → FR-012 で明示的に禁止。

## R2. JSON のロール行をどう `content` に落とすか、構造化フラグを使うか

**Decision**: `content = text + " " + extend.roll.result`(`extend.roll` がある行のみ。
ない行は `text` のみ)。`extend.roll.success` / `critical` / `fumble` / `secret` などの
構造化フラグは**使わない**。成功度・ボーナスダイス・技能名はすべて `content` の文字列から
読む。

**Rationale**:
- HTML 書き出しではロールのコマンドと結果が半角スペース1つで並んで1つの `<span>` に入る
  (既存テスト `convert-utils.test.ts` の実例: `CC<=65　【CON】 (1D100<=65) ＞ 36 ＞ レギュラー成功`)。
  JSON 側も同じ区切りで結合すれば、後段の関数は形式を知らずに済み、SC-005(HTML/JSON で結果一致)が「同じ入力文字列を同じ関数に
  通す」ことで保証される。
- 構造化フラグを使うと HTML 用と JSON 用で成功判定の経路が2本になり、一致の検証コストが
  増える。秘匿ロール(FR-028)は「通常と同じく対象」なので `secret` を見る必要もない。
- `text` 内の改行は HTML と同様に ` / ` に置き換える(`toSingleLineContent` 相当の処理を
  プレーンテキスト版として共有する)。

**Alternatives considered**:
- JSON では `success` フラグで判定 → 上記の理由で却下。
- `DiceLog` に `roll?: {...}` を足して HTML 側でも解析して詰める → 型が太るだけで
  文字列解析は結局必要。却下。

**確認済み(実装時)**: 当初は改行と同じ ` / ` で結合する案だったが、既存テストにある HTML の
実例が半角スペース区切りだったため、実装前に半角スペースへ改めた。結合の向きは「JSON を
HTML に寄せる」で固定。

## R3. 判定行の解析(1本の正規表現)

**Decision**: `content` に対して次を1回適用する。

```text
^CC(-?\d+)?<=\d+\s*(?:[eh](?=[^a-z0-9]|$))?\s*(.*?)\s*\(1D100<=\d+\)
```

- グループ1: ボーナス/ペナルティ数(未指定なら 0)。正なら FR-023 によりチェック不可。
- グループ2: 技能名(前後空白除去のみ。`【】` は残す。空なら FR-030 により対象外)。
- 成功度は `content` の末尾セグメント(最後の `＞` 以降を trim)で判定する。
  `成功` / `レギュラー成功` / `ハード成功` / `イクストリーム成功` / `クリティカル` が成功側
  (FR-022)。`失敗` / `ファンブル` は対象外。

**Rationale**: 実ログで観測した表記は次の通りで、上記1本で全て捕まえられる。

| 実例(`text`) | グループ1 | グループ2 |
|---|---|---|
| `CC<=30 【回避】` | (なし)=0 | `【回避】` |
| `CC<=60　【DEX】`(全角空白) | 0 | `【DEX】` |
| `CC<=80h 【知識】` | 0 | `【知識】` |
| `CC<=75 h【知識】` | 0 | `【知識】` |
| `CC<=61e 操縦（ヘリコプター）`(イクストリーム指定) | 0 | `操縦（ヘリコプター）` |
| `CC<=50 EDU`(難易度指定ではない) | 0 | `EDU` |
| `CC1<=42 射撃（拳銃）（精神世界）` | 1(不可) | `射撃（拳銃）（精神世界）` |
| `CC-1<=65 【射撃（サブマシンガン）】（精神世界` | -1(可) | `【射撃（サブマシンガン）】（精神世界` |
| `CC-2<=100 射撃（拳銃）` | -2(可) | `射撃（拳銃）` |
| `CC<=292 回避`(100超) | 0 | `回避` |

`\s` は全角空白(U+3000)にもマッチする(JS の `\s` は Unicode 空白を含む)。難易度指定は
`h`(ハード)と `e`(イクストリーム)の2種で、`\s*[eh]?\s*` で位置ゆれを吸収し、技能名から外す
(同じ技能を難易度違いで振っても1つにまとめるため。実装後に HTML の実ログで `CC<=61e` /
`CC<=61h` / `CC<=91e` を確認して追加)。直後が英数字なら難易度指定ではなく技能名の頭文字
(`EDU`、`hoge`)とみなす。`CC` は大文字小文字を区別しない(`i` フラグ)。

**Alternatives considered**:
- `text` と `result` を別々に持って解析 → R2 で `content` に統合したため不要。
- 技能名の `【】` を剥がす → FR-029 で正規化しないと確定。**除外判定のときだけ**剥がした
  文字列で比較する(R4)。

## R4. 除外技能の判定

**Decision**: 技能名から先頭の `【` と末尾の `】` を外した文字列(コア)が、次の集合に
**完全一致**するときだけ除外する。

- 常時除外(FR-026): `STR` `CON` `DEX` `APP` `POW` `SIZ` `INT` `EDU` `アイデア` `知識`
  `幸運` `正気度ロール`
- 利用者選択で除外(FR-027、初期 ON): `クトゥルフ神話` `信用`

定数は `src/constants/dicelog.ts` に置く。

**Rationale**: 実ログでは `【DEX】` / `DEX`、`【正気度ロール】` / `正気度ロール` の両方が
現れる。括弧だけ外して完全一致にすれば両方を拾え、`知識` を含む別技能(例: 「図書館」は
含まないが、将来「知識（歴史）」のような自作技能)を誤って除外しない。部分一致は使わない。

**Alternatives considered**:
- 部分一致 → `幸運回復` のような文字列や自作技能を巻き込む。却下。
- 英字の特性値のみ大文字小文字を無視 → 実ログは全て大文字。YAGNI で完全一致。

## R5. タブの保持形と出力行

**Decision**: `DiceLog.tab` は角括弧なしで保持する(HTML の `[main]` → `main`、JSON の
`channelName` はそのまま)。出力行は `toOutputLine` で `[${tab}] ${name} ${content}` と
括弧を付け直す。タブが空の行は `[]` にならないよう `${name} ${content}` のみにする。

**Rationale**: FR-017「HTML / JSON で同じタブ名が同じ選択肢として現れる」ため、選択肢の
文字列は括弧なしで揃える必要がある。一方、既存の出力行 `[メイン] 名前 本文` は spec
FR-008 と既存の結合テストが期待しており、変えない。

**影響**: `grep-utils.test.ts` のサンプル(`tab: "メイン"`)に対する期待値が
`メイン アリス …` から `[メイン] アリス …` に変わる。`page.test.tsx` の期待値
(`[メイン] キャラクター太郎 …`)は変わらない。

## R6. JSON の形の検証

**Decision**: `JSON.parse` の結果に対し、`messages` が配列であること、各要素の `name` /
`text` / `channelName` が文字列(欠けていれば空文字扱い)、`extend?.roll?.result` が文字列なら
使う、という緩い型ガードを `convert-utils.ts` 内に置く。`type === "system"` の行は
`DiceLog` に**含めない**(FR-015。名前が空でも `grepCharactername` は弾くが、タブ一覧や
将来の絞り込みに混ざらないよう入口で落とす)。

**Rationale**: 外部形式は制御できない。一方で厳密なスキーマ検証ライブラリは追加依存になり
(原則1・4)、個人ツールには過剰。`images` など使わない項目は読まない。

## R7. タブ選択 UI と「すべて」

**Decision**: 既存 `Select` に `id` / `aria-label` / `defaultValue` の任意 prop を足し、
タブ用は `defaultValue="すべて"` で `["すべて", ...tabs]` を渡す。「すべて」は UI 上の
番兵で、状態としては `selectTab = ""`(空文字)を「絞り込みなし」として扱い、utils には
空文字を渡す(ラベル文字列をロジックに持ち込まない)。ファイルを読み込み直したときは
`Select` に `key`(読み込み回数)を与えて再マウントし、選択を初期値に戻す(FR-018)。

**Rationale**: 現在の `Select` は非制御(`defaultValue="default"` の hidden option)で、
2つ目の select を置くと `id="select"` が重複し、テストの `getByRole("combobox")` も曖昧に
なる。制御コンポーネント化までは不要で、`key` による再マウントが最小の変更。

**Alternatives considered**:
- `Select` を完全に制御コンポーネント化 → 既存の名前選択も書き換えることになる。今回は不要。
- `HorizontalCheckBox` でタブを複数選択 → spec で単一選択・プルダウンと確定。

## R8. 成長チェック出力と根拠行の見せ方

**Decision**: 実行ボタン1つで、既存の絞り込み結果と成長チェック一覧を同時に更新する。
成長チェック一覧は2つ目の `CopyTextBox` に
`**名前**` / `- 成長技能一覧` / `  - \`技能名\``… の形で渡す(FR-032。当初は等幅の囲みに
技能名を並べる案だったが、実装後に利用者の指定で箇条書き形式へ変更)。根拠行は
`CopyTextBox` の下に折りたたみ(`<details>`)で「技能名 — `[tab] name content`」の箇条書き
として表示する(FR-031)。コピーには含めない(spec Assumptions)。

**Rationale**: `CopyTextBox` は「文字列配列を表示してコピー」の部品として既に成立しており、
そのまま2個置くのが最小。根拠行は表示のみなので専用コンポーネントは作らず、`page.tsx` 内の
`<ul>` で足りる。

**Alternatives considered**:
- 成長チェック専用のボタン → 操作数が増え SC-004 に不利。却下。
- 根拠行を折りたたみ(`<details>`)で表示 → 件数は技能数(実ログで8件程度)なので不要。

## R9. 変更ファイル一覧(テストの置き場)

| ファイル | 変更 | テスト |
|---|---|---|
| `src/types/GrowthCheck.ts` | 新規 | — |
| `src/constants/dicelog.ts` | 成功側の表記、除外技能の集合を追加 | — |
| `src/constants/message.ts` | タブ / すべて / 成長チェック / 除外 の文言 | — |
| `src/utils/convert-utils.ts` | `parseDicelog`(形式判別)、`convertJsonDicelog`、HTML の tab 括弧除去 | `convert-utils.test.ts` |
| `src/utils/grep-utils.ts` | `grepTabnames`、`grepDicelog` にタブ引数、出力行の括弧 | `grep-utils.test.ts` |
| `src/utils/growth-check-utils.ts` | 新規: `parseCheckRoll` / `collectGrowthChecks` / `formatGrowthChecks` | `growth-check-utils.test.ts`(新規) |
| `src/components/forms/Select.tsx` | `id` / `aria-label` / `defaultValue` | (page テストで間接的に) |
| `src/app/trpg/ccfolia-grep/page.tsx` | タブ選択、除外チェック、成長チェック出力、根拠表示 | `page.test.tsx` |
