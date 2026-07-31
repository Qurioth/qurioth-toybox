# Tasks: テスト基盤の導入(テスティングトロフィー戦略)

対応する plan: `specs/0001-introduce-testing/plan.md`

実行可能な単位に分解したタスク一覧。上から順に実施することを想定するが、依存がなければ
並行してよい。

## セットアップ(直列)

- [ ] T1. Vitest関連の依存を追加 — `package.json`
      (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`,
      `@testing-library/jest-dom`, `@testing-library/user-event`)
- [ ] T2. Vitest設定を作成 — `vitest.config.ts`
      (`environment: "jsdom"`, `@/*` エイリアス, `setupFiles`)。T1に依存。
- [ ] T3. セットアップファイルを作成 — `vitest.setup.ts`
      (`@testing-library/jest-dom` 読み込み、`next/image` モック、`ResizeObserver` スタブ)。
      T1に依存。
- [ ] T4. `test` スクリプトを追加 — `package.json` (`"test": "vitest run"`)。T1〜T3に依存。
- [ ] T5. `pnpm test` が(テスト0件でも)エラー無く実行できることを確認する。T1〜T4に依存。

## テスト追加(T5完了後、以下は並行可能)

- [ ] T6. `grepDicelog` / `grepCharactername` のユニットテストを作成 —
      `src/utils/grep-utils.test.ts`
- [ ] T7. `convertDicelog` のユニットテストを作成 — `src/utils/convert-utils.test.ts`
- [ ] T8. `CharacterCard` の結合テストを作成 — `src/components/CharacterCard.test.tsx`
      (`ReaderChart` を `vi.mock` で差し替え、クリック/キーボード操作での表裏切り替えを検証)
- [ ] T9. `ccfolia-grep` ページの結合テストを作成 —
      `src/app/trpg/ccfolia-grep/page.test.tsx`
      (ファイルアップロード→キャラクター名選択→チェックボックス→Submit→結果表示)

## CI・ドキュメント反映(T6〜T9完了後)

- [ ] T10. CIにTestステップを追加 — `.github/workflows/ci.yml`
      (`Lint` と `Build` の間に `pnpm test` を追加)
- [ ] T11. テスト方針・実行コマンドを追記 — `CLAUDE.md`
      (テスティングトロフィーの考え方、`pnpm test`、テストファイルの配置規則)

## この feature のスコープ外(参考: 未決定事項)

- `.specify/memory/constitution.md` 原則6の「現状CIはRenovateのみ」という記述は
  ADR-0004/0005/0007以降の実態と合っていない。今回のtasksには含めていない
  (ユーザーからの回答待ち)。対応する場合は別タスクとして追加する。

## 完了の定義

- [ ] spec.md の受け入れ条件をすべて満たす
- [ ] `pnpm lint` が通る
- [ ] `pnpm test` が通る(T6〜T9のテストが全てパスする)
- [ ] `pnpm build` が通る
- [ ] 影響のあるページ(`/trpg/charaeno-chart/sample-character`、`/trpg/ccfolia-grep`)を
      実際にブラウザで確認した
