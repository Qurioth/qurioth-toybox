# Implementation Plan: シナリオ詳細画面の構造化表示

**Branch**: `structured-scenario-view` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-scenario/spec.md`(2026-10-02 の改修分。
User Story 2〜7、FR-010〜FR-029)

## Summary

シナリオ詳細画面(`/trpg/scenario/<シナリオID>`)を、本文を 1 本の長い文書として整形表示する
形から、全シナリオ共通の構造化された見せ方へ作り替える。目的は、GM がセッション中に目次で
場面・人物・エンディングへすぐ移動でき、人物の能力値や判定・正気度喪失を見落とさずに参照
できるようにすること。

技術方針として、本文は今までどおり Markdown を正とする。表示時に、記述規約(ADR-0014)の
見出しレベルと書式に沿って本文を区画に分け、章・人物・エンディングなどの構造を組み立てて
描画する([research.md](research.md) R1 / R2)。新しい依存は追加しない。

移行は `scenario-list.ts` の `structured: true` で 1 本ずつ切り替える。未移行のシナリオと
queen-of-the-sea(ビギニングアイドル)は従来の整形表示のまま残す(R5)。

## Technical Context

**Language/Version**: TypeScript 5(strict)、Node.js は `mise.toml` で固定

**Primary Dependencies**: Next.js 16(App Router)、React 19、`react-markdown` 9 + `remark-gfm` 4(既存)、
`@headlessui/react`(既存。狭い画面の目次パネル)、Tailwind CSS 3 + `@tailwindcss/typography`(既存)。
**新規依存なし**

**Storage**: リポジトリ内のファイル(`src/data/scenario/markdown/*.md`、`scenario-list.ts`)。
変更は `Scenario` 型への `structured?: true` の追加のみ

**Testing**: Vitest(jsdom)+ React Testing Library。分割関数のユニットテスト、実データの
適合テスト、詳細画面の結合テスト(ADR-0008)

**Target Platform**: Web(デスクトップと幅 375px 以上のモバイルブラウザ。ダークモード対応)

**Project Type**: Next.js Web アプリ(単一プロジェクト)

**Performance Goals**: 体感できる遅延を出さない。解釈は最大 1,847 行の文字列を行単位で 1 回
走査するだけで、サーバー側の描画時に済む

**Constraints**: 本文の文言・数値・画像・作中テキストを欠落させない(FR-028)。URL・一覧は
変えない(FR-013)。幅 375px でページの横スクロールなし(FR-014)。生 HTML は使わない(規約 7 章)

**Scale/Scope**: シナリオ 12 本(うち移行対象 11 本)、本文合計約 8,400 行。画面 1 つ
(詳細画面)の改修と、本文の段階的な手直し

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
| -- | -- | -- |
| 1. 過剰実装をしない | ✅ | 新規依存なし。解釈するのは spec の要件に必要な範囲(章・人物・ED・その他報酬・魔導書・能力値・表記)だけ。スクロールスパイ、折りたたみ、汎用の Markdown 変換基盤は作らない(R2 / R6) |
| 2. 既存の慣習に合わせる | ✅ | ページは既存の `[id]/page.tsx`(`ScenarioDetailPage`)を改修する。画面固有の部品は、一覧の `ScenarioCard.tsx` と同様に画面のディレクトリへ置く。純粋関数は `src/utils/scenario-structure-utils.ts`。`"use client"` は目次だけ。UI 文言は日本語 |
| 3. 仕様は「なぜ」を残す | ✅ | spec.md には実装方法を書いていない。データ形式の判断は本 plan と research.md に置いた |
| 4. 大きな判断は ADR に記録する | ✅(タスク化) | 本文の持ち方は後戻りにコストがかかる判断なので、ADR-0015 を追加する(R9)。データ構造の破壊的変更はない(任意項目の追加のみ) |
| 5. 小さな変更に SDD を課さない | — | 本件は SDD 対象の規模 |
| 6. テストは目的に見合う分だけ | ✅ | 網羅性(欠落 0 件)と表示の切り替えという、壊れると困る部分に絞ってテストする。カバレッジ目標は設けない |

**Post-design re-check(Phase 1 後)**: ✅ 違反なし。

- data-model の追加は表示用の派生モデルだけで、永続データの変更は `structured?: true` のみ。
- contracts は既存の記述規約の範囲内にとどめた。新しい記法は、ユーザーの要望で追加した
  読み上げ文(`> [!読み上げ]`、R10)の 1 つだけ。既存の引用記法の上に乗せており、依存は
  増やしていない。
- 例外として、能力値の段落を見出しレベルによらず検出する設計にした。既存の
  the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars で `####` の敵に `##### ステータス`
  を使っているためで、規約側の書き換えを避ける判断(data-model StatBlock)。

## Project Structure

### Documentation (this feature)

```text
specs/005-scenario/
├── spec.md              # 画面の現行仕様(一覧 + 詳細)
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 本文の持ち方・解釈方法・目次などの判断
├── data-model.md        # Phase 1: 解釈結果の構造と不変条件
├── quickstart.md        # Phase 1: 確認手順と移行手順
├── contracts/
│   ├── structured-markdown.md  # 構造化表示が前提とする本文の条件
│   └── detail-view.md          # 詳細画面の振る舞い
├── checklists/requirements.md
└── tasks.md             # Phase 2(/speckit-tasks で作成)
```

### Source Code (repository root)

```text
src/
├── app/trpg/scenario/[id]/
│   ├── page.tsx                    # 改修: structured の有無で表示を切り替える(ScenarioDetailPage)
│   ├── LegacyScenarioBody.tsx      # 新規: 現行の整形表示を切り出したもの(挙動は不変)
│   ├── StructuredScenario.tsx      # 新規: 構造化表示の全体(概要・目次・章の並び)
│   ├── StructuredScenario.test.tsx # 新規: 結合テスト(contracts/detail-view.md)
│   ├── ScenarioOverview.tsx        # 新規: 冒頭の概要
│   ├── ScenarioToc.tsx             # 新規: 目次("use client"。lg 以上は sticky、未満はパネル)
│   ├── ScenarioCharacter.tsx       # 新規: 人物カード
│   ├── ScenarioEnding.tsx          # 新規: エンディング・その他報酬
│   ├── ScenarioTome.tsx            # 新規: 魔導書・アーティファクト
│   ├── ScenarioMarkdown.tsx        # 新規: 区画の Markdown 描画(判定・正気度・呪文・能力値・作中テキスト・セリフ・読み上げ文の components)
│   └── StatGrid.tsx                # 新規: 能力値の格子
├── utils/
│   ├── scenario-structure-utils.ts      # 新規: 見出しによる分割・種別判定・能力値/表記の解釈・目次生成・id 採番
│   └── scenario-structure-utils.test.ts # 新規: ユニットテスト(網羅性の不変条件を含む)
└── data/scenario/
    ├── scenario-list.ts            # 改修: Scenario 型に structured?: true、移行済みに付与
    ├── scenario-list.test.ts       # 新規: データ適合テスト(全本文の網羅性、structured の適合)
    ├── README.md                   # 改修: 1 章に structured、4 章に読み上げ文、7 章に構造化表示での扱い
    ├── template.md                 # 改修: 場面の雛形に読み上げ文の書き方をコメントで添える
    └── markdown/*.md               # 移行のたびに contracts/structured-markdown.md に合わせて整える

docs/adr/0015-structure-scenario-markdown-for-display.md  # 新規
CLAUDE.md                                                   # 改修: シナリオデータ節に 1〜2 行
```

**Structure Decision**: 単一の Next.js プロジェクト構成を維持する。

- 詳細画面専用の部品は `src/app/trpg/scenario/[id]/` に置く。一覧専用の部品を
  `src/app/trpg/scenario/` に置いている現行の慣習に合わせた。他画面で再利用する予定はなく、
  `src/components/` には出さない(原則1)。
- 解釈ロジックは純粋関数として `src/utils/` に置き、ユニットテストを同じ場所に置く。
- 部品名は `src/components/CharacterCard.tsx`(キャラクターシート用)と衝突しないよう、
  `Scenario` を接頭辞にする。

## 実装の段階

tasks.md を作る際の目安。各段階の終わりでテストと画面確認ができる。

1. **土台(US7 の切り替え)**: `structured` の追加、`LegacyScenarioBody` の切り出し、
   page.tsx での分岐。この時点では全シナリオが従来表示のままで、見た目は変わらない。
2. **解釈(US2)**: `scenario-structure-utils.ts` の分割・種別判定と網羅性テスト。
   全 12 本で網羅性テストを通す。
3. **構造化表示の骨組み(US2 / US3)**: 概要・章の並び・目次・id と `scroll-margin-top`。
4. **人物カードと能力値(US4)**、**表記の強調(US5)**、**作中テキスト・セリフ・読み上げ文・
   魔導書・エンディング(US6)**。読み上げ文は既存本文で使われていないので、結合テストの
   テスト用本文で表示を確かめる(R10)。
5. **パイロット移行**: 1 本目として parasite(386 行)を移行する。神話生物・魔導書・呪文・
   アーティファクト(`#####`)・ED・その他報酬・規約からのずれ(`## シナリオ終了報酬`)が
   そろっていて、表示の確認範囲が広いわりに短いため。quickstart 2 章の全項目を確かめる。
6. **記録**: ADR-0015、README.md、CLAUDE.md の更新。
7. **残り 10 本の移行**: 1 本ずつ(順序はオーナーが決める。spec Assumptions)。各移行は
   quickstart 3 章の手順で行う。tasks.md には 1 本 = 1 タスクとして並べる。

## Complexity Tracking

Constitution Check に違反はないため、記載なし。
