# 0010. Node.jsのバージョン管理にmiseを採用する

## ステータス

Accepted

## 日付

2026-08-04

## コンテキスト

このプロジェクトには、ローカル開発機とCIでNode.jsのバージョンを固定する仕組みが無かった。
実際、CI(`.github/workflows/ci.yml`)は `actions/setup-node` で明示的にNode 22を指定して
いる一方、開発機のNode.jsは(nvm-windowsで管理されていたが)v24系が使われており、
バージョンの食い違いが発生していた。

[mise](https://mise.jdx.dev/) はRust製の高速な言語・ツールバージョン管理ツールで、
プロジェクトルートの設定ファイル(`mise.toml`)にツールとバージョンを宣言する。
`.nvmrc` + nvm でも同様にNode.jsのバージョン固定は可能だが、このプロジェクトは既に
spec-kit CLIの導入で `uv`(Rust製、高速なPythonツール管理)を使っており、同系統の
ツールとして親和性がある。また将来的にNode.js以外の言語ツールのバージョンも一元管理
したくなった場合に一本化できる。

## 決定

- Node.jsのバージョン管理に mise を採用する。プロジェクトルートに `mise.toml` を置き、
  `[tools] node = "22"` でバージョンを宣言する。
- CI(`.github/workflows/ci.yml`)は `mise.toml` からNode.jsバージョンを読み取り、
  `actions/setup-node` に渡す(`sed` でパース)。バージョンの二重管理・乖離を防ぐため。
  `actions/setup-node` 自体は `cache: pnpm` によるキャッシュ機能を活かすため置き換えず、
  バージョン指定元だけを `mise.toml` に一本化する。
- pnpmのバージョン管理は引き続き Corepack + `package.json` の `packageManager`
  フィールド([ADR-0004](0004-migrate-yarn-to-pnpm.md))を使う。miseでは重複して
  管理しない。
- 開発機への mise 本体のインストールは開発者自身が行う(このADRの対象は
  リポジトリ側の設定のみ)。

## 影響・トレードオフ

- 良い点: ローカル開発機とCIのNode.jsバージョンが `mise.toml` という単一の情報源で
  揃うようになり、バージョン起因の不具合を防ぎやすくなる。
- コスト: 開発機に mise 本体のインストールが別途必要(既存の nvm-windows と共存する形に
  なる)。CIのバージョン取得に `sed` でのパースという若干の複雑さが加わる。
