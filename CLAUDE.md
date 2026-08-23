# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

`qurioth-toybox` は個人開発の Next.js 製 Web アプリです。TRPG(テーブルトークRPG)セッションの
準備・記録に使う小道具ツール群と、写真やその他コンテンツの置き場を兼ねています。開発者は一人で、
自分のペースで機能を継ぎ足しながら育てています。

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動 (http://localhost:3000)
pnpm build    # 本番ビルド
pnpm start    # 本番サーバー起動
pnpm lint     # Biome lint(旧 next lint / ESLint から移行)
pnpm format   # Biome フォーマッタで整形(検査のみは pnpm format:check)
pnpm typecheck # TypeScript の型チェック(tsc --noEmit)
pnpm test     # Vitest(テスティングトロフィー戦略。ADR-0008参照)
```

パッケージマネージャは pnpm(`pnpm-lock.yaml` を使用、Corepack 経由で `package.json` の
`packageManager` に固定したバージョンを実行)。Node.js のバージョンは `mise.toml` で固定し、
CI もそこから読み取る([ADR-0010](docs/adr/0010-adopt-mise-for-node-version.md))。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript (strict)
- Tailwind CSS 3 系 + `tailwind-merge` / `tailwindcss-animate` / `tailwindcss-animated`
- UI 部品: `@headlessui/react`, `lucide-react`, `@heroicons/react`, `react-icons`
- `flowbite` は **Tailwind プラグインとしてのみ**使用している。JS コンポーネントは import して
  いないが、プラグインが注入するフォーム要素のベーススタイル(`[type=checkbox]` 等)に
  `src/components/forms/` の UI が依存しているため削除できない
  ([ADR-0012](docs/adr/0012-tidy-dependencies.md))。
- **注意**: flowbite プラグインは `blue` パレット全体を差し替える(`blue-900` は Tailwind 既定の
  `#1e3a8a` ではなく `#233876`)。既定の色を使いたい場合はパレット名では指せないため、
  `tailwind.config.ts` の `theme.extend.colors` に名前を付ける(例: `connection-accent`)。
  `slate` など他のパレットは差し替えられていない。
- フォーム: `react-hook-form`(`trpg/charaeno-chart` の URL 入力フォームで使用)
- グラフ: `recharts`(`charaeno-chart` のレーダーチャート等)
- Markdown 描画: `react-markdown` + `remark-gfm`(シナリオ本文の表示に使用)
- パスエイリアス: `@/*` → `./src/*`(`tsconfig.json`)

## ディレクトリ構成

```
src/
  app/            App Router のページ・ルート
    trpg/         TRPG向けツール群(下記参照)
    other/        写真ページなどその他コンテンツ
    blurry-blob-demo/  UI実験ページ
  components/     再利用UIコンポーネント(animata/, forms/, recharts/ にサブ分類)
  data/           静的データ(trpg/photograph/scenario/youtube 等ドメインごとにサブフォルダ)
  contexts/       React Context
  hooks/          複数の画面から使う汎用フック(`use-<用途>.ts`)
  constants/      定数(ドメイン値は dicelog.ts、UI文言は message.ts)
  utils/          純粋関数のユーティリティ(`<用途>-utils.ts` で命名)
  types/, image/
```

### `src/app/trpg` 配下の主なツール

- `ccfolia-grep` — CCFOLIA のダイスログを解析し、キャラクター毎の成功/失敗(クトゥルフ神話TRPGは
  クリティカル/ファンブルも)を集計する。
- `charaeno-chart` — Charaeno に保存したキャラクターシートのステータスをレーダーチャート表示。
- `connection-table` — 「ふしぎもののけRPG ゆうやけこやけ」の人間関係(コネクション)管理表。
- `scenario` — 自作シナリオの一覧・詳細(`src/data/scenario` の Markdown を描画)。
- `replay` — YouTube のリプレイ動画/配信のまとめ。

新しいツールを追加する際も、`toolCards` / `libraryCards` のようなカード形式で `trpg/page.tsx` の
入口から辿れるようにするのがこのリポジトリの慣習。

## コーディング規約

- コンポーネントは PascalCase のファイル名(例: `CharacterCard.tsx`)。
- ページコンポーネント(`app/**/page.tsx` の default export)は `<機能名>Page` と命名する
  (例: `CcfoliaGrepPage`、`ScenarioDetailPage`)。`Home` のような汎用名は使わない。
- クライアントコンポーネントには先頭に `"use client"` を明示(例: `src/app/trpg/page.tsx`)。
- UI 文言は日本語が基本(TRPGコミュニティ向けの個人サイトのため)。
- スタイリングは Tailwind のユーティリティクラスを直接記述し、`clsx` / `tailwind-merge` で結合。
- 整形は Biome のフォーマッタに任せる(2スペースインデント / ダブルクォート / LF。
  [ADR-0011](docs/adr/0011-enable-biome-formatter.md))。手で整形し直さないこと。

## CI / 自動化

- Renovate による自動依存更新は運用が定着せず廃止した([ADR-0003](docs/adr/0003-drop-renovate.md))。
  依存関係の更新は当面手動で行う。
- `.github/workflows/ci.yml` — push (master) / pull_request で `pnpm install` → `pnpm lint`
  → `pnpm format:check` → `pnpm typecheck` → `pnpm test` → `pnpm build` を実行する
  ([ADR-0005](docs/adr/0005-add-ci-workflow.md))。

## テスト方針

- テスト戦略は**テスティングトロフィー**([ADR-0008](docs/adr/0008-adopt-testing-trophy-and-vitest.md))。
  静的解析(TypeScript strict / Biome)を土台に、結合テスト(React Testing Library)を主軸とし、
  複雑なロジックを持つ純粋関数にはユニットテストを書く。E2Eは現状導入していない。
- テストランナーは Vitest(`environment: "jsdom"`)。設定は `vitest.config.mts` / `vitest.setup.ts`。
- テストファイルはテスト対象と同じディレクトリに `*.test.ts(x)` として配置する(コロケーション、
  `__tests__/` のような別ツリーは作らない)。
- `describe` / `it` / `expect` は `vitest` から明示 import する(グローバル化しない)。
- カバレッジの数値目標は設定しない。個人開発のスコープに見合わない重厚なテスト基盤を
  目的化しない(`.specify/memory/constitution.md` 原則6)。

## 開発フロー(Spec-Driven Development)

このプロジェクトでは、ある程度まとまった機能追加・変更について
[spec-driven development (SDD)](docs/adr/0009-adopt-official-spec-kit-cli.md) を採用する。
[spec-kit](https://github.com/github/spec-kit) 公式CLI(`uv tool install specify-cli` で導入)を
使い、`.claude/skills/speckit-*` のスキルと `.specify/` のテンプレート・スクリプトで運用する。

spec は **画面(ルート)ごと** に作り、`specs/<番号>-<画面slug>/` を画面と1対1で対応させる
([ADR-0013](docs/adr/0013-spec-per-screen.md))。既存画面の改修では新しいディレクトリを作らず、
その画面の `spec.md` を更新する。画面に紐づかない横断的な判断(テスト戦略、CI構成など)は
spec ではなく [ADR](docs/adr/) に記録する。

1. `/speckit-specify` — 何を・なぜ作るかを `specs/<番号>-<画面slug>/spec.md` にまとめる
   (実装方法は書かない)。
2. `/speckit-plan` — 技術方針を `plan.md` に落とし込む。
3. `/speckit-tasks` — 実行可能な作業単位に分解する。
4. 必要に応じて `/speckit-clarify`(曖昧点の解消)、`/speckit-analyze`(spec/plan/tasksの整合性
   チェック)、`/speckit-checklist`(品質チェックリスト作成)を挟む。
5. `/speckit-implement` — tasks.md に沿って実装する。実装途中で仕様と乖離した既存コードがあれば
   `/speckit-converge` で残作業を棚卸しできる。
6. 必要なら [ADR](docs/adr/) に大きな技術判断を記録する。

spec/plan/tasksのテンプレートは公式のもの(英語の見出し構造、ユーザーストーリーの優先度付け
P1/P2/P3、`FR-XXX`/`SC-XXX`形式の要件・成功基準など)を使うが、実際に書く内容は日本語でよい。
小さな修正(typo、微調整、依存更新など)にはこのフローは不要。プロジェクトの原則は
[.specify/memory/constitution.md](.specify/memory/constitution.md) を参照。

## Architecture Decision Records (ADR)

技術選定や設計上の重要な判断は `docs/adr/` に ADR として記録する。新しい ADR を書く際は
`docs/adr/0001-record-architecture-decisions.md` のフォーマットに従うこと。
