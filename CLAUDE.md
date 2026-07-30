# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

`qurioth-toybox` は個人開発の Next.js 製 Web アプリです。TRPG(テーブルトークRPG)セッションの
準備・記録に使う小道具ツール群と、写真やその他コンテンツの置き場を兼ねています。開発者は一人で、
自分のペースで機能を継ぎ足しながら育てています。

## 開発コマンド

```bash
yarn dev      # 開発サーバー起動 (http://localhost:3000)
yarn build    # 本番ビルド
yarn start    # 本番サーバー起動
yarn lint     # ESLint (next/core-web-vitals, next/typescript)
```

パッケージマネージャは yarn(`yarn.lock` を使用)。テストフレームワークは未導入。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript (strict)
- Tailwind CSS 3 系 + `tailwind-merge` / `tailwindcss-animate` / `tailwindcss-animated`
- UI 部品: `@headlessui/react`, `lucide-react`, `@heroicons/react`
  (`flowbite-react` は依存関係にあるが現状 `src` 配下での import は見当たらない)
- フォーム: `react-hook-form`(依存関係にあるが現状未使用。導入予定 or 整理待ちの可能性あり)
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
  lib/, utils/, types/, image/, assets/
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
- クライアントコンポーネントには先頭に `"use client"` を明示(例: `src/app/trpg/page.tsx`)。
- UI 文言は日本語が基本(TRPGコミュニティ向けの個人サイトのため)。
- スタイリングは Tailwind のユーティリティクラスを直接記述し、`clsx` / `tailwind-merge` で結合。

## CI / 自動化

- Renovate による自動依存更新は運用が定着せず廃止した([ADR-0003](docs/adr/0003-drop-renovate.md))。
  依存関係の更新は当面手動で行う。
- lint/build/test を実行する CI は未整備。

## 開発フロー(Spec-Driven Development)

このプロジェクトでは、ある程度まとまった機能追加・変更について
[spec-driven development (SDD)](docs/adr/0002-adopt-spec-driven-development.md) を採用する。
[spec-kit](https://github.com/github/spec-kit) の構成に準拠したテンプレートを `.specify/` と
`.claude/commands/` に用意している。

1. `/specify` — 何を・なぜ作るかを `specs/<番号>-<slug>/spec.md` にまとめる(実装方法は書かない)。
2. `/plan` — 技術方針を `plan.md` に落とし込む。
3. `/tasks` — 実行可能な作業単位に分解する。
4. 実装を行い、必要なら [ADR](docs/adr/) に大きな技術判断を記録する。

小さな修正(typo、微調整、依存更新など)にはこのフローは不要。プロジェクトの原則は
[.specify/memory/constitution.md](.specify/memory/constitution.md) を参照。

## Architecture Decision Records (ADR)

技術選定や設計上の重要な判断は `docs/adr/` に ADR として記録する。新しい ADR を書く際は
`docs/adr/0001-record-architecture-decisions.md` のフォーマットに従うこと。
