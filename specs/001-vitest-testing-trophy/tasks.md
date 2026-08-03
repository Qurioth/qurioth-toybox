---

description: "Task list for テスティングトロフィー戦略に基づくテスト基盤の導入"
---

# Tasks: テスティングトロフィー戦略に基づくテスト基盤の導入

**Input**: Design documents from `/specs/001-vitest-testing-trophy/`

**Prerequisites**: [plan.md](plan.md)、[spec.md](spec.md)、[research.md](research.md)、
[quickstart.md](quickstart.md)(`data-model.md`・`contracts/`は本featureに該当なしのため無し)

**Note**: 本feature自体が「テストを追加すること」を目的とするため、通常の
「実装 + そのテスト」という区別は無い。各ユーザーストーリーの Implementation タスクが、
そのままテストコードの作成タスクになる。

**Organization**: タスクはspec.mdのユーザーストーリー(P1〜P3)ごとにグループ化し、
それぞれ独立して完了・検証できるようにする。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実施可能(別ファイル・依存関係なし)
- **[Story]**: 対応するユーザーストーリー(US1、US2、US3)
- 各タスクに具体的なファイルパスを含める

## Path Conventions

Single project(Next.js App Router)。既存の `src/utils/`、`src/components/`、`src/app/`
配下にテストファイルをコロケーション配置する(`tests/`のような別ツリーは作らない)。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Vitestとテストライブラリの導入・設定

