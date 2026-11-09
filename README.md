# qurioth-toybox

TRPG(テーブルトークRPG)のセッションの準備・記録に使う小道具ツールと、写真・動画などの置き場を兼ねた
個人サイトです。Next.js(App Router)で作っています。

開発の進め方・ディレクトリ構成・コーディング規約は [CLAUDE.md](CLAUDE.md)、技術的な判断の経緯は
[docs/adr/](docs/adr/)、画面ごとの仕様は [specs/](specs/) にまとめています。

## 必要なもの

- [mise](https://mise.jdx.dev/) — Node.js のバージョンを `mise.toml` で固定している
  ([ADR-0010](docs/adr/0010-adopt-mise-for-node-version.md))
- pnpm は mise では入れない。Node.js に付属する Corepack が、`package.json` の `packageManager` で
  固定したバージョンを使う([ADR-0004](docs/adr/0004-migrate-yarn-to-pnpm.md))

## 初回のセットアップ

```bash
mise install
```

```bash
corepack enable
```

```bash
mise reshim
```

```bash
pnpm install
```

- `mise install`: `mise.toml` の Node.js を入れる。
- `corepack enable`: `pnpm` コマンドを使えるようにする。Node.js のバージョンを上げたときもやり直す。
- `mise reshim`: Corepack が作った `pnpm` を mise 経由で呼べるようにする。

## 開発サーバー

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で開く。

## 主なコマンド

| コマンド | 内容 |
| -- | -- |
| `pnpm dev` | 開発サーバーを起動する |
| `pnpm build` / `pnpm start` | 本番ビルドと、その起動 |
| `pnpm lint` | Biome の lint |
| `pnpm format` / `pnpm format:check` | Biome の整形 / 整形の検査のみ |
| `pnpm typecheck` | TypeScript の型チェック |
| `pnpm test` | Vitest のテスト |
| `pnpm scenario:draft <シナリオID>` | シナリオの専用ページの下書きを作る([ADR-0016](docs/adr/0016-scenario-pages-with-mdx.md)) |
| `pnpm photo:sync <slug>` | 写真を圧縮して R2 に上げ、アルバムデータを作る([ADR-0017](docs/adr/0017-store-photos-in-r2.md)) |

CI(`.github/workflows/ci.yml`)は、push と pull request で lint・整形の検査・型チェック・テスト・
ビルドを実行する。

## 写真の公開

写真は Cloudflare R2 に置き、`workers/photo/` の Worker から配信している。公開するときは、手元の PC で
写真のリストを書いて `pnpm photo:sync` を実行する。初回の設定(`.env.local` と Worker のデプロイ)と
手順は [src/data/photograph/README.md](src/data/photograph/README.md) を参照。

`.env.local` は `pnpm photo:sync` だけが使う。サイトの開発・ビルドには要らない。

## うまくいかないとき

- **`pnpm` が「mise ERROR No version is set for shim: pnpm」で動かない**: mise に別途 pnpm が入っていて、
  その入口が先に呼ばれている。このプロジェクトでは mise の pnpm は使わないので、
  `mise uninstall pnpm@<バージョン>` で外し、`corepack enable` と `mise reshim` をやり直す。
  すぐに動かしたいときは、`corepack pnpm dev` のように `corepack` を前に付けても実行できる。
- **`pnpm` が見つからない**: `corepack enable` をしていない。上の「初回のセットアップ」を参照。
