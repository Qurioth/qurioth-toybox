# 0006. ESLint (next lint) から Biome に移行する

## ステータス

Accepted

## 日付

2026-07-30

## コンテキスト

CI に lint チェックを組み込もうとしたところ、`next lint` が Next.js 16 で廃止されており
(`next --help` のコマンド一覧に `lint` が存在しない)、`pnpm lint` が既に壊れていることが
判明した。`eslint-config-next` は 14.2.8 のまま、`next` 本体だけが `^16.0.10` に上がっており、
バージョンの不整合が原因。

この機会に ESLint + `eslint-config-next` を存続させる(バージョンを合わせて `next lint` を
`eslint` 直接呼び出しに置き換える)か、[Biome](https://biomejs.dev/) に乗り換えるかを検討し、
単一バイナリで高速・設定がシンプルな Biome を採用することにした。

## 決定

- ESLint (`eslint`, `eslint-config-next`, `.eslintrc.json`) を削除し、`@biomejs/biome` を
  devDependency として導入する。
- `biome migrate eslint --write` で既存の `.eslintrc.json` (`next/core-web-vitals`,
  `next/typescript`) を機械的に移行し、Biome が推奨する broader な `recommended` プリセットは
  有効化しない(`preset: "none"`)。
  - 既存コードに対し `recommended` を有効化すると a11y 関連などで 32 件のエラー・20 件の警告が
    新規に発生し、今回の CI 追加のスコープを超えるため見送った。将来的に段階的に有効化を検討する。
- フォーマッタ (`formatter`) と import 整理 (`assist`) は無効化する。これまで Prettier 等の
  フォーマッタ運用が無かったため、今回のスコープに含めない。
- `tailwind.config.ts` の `require()` (Tailwind プラグインの CJS 読み込み) は
  `style.noCommonJs` のオーバーライドで許可する。
- `package.json` の `lint` スクリプトを `next lint` から `biome lint .` に変更する。
- 既存の `eslint-disable` コメントは対応する `biome-ignore` コメントに置き換える
  (`ReaderChart.tsx` の `noExplicitAny`、`scenario/[id]/page.tsx` の `noImgElement`)。

## 影響・トレードオフ

- 良い点: 単一バイナリ・高速起動でCIの実行時間が短い。Next.js 本体のバージョンに `next lint`
  経由で引きずられる問題が今後発生しない。
- コスト: Biome は ESLint の全ルール・プラグインをカバーしていない
  (`@next/next/no-html-link-for-pages` 等、一部 Next.js 固有ルールは移行できていない)。
  将来的にフォーマッタ・a11y ルール強化を検討する余地がある。