- [X] T001 Vitest関連の依存を追加 — `package.json`
      (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`,
      `@testing-library/jest-dom`, `@testing-library/user-event`)
- [X] T002 [P] Vitest設定を作成 — `vitest.config.mts`
      (`environment: "jsdom"`、`@/*` エイリアス、`setupFiles: ["./vitest.setup.ts"]`)。
      T001に依存。(ESM警告を避けるため`.ts`ではなく`.mts`拡張子を使用)
- [X] T003 [P] Vitestセットアップファイルを作成 — `vitest.setup.ts`
      (`@testing-library/jest-dom` 読み込み、`next/image` モック、`ResizeObserver` スタブ。
      research.md参照)。T001に依存。
- [X] T004 `test` スクリプトを追加 — `package.json`(`"test": "vitest run"`)。
      T001〜T003に依存。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: テスト基盤自体が動作することの確認

**⚠️ CRITICAL**: このフェーズが完了するまで、いずれのユーザーストーリーにも着手できない

- [X] T005 `pnpm test` がテスト0件でもエラー無く実行できることを確認する。T001〜T004に依存。

**Checkpoint**: テスト基盤の土台が完成。ここからユーザーストーリーごとの実装(テスト追加)に
着手できる。

---

## Phase 3: User Story 1 - 既存ロジックのユニットテスト (Priority: P1) 🎯 MVP

**Goal**: `grep-utils.ts` / `convert-utils.ts` の既存の入出力の振る舞いをユニットテストで
固定し、ダイスログ解析ロジックの回帰を検知できるようにする。

**Independent Test**: `pnpm test` を実行し、`grep-utils.test.ts` / `convert-utils.test.ts`
のテストが単独でパスすることで確認できる(他のユーザーストーリーのテストが無くても
このストーリーだけで価値がある)。

### Implementation for User Story 1

- [X] T006 [P] [US1] `grepDicelog` / `grepCharactername` のユニットテストを作成 —
      `src/utils/grep-utils.test.ts`(spec.md User Story 1 Acceptance Scenario 2・3に対応)
- [X] T007 [P] [US1] `convertDicelog` のユニットテストを作成 —
      `src/utils/convert-utils.test.ts`(spec.md User Story 1 Acceptance Scenario 1に対応)

**Checkpoint**: この時点で User Story 1 は独立して完了・検証可能。

---

## Phase 4: User Story 2 - 状態を持つコンポーネントの結合テスト (Priority: P2)

**Goal**: `CharacterCard` のクリック/キーボード操作による表裏切り替えと、`ccfolia-grep`
ページのアップロード〜結果表示という一連の操作を、結合テストで検証できるようにする。

**Independent Test**: `CharacterCard` をレンダリングし、クリック/キーボード操作で表示
コンテンツが切り替わることを検証するテストが単独でパスすることで確認できる。

### Implementation for User Story 2

- [X] T008 [P] [US2] `CharacterCard` の結合テストを作成 — `src/components/CharacterCard.test.tsx`
      (`ReaderChart` を `vi.mock` で差し替え、クリック/キーボード操作での表裏切り替えを検証。
      spec.md User Story 2 Acceptance Scenario 1・2に対応)
- [X] T009 [P] [US2] `ccfolia-grep` ページの結合テストを作成 —
      `src/app/trpg/ccfolia-grep/page.test.tsx`
      (ファイルアップロード→キャラクター名選択→Submit→結果表示。デフォルトの成功度
      チェックのまま実行。spec.md User Story 2 Acceptance Scenario 3に対応)

**Checkpoint**: この時点で User Story 1・2 がともに独立して完了・検証可能。

---

## Phase 5: User Story 3 - CIでの自動テスト実行 (Priority: P3)

**Goal**: push/pull request時にCIがテストを自動実行し、失敗時にワークフローを失敗させる。

**Independent Test**: テストを1つ壊すコミットをpushし、CIの `Test` ステップが失敗して
ワークフロー全体が失敗することを確認する。

### Implementation for User Story 3

- [X] T010 [US3] CIにTestステップを追加 — `.github/workflows/ci.yml`
      (`Lint` と `Build` の間に `pnpm test` を追加)。T006〜T009に依存
      (テストが存在し手元でパスする状態でないと、CI導入時点でワークフローが壊れるため)。

**Checkpoint**: 全ユーザーストーリーが完了。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ユーザーストーリーにまたがるドキュメント整備・最終確認

- [X] T011 [P] テスト方針(テスティングトロフィーの考え方、`pnpm test`、テストファイルの
      配置規則)を追記 — `CLAUDE.md`
- [X] T012 [quickstart.md](quickstart.md) の手順を通しで実行し、全ステップが期待通り
      動作することを確認する。T001〜T011に依存。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし、即着手可能
- **Foundational (Phase 2)**: Setup完了に依存 — 全ユーザーストーリーをブロックする
- **User Stories (Phase 3〜5)**: いずれもFoundational完了に依存。US1・US2は互いに独立して
  並行実施可能。US3(CI追加)はUS1・US2のテストが存在することに依存する。
- **Polish (Phase 6)**: 全ユーザーストーリー完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に着手可能。他のストーリーへの依存なし。
- **User Story 2 (P2)**: Foundational完了後に着手可能。US1への依存なし(独立して検証可能)。
- **User Story 3 (P3)**: Foundational完了後に着手可能だが、実質的にUS1・US2のテストが
  存在しないとCI追加の検証ができないため、US1・US2の後に行う。

### Parallel Opportunities

- T002・T003(Setup内の`[P]`タスク)は並行実施可能
- Foundational完了後、US1(T006・T007)とUS2(T008・T009)は並行実施可能
- 同一ストーリー内の`[P]`タスク(T006とT007、T008とT009)はそれぞれ並行実施可能

---

## Parallel Example: User Story 1

```bash
# User Story 1 のテストを並行して書く:
Task: "grepDicelog / grepCharactername のユニットテストを src/utils/grep-utils.test.ts に作成"
Task: "convertDicelog のユニットテストを src/utils/convert-utils.test.ts に作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup を完了する
2. Phase 2: Foundational を完了する(CRITICAL — 全ストーリーをブロックする)
3. Phase 3: User Story 1 を完了する
4. **STOP and VALIDATE**: `pnpm test` で User Story 1 のテストが単独でパスすることを確認する

### Incremental Delivery

1. Setup + Foundational を完了 → 基盤が整う
2. User Story 1 を追加 → 単独で検証(MVP)
3. User Story 2 を追加 → 単独で検証
4. User Story 3(CI連携)を追加 → 単独で検証
5. Phase 6: Polish でドキュメントを整備し、quickstart.md で通し確認する

---

## Notes

- `[P]` タスク = 別ファイル・依存関係なし
- `[Story]` ラベルはユーザーストーリーへのトレーサビリティのため
- 各ユーザーストーリーは独立して完了・検証できる
- タスクごと、または論理的なまとまりごとにコミットする
- 完了の定義: `pnpm lint` が通る、`pnpm test` が通る、`pnpm build` が通る、
  影響のあるページ(`/trpg/charaeno-chart/sample-character`、`/trpg/ccfolia-grep`)を
  実際にブラウザで確認した
