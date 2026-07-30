# 0003. パッケージマネージャを yarn から pnpm に移行する

## ステータス

Accepted

## 日付

2026-07-30

## コンテキスト

`qurioth-toybox` はこれまで yarn (classic, v1) を使用していた。今後の開発・CI整備にあたり、
より高速でディスク効率の良い pnpm に切り替えることにした。Node に同梱される Corepack を使えば
追加のグローバルインストール無しにバージョン固定されたパッケージマネージャを利用できる点も
移行の後押しとなった。

## 決定

- パッケージマネージャを yarn から pnpm に変更する。
- `package.json` の `packageManager` フィールドで pnpm のバージョンを固定し、Corepack 経由で
  実行する。
- `yarn.lock` を削除し、`pnpm-lock.yaml` を新規生成する。
- `yarn <script>` を使っていた開発コマンド・ドキュメント記載を `pnpm <script>` に置き換える。

## 影響・トレードオフ

- 良い点: インストール速度・ディスク使用量の改善。`packageManager` フィールドによりバージョンが
  固定され、環境差異による依存解決の揺れが減る。
- コスト: 依存関係のシンボリックリンク構造が厳格になるため、パッケージが `package.json` の
  `dependencies`/`devDependencies` に正しく宣言されていないと動かなくなるケースがある
  (phantom dependency の排除)。移行直後はビルド・lintで一度動作確認が必要。
