# 0005. lint/build を実行する CI ワークフローを追加する

## ステータス

Accepted

## 日付

2026-07-30

## コンテキスト

これまで `qurioth-toybox` には lint/build/test を実行する CI が存在せず、壊れた変更がそのまま
マージされても気づけない状態だった。実際、`next lint` が Next.js 16 で廃止されていたにも
関わらず誰も気づかないまま放置されていた([ADR-0006](docs/adr/0006-migrate-eslint-to-biome.md)
参照)。テストフレームワークはまだ導入していないため、まずは lint と build の自動チェックから
始める。

## 決定

- `.github/workflows/ci.yml` を追加し、`push` (master) と `pull_request` をトリガーに以下を
  実行する。
  1. Corepack を有効化
  2. `actions/setup-node` (pnpm キャッシュ有効) で Node.js をセットアップ
  3. `pnpm install --frozen-lockfile`
  4. `pnpm lint`
  5. `pnpm build`
- test ステップはテストフレームワーク導入後に追加する。

## 影響・トレードオフ

- 良い点: 壊れたコード(型エラー、ビルド失敗、lint エラー)がマージ前に検知できる。
- コスト: CI実行時間の分だけPRのフィードバックが遅くなる。`pnpm lint`/`pnpm build` が通らない
  限りマージしにくくなるため、緊急のtypo修正等でもCIの完了を待つ場面が出てくる。
