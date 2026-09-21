# Implementation Plan: JSONログ対応・成長チェック一覧・タブ絞り込み

**Feature**: `003-ccfolia-grep` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ccfolia-grep/spec.md`

**対象画面**: `/trpg/ccfolia-grep`

## Summary

`/trpg/ccfolia-grep` に (1) CCFOLIA の JSON 形式ログの読み込み、(2) クトゥルフ神話TRPG(7版)の
成長チェック一覧、(3) タブ(チャンネル)による絞り込み、の3つを足す。

技術的な要は3つ。

1. **入力形式の差は変換の入口で吸収し、以降は既存の `DiceLog`(tab / name / content)1本で扱う**。
   JSON のロール行はコマンド(`text`)と結果(`extend.roll.result`)を、HTML 変換が `<br>` を
   潰すときと同じ区切り(` / `)で結合して `content` にする。これで HTML / JSON のどちらから
   来ても後段(名前一覧・絞り込み・成長チェック)は同じ文字列を見ることになり、SC-005
   (両形式で結果一致)が構造的に満たされる。JSON にある `success` / `critical` などの構造化
   フラグは**使わない**(使うと HTML 側だけ別ロジックになり、一致の保証が崩れる)。
   詳細は [research.md](./research.md) R1・R2。
2. **成長チェックは `content` の文字列解析だけで判定する純粋関数にする**。判定行の解析
   (`CC` 直後のボーナス/ペナルティ数、難易度 `h`、技能名、末尾の成功度)を1つの正規表現に
   まとめ、ルール(FR-022〜030)は解析結果に対する小さな述語の集まりとして
   `src/utils/growth-check-utils.ts` に置く。テストはここに集中させる(R3・R4)。
3. **タブは HTML 側で角括弧を外して保持し、出力時に付け直す**。JSON の `channelName` は
   角括弧を持たないため、保持形を「括弧なし」に揃えないと FR-017(両形式で同じタブ名)が
   満たせない。既存の出力行 `[タブ] 名前 本文` は出力整形側で括弧を付けて維持する(R5)。

## Technical Context

**Language/Version**: TypeScript 5(strict) / Node.js 24([mise.toml](../../mise.toml))

**Primary Dependencies**: Next.js 16(App Router) / React 19 / Tailwind CSS 3 + clsx +
tailwind-merge / react-icons(コピーアイコン、既存)。**追加依存なし**。JSON の解釈は
標準の `JSON.parse`。

**Storage**: N/A。ログはブラウザ内でのみ扱い、保存・送信しない(spec Assumptions)。

**Testing**: Vitest 4(`environment: "jsdom"`) + React Testing Library。テスティングトロフィー
(ADR-0008)に従い、画面の結合テスト(`page.test.tsx`)を主軸に、変換・解析・判定の純粋関数に
ユニットテストを添える。

**Target Platform**: モダンブラウザ(`FileReader` / `navigator.clipboard` は既存機能で使用済み)。

**Project Type**: 単一の Next.js アプリ(フロントエンドのみ)。

**Performance Goals**: 新たな目標なし。実ログ(1セッション約500行・2.5MB の JSON)を
読み込んで体感遅延がないこと(SC-003)。全処理は配列の1〜2パスで済む。

**Constraints**:

- CCFOLIA の書き出し形式(HTML の `<p><span> [tab]</span><span>name</span> :<span>…</span></p>`、
  JSON の `messages[].{name,text,channelName,type,extend.roll.result}`)は制御できない。
  境界で形を検証してから使う(R6)。
- 判定コマンドの表記ゆれ(`CC<=80h`、`CC<=75 h【知識】`、全角スペース、閉じ括弧欠落)は
  実ログで確認済み。技能名は正規化しない(FR-029)。
- 既存の出力(`**名前**` + コードブロック)と既存テストの期待値は維持する。

**Scale/Scope**: 画面1つ。変更対象はソース6ファイル前後(型1・定数2・utils 3・
コンポーネント1・ページ1)とそのテスト。

## Constitution Check

*GATE: Phase 0 の前に判定し、Phase 1 の設計後に再判定する。*

| 原則 | 判定(Phase 0前) | 判定(Phase 1後) | 根拠 |
|---|---|---|---|
| 1. 過剰実装をしない(YAGNI) | Pass | Pass | 形式判別は「JSON として読めて `messages` 配列があるか」だけ。パーサー登録機構・他ツール形式・技能名の正規化辞書は作らない。JSON の構造化フラグも使わない(R2) |
| 2. 既存の慣習に合わせる | Pass | Pass | 純粋関数は `src/utils/<用途>-utils.ts`、定数は `src/constants/dicelog.ts` / `message.ts`、テストはコロケーション、UI文言は日本語、フォーム部品は `src/components/forms/` の既存物を拡張 |
| 3. 仕様は「なぜ」を残す | Pass | Pass | spec を先に更新済み(FR-012〜033)。本ファイルには実装方針のみ |
| 4. 大きな判断はADRに記録する | Pass | Pass | 依存追加なし、保存形式なし、外部契約の変更なし。ADR不要(下記) |
| 5. 小さな変更にSDDを課さない | Pass | Pass | 本件はSDDの対象(入力形式・出力・操作が増えるまとまった変更) |
| 6. テストは目的に見合う分だけ | Pass | Pass | 既存テスト3ファイルの延長 + 新規 utils のテスト1ファイル。フィクスチャは小さな手書きサンプルで、実ログは**コミットしない**(個人のセッション記録のため) |

**原則4についての判断**: `DiceLog` 型の形(tab / name / content)は変えず、タブの保持形が
「`[main]`」から「`main`」に変わるだけ。画面内部に閉じた変更で、保存されるデータも外部との
契約もない。ADRは書かず、理由は [research.md](./research.md) R5 と実装コメントに残す。

**原則1についての判断**(成長チェック用の型を足すことは過剰か): 判定行の解析結果
(`ParsedCheckRoll`)と一覧の1件(`GrowthCheck`)の2型を足す。前者は「解析」と「ルール判定」を
分けてテストしやすくするため、後者は「技能名 + 根拠行」を画面に渡すために必要。いずれも
今回の要件(FR-029〜031)から直接要る最小限で、将来のための抽象化ではない。

## Project Structure

### Documentation (this feature)

```text
specs/003-ccfolia-grep/
├── spec.md              # 現行仕様(2026-09-21 更新済み)
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 設計判断と根拠
├── data-model.md        # Phase 1: 型と変換・判定ルール
├── quickstart.md        # Phase 1: 動作確認手順
├── contracts/
│   ├── log-conversion.md     # ログ変換関数の入出力契約
│   ├── growth-check.md       # 成長チェック関数の入出力契約
│   └── page-ui.md            # 画面の操作・表示契約
├── checklists/requirements.md
└── tasks.md             # Phase 2(/speckit-tasks で生成)
```

### Source Code (repository root)

```text
src/
├── app/trpg/ccfolia-grep/
│   ├── page.tsx                  # 変更: タブ選択・除外チェック・成長チェック出力と根拠表示を追加
│   └── page.test.tsx             # 変更: JSON読み込み / タブ絞り込み / 成長チェックの結合テスト
├── components/
│   ├── CopyTextBox.tsx           # 変更なし(成長チェック出力にもそのまま使う)
│   └── forms/
│       ├── Select.tsx            # 変更: id / aria-label / defaultValue を受け取れるようにする
│       └── HorizontalCheckBox.tsx# 変更なし(除外チェックボックスにも流用)
├── constants/
│   ├── dicelog.ts                # 変更: 成長チェックの除外技能・成功側の表記を追加
│   └── message.ts                # 変更: タブ / すべて / 成長チェック / 除外 の文言を追加
├── types/
│   ├── DiceLog.ts                # 変更なし(tab は括弧なしで保持する旨をコメント)
│   └── GrowthCheck.ts            # 新規: ParsedCheckRoll / GrowthCheck
└── utils/
    ├── convert-utils.ts          # 変更: parseDicelog(形式判別) / convertJsonDicelog を追加、
    │                             #       HTML 側の tab から角括弧を外す
    ├── convert-utils.test.ts     # 変更: JSON変換・形式判別・不正入力のテスト
    ├── grep-utils.ts             # 変更: grepTabnames を追加、grepDicelog にタブ引数、
    │                             #       出力行で [tab] を付け直す
    ├── grep-utils.test.ts        # 変更: タブ絞り込みのテスト、出力行の期待値更新
    ├── growth-check-utils.ts     # 新規: parseCheckRoll / collectGrowthChecks / formatGrowthChecks
    └── growth-check-utils.test.ts# 新規
```

**Structure Decision**: 既存の1画面構成に沿い、新しいディレクトリは作らない。ロジックは
すべて `src/utils/` の純粋関数に置き、`page.tsx` は入力の状態管理と関数の呼び出しに徹する
(現状の `convertDicelog` → `grepCharactername` → `grepDicelog` の流れをそのまま延長する)。

## Complexity Tracking

Constitution Check に違反なし。記載事項なし。
