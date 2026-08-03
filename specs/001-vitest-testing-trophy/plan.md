# Implementation Plan: テスティングトロフィー戦略に基づくテスト基盤の導入

**Branch**: `001-vitest-testing-trophy` | **Date**: 2026-07-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-vitest-testing-trophy/spec.md`

## Summary

リファクタリングを安全に行うための回帰検知の仕組みとして、テスティングトロフィー戦略に
基づくテスト基盤を導入する。既存の複雑なロジックを持つユーティリティ関数
(`grep-utils.ts`、`convert-utils.ts`)にユニットテストを、状態を持つコンポーネント
(`CharacterCard`、`ccfolia-grep`ページ)に結合テストを追加し、CIで自動実行する。
技術選定(Vitest / jsdom / React Testing Library)は
[ADR-0008](../../docs/adr/0008-adopt-testing-trophy-and-vitest.md) で決定済み。詳細な
比較検討は [research.md](research.md) を参照。

## Technical Context

**Language/Version**: TypeScript 5 (strict)、Node.js 22(CIと同じバージョン)

**Primary Dependencies**: `vitest`、`@vitejs/plugin-react`、`jsdom`、
`@testing-library/react`、`@testing-library/jest-dom`、`@testing-library/user-event`
(いずれもADR-0008で決定済み)

**Storage**: N/A(テスト基盤自体はデータストアを持たない)

**Testing**: Vitest(本feature自体がテストランナーの導入)

**Target Platform**: Web(Next.js 16 App Router。ブラウザ実行環境はjsdomでシミュレートする)

**Project Type**: Web application(単一のNext.jsプロジェクト。フロントエンド/バックエンドの
分離は無い)

**Performance Goals**: 特に設定しない。個人開発のテストスイートとして、ローカル・CIともに
実行時間が数秒〜十数秒程度に収まる規模を想定する(spec.mdの通り数値目標は設定しない)。

**Constraints**: 個人開発のスコープに見合わない重厚なテスト基盤にしない
(constitution.md 原則6)。既存コードの実装自体(ロジック・UI)は変更しない(spec.md
Assumptions)。

**Scale/Scope**: 対象は `grep-utils.ts` / `convert-utils.ts` / `CharacterCard` /
`ccfolia-grep` ページの4箇所に限定する(spec.md Assumptions)。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 備考 |
| --- | --- | --- |
| 1. 過剰実装をしない(YAGNI) | PASS | 対象を4箇所に限定、カバレッジ数値目標なし、E2Eは見送り |
| 2. 既存の慣習に合わせる | PASS | `@/*` パスエイリアスを踏襲。コロケーション配置は新しい慣習だが、既存の慣習と矛盾しない |
| 3. 仕様は「なぜ」を残す | PASS | spec.mdに背景・受け入れ条件、plan.mdに技術方針を分離 |
| 4. 大きな判断はADRに | PASS | ADR-0008に技術選定を記録済み |
| 5. 小さな変更にはSDDを課さない | N/A | 本feature自体が「まとまった変更」としてSDD適用対象 |
| 6. テストは目的に見合う分だけ書く | PASS | 対象4箇所のみ、カバレッジ数値目標なし、E2E・ビジュアルリグレッションは対象外 |

違反なし。Complexity Trackingへの記載は不要。

*(Phase 1設計後の再チェック: 下記「Project Structure」の内容はConstitution Checkの結論を
変えるものではないため、再チェックの結果もPASSのまま変わらず)*

## Project Structure

### Documentation (this feature)

```text
specs/001-vitest-testing-trophy/
├── spec.md               # 完了(/speckit-specify)
├── checklists/
│   └── requirements.md   # 完了
├── plan.md               # 本ファイル(/speckit-plan)
├── research.md           # 完了(/speckit-plan Phase 0)
├── quickstart.md         # 完了(/speckit-plan Phase 1)
└── tasks.md              # 未作成(/speckit-tasks で作成)
```

`data-model.md` と `contracts/` は本featureに新規データエンティティ・外部インターフェースが
無いため作成しない。

### Source Code (repository root)

Single project(Next.js App Router)構成。新規に追加するファイルは以下の通り。

```text
vitest.config.ts               # 新規: environment: "jsdom", @/* エイリアス, setupFiles
vitest.setup.ts                # 新規: jest-dom, next/imageモック, ResizeObserverスタブ

src/
  utils/
    grep-utils.ts
    grep-utils.test.ts          # 新規(コロケーション)
    convert-utils.ts
    convert-utils.test.ts       # 新規(コロケーション)
  components/
    CharacterCard.tsx
    CharacterCard.test.tsx      # 新規(コロケーション)
  app/trpg/ccfolia-grep/
    page.tsx
    page.test.tsx                # 新規(コロケーション)

.github/workflows/ci.yml         # 変更: Lint と Build の間に Test ステップを追加
package.json                     # 変更: devDependencies追加、"test": "vitest run" スクリプト追加
CLAUDE.md                        # 変更: テスト方針・実行コマンドを追記
```

**Structure Decision**: 既存のディレクトリ構成(`src/utils/`、`src/components/`、
`src/app/`)をそのまま使い、`tests/` のような別ツリーは作らない。テストファイルは対象と
同じディレクトリに `*.test.ts(x)` としてコロケーション配置する(research.md参照)。
Vitest本体の設定ファイル(`vitest.config.ts`・`vitest.setup.ts`)のみリポジトリルートに
新規追加する。

## Complexity Tracking

*(Constitution Checkに違反なしのため、本セクションは空)*
