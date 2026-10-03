# Implementation Plan: シナリオごとの専用ページ

**Branch**: `structured-scenario-view` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-scenario/spec.md`(2026-10-03 の方針転換。
User Story 2〜8、FR-010〜FR-033)

## Summary

シナリオ詳細画面を、シナリオ1本ごとの専用ページで作り込めるようにする。2026-10-02 に作った
「全シナリオ共通の構造化表示」は取りやめ、その部品を共通の部品集に作り直す。

**技術方針**

- **専用ページの形式**:シナリオごとに `src/scenarios/<slug>/` を作り、本文は MDX(`@next/mdx`)、
  外枠と配色は TSX、NPC は型付きのデータで持つ(research R1・R6)。
- **登録と表示の切り替え**:詳細画面は `scenario-list.ts` の `page` を動的に読み込んで描画する。
  専用ページが無いシナリオは、従来の整形表示のまま(R2)。
- **追加する機能**:CCFOLIA の Clipboard API (beta) 形式でのコマのコピー(R9)、`mermaid` による
  フローチャート(R8)、拡大できる図(R7)。
- **下書きの生成**:既存の本文 Markdown から専用ページの下書きを作る(R10)。

## Technical Context

**Language/Version**: TypeScript 5(strict)、Node.js 24(`mise.toml`。下書き生成のスクリプトは
Node の型の除去でそのまま実行する)

**Primary Dependencies**:

- 既存:Next.js 16(App Router / Turbopack)、React 19、`react-markdown` 9 + `remark-gfm` 4
  (従来表示)、`@headlessui/react`(目次パネル・図の拡大)、Tailwind CSS 3 + `@tailwindcss/typography`
- **追加**:`@next/mdx`、`@mdx-js/loader`、`@mdx-js/react`、`@types/mdx`、`mermaid`
- **追加(dev)**:`@mdx-js/mdx`(下書きが MDX としてコンパイルできるかのテストに使う)

**Storage**: リポジトリ内のファイル。

- 移行済み:`src/scenarios/<slug>/`(`index.tsx` / `content.mdx` / `npcs.ts`)
- 未移行:`src/data/scenario/markdown/<slug>.md`
- 共通:登録は `scenario-list.ts`

**Testing**: Vitest(jsdom)+ React Testing Library。

- ユニットテスト:コマの変換、下書きの変換
- 部品の結合テスト
- データのテスト:登録、全 12 本の下書き
- `mermaid` はテストでモックする

**Target Platform**: Web(デスクトップと幅 375px 以上のモバイルブラウザ。ダークモード対応)

**Project Type**: Next.js Web アプリ(単一プロジェクト)

**Performance Goals**: 体感できる遅延を出さない。

- MDX はビルド時にコンパイルする。
- 専用ページは動的 import で、開いたシナリオの分だけ読み込む。
- `mermaid` は図のあるページでだけ、クライアントで読み込む。

**Constraints**:

- URL・一覧は変えない(FR-013)。
- 権利表記・タブ名は詳細画面で一括して付ける(FR-011 / FR-012)。
- 移行で文言・数値・画像を欠落させない(FR-032 / FR-033)。
- 幅 375px でページの横スクロールなし(FR-014)。
- コマに画像は含めない(FR-028)。

**Scale/Scope**:

- シナリオ 12 本、本文約 8,400 行。
- 作るもの:部品 10 種、下書き生成 1 本、詳細画面の改修。
- 各シナリオのデザインと移行はオーナーが 1 本ずつ行う(この plan の範囲外。パイロットのみ扱う)。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
| -- | -- | -- |
| 1. 過剰実装をしない | ✅ | 依存の追加(MDX、mermaid)は spec の要求(自由なデザイン、フローチャート)に直結する。目次は DOM から集め、独自の remark プラグインは作らない。コマの画像の保存ボタンなど、合意していない機能は作らない |
| 2. 既存の慣習に合わせる | ✅ | 部品は `src/components/scenario/` に用途別にまとめる(R3)。NPC の型は `src/types/`、純粋関数は `src/utils/*-utils.ts`。詳細画面のページ名 `ScenarioDetailPage` は維持。`"use client"` は目次・コピー・図の拡大・フローチャートだけ。UI 文言は日本語 |
| 3. 仕様は「なぜ」を残す | ✅ | 方針転換は spec を先に書き換えた(2026-10-03)。plan 作成中に分かった CCFOLIA の制約(画像を設定できない)も、オーナーと確認して spec を先に直した |
| 4. 大きな判断は ADR に記録する | ✅(タスク化) | 本文の持ち方を変え、依存を増やすので ADR-0016 を追加し、ADR-0015 を Superseded にする(R11) |
| 5. 小さな変更に SDD を課さない | — | 本件は SDD 対象の規模 |
| 6. テストは目的に見合う分だけ | ✅ | 壊れると困るところに絞る。カバレッジ目標は設けない。テストする範囲は次の3つ。 |
| | | ・コマの JSON(外部サービスとの約束) |
| | | ・下書きで欠落が出ないこと |
| | | ・部品の振る舞い |

**Post-design re-check(Phase 1 後)**: ✅ 違反なし。

- 2026-10-02 版の部品・解析処理は、捨てずに部品集と下書き生成に転用する。新しく書く量を抑えられる。
- 構造化表示の切り替え(`structured`)・`StructuredScenario`・読み上げ文の目印(`[!読み上げ]`)は、
  使わなくなるので削除する。残すと、使われないコードと記法が残る(原則1)。

## Project Structure

### Documentation (this feature)

```text
specs/005-scenario/
├── spec.md              # 画面の現行仕様(一覧 + 詳細)
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 形式・登録・部品・目次・配色・NPC データ・画像・図・コマ・下書き
├── data-model.md        # Phase 1: 登録、専用ページ、NPC データ、コマ、下書きへの変換
├── quickstart.md        # Phase 1: 確認手順、CCFOLIA での確認、1 本の移行手順
├── contracts/
│   ├── detail-view.md   # 詳細画面の振る舞い
│   ├── mdx-page.md      # 専用ページの書き方と部品
│   └── ccfolia-koma.md  # コマの JSON
├── checklists/requirements.md
└── tasks.md             # Phase 2(/speckit-tasks で作り直す)
```

### Source Code (repository root)

```text
next.config.mjs                         # 改修: createMDX(@next/mdx)、remark-gfm
tsconfig.json                           # 改修: allowImportingTsExtensions
package.json                            # 改修: 依存の追加、"scenario:draft" スクリプト
scripts/
└── create-scenario-draft.ts            # 新規: 下書きの書き出し(ファイル入出力と登録方法の表示だけ)
src/
├── mdx-components.tsx                  # 新規: Markdown の要素の既定の見た目 + 部品の登録
├── app/trpg/scenario/[id]/
│   ├── page.tsx                        # 改修: page があれば専用ページ、なければ従来表示。権利表記・タブ名
│   ├── LegacyScenarioBody.tsx(+test)   # 既存のまま
│   └── (StructuredScenario / ScenarioMarkdown / ScenarioToc など)  # 削除(部品集へ移す)
├── components/scenario/                # 新規: 部品集(contracts/mdx-page.md 3 章)
│   ├── ScenarioPage.tsx                # 外枠: 配色の CSS 変数、data-scenario-body、登録情報の受け渡し
│   ├── ScenarioOverview.tsx
│   ├── ScenarioToc.tsx                 # "use client"。DOM から見出しを集める
│   ├── NpcCard.tsx / CopyKomaButton.tsx  # コピーは "use client"
│   ├── StatGrid.tsx
│   ├── Notation.tsx                    # strong / p / li / td 用の強調(判定・正気度・呪文など)
│   ├── ReadAloud.tsx / Ending.tsx / Reward.tsx / Tome.tsx
│   ├── Figure.tsx                      # "use client"(拡大のダイアログ)
│   ├── Flowchart.tsx                   # "use client"(mermaid を動的 import)
│   └── *.test.tsx                      # 部品ごとの結合テスト
├── scenarios/
│   ├── README.md                       # 新規: 専用ページの作り方
│   └── <slug>/{index.tsx, content.mdx, npcs.ts}   # 移行したシナリオごと(パイロットのみ本 plan で作る)
├── types/scenario-npc.ts               # 新規: ScenarioNpc など
├── utils/
│   ├── scenario-structure-utils.ts(+test)  # 既存: 下書き生成と表記の分類で引き続き使う
│   ├── ccfolia-koma-utils.ts(+test)    # 新規: NPC → コマの JSON
│   └── scenario-draft-utils.ts(+test)  # 新規: 本文 → 下書き(全 12 本の欠落・コンパイルのテストを含む)
└── data/scenario/
    ├── scenario-list.ts(+test)         # 改修: page / markdown 任意 / structured 削除
    ├── README.md                       # 改修: 構造化表示の節を削除し、専用ページへの案内
    └── template.md                     # 改修: 読み上げ文の目印のコメントを削除

docs/adr/0016-scenario-pages-with-mdx.md    # 新規。0015 は Superseded に
CLAUDE.md                                   # 改修: シナリオデータの節
```

**Structure Decision**: 単一の Next.js プロジェクトのまま。

- **シナリオの中身** は `src/scenarios/<slug>/` に置き、app のルート構造と分ける(R1)。
- **部品** は、複数のページから使うので `src/components/scenario/` に置く(R3)。

## 実装の段階

tasks.md を作る際の目安。

1. **土台**
   - 依存を追加し、`next.config.mjs` に MDX を組み込む。`mdx-components.tsx` の空の雛形も置く。
   - `scenario-list.ts` の型を変える(`page` を足し、`markdown` を任意にし、`structured` を消す)。
   - 11 本の `structured: true` を外し、構造化表示の部品を詳細画面から外す。
   - この時点では全シナリオが従来表示になる。
2. **詳細画面の切り替え(US2・US8)**
   - `page` があれば専用ページを描画する。権利表記・タブ名・登録情報の受け渡しも、ここで担う。
   - 確認にはテスト用の小さな専用ページを使う。テスト内でだけ登録する。
3. **部品集(US3)**
   - 2026-10-02 版の部品を `src/components/scenario/` に移し、MDX から使える形にする。
   - 移すもの:目次、NpcCard、StatGrid、強調、ReadAloud、Ending、Reward、Tome、Overview、ScenarioPage。
   - `mdx-components.tsx` の要素マッピングも、この段階で作る。
4. **NPC データと CCFOLIA(US4)**:`ScenarioNpc` 型、`toCcfoliaKoma`、「CCFOLIA にコピー」ボタン。
5. **画像(US5)**:NpcCard の立ち絵を切り抜かない表示にし、`Figure` に拡大を付ける。
6. **フローチャート(US6)**:`Flowchart` と、` ```mermaid ` の対応。
7. **下書きの生成(US7)**
   - `scenario-draft-utils.ts` と `pnpm scenario:draft` を作る。
   - テストで、全 12 本の下書きがコンパイルでき、欠落がないことを確かめる。
8. **パイロット**
   - parasite の下書きを作って登録し、下書きのまま表示して 1〜7 を通しで確かめる。
   - CCFOLIA への貼り付けは、オーナーが確かめる。
   - パイロットのページは、デザインを作り込む前の下書きのまま公開する。オーナーの判断で、
     登録を戻してもよい。
9. **記録**
   - ADR-0016 を書き、ADR-0015 を Superseded にする。
   - `src/scenarios/README.md`・`src/data/scenario/README.md`・template.md・CLAUDE.md を更新する。

## Complexity Tracking

Constitution Check に違反はないため、記載なし。
