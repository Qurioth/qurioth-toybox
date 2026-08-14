# 0012. 依存関係を棚卸しし、未使用パッケージの削除と区分の是正を行う

## ステータス

Accepted

## 日付

2026-08-15

## コンテキスト

リファクタリングに先立ち `package.json` を精査したところ、次の3種類の問題が見つかった。

1. **未使用パッケージ**: `flowbite-react`、`tailwind-scrollbar`、`tailwind-scrollbar-utilities`
   がインストールされているが、`src` からの import も `tailwind.config.ts` への登録もない。
   スクロールバーのユーティリティ(`.scrollbar-none` / `.scrollbar-thin`)は
   `tailwind.config.ts` 内の自前プラグインで定義されており、パッケージ由来ではなかった。
2. **区分の誤り**: `recharts`、`react-markdown`、`remark-gfm`、`tailwind-merge` は実行時に
   バンドルされるコードなのに `devDependencies` にあった。Next.js のビルドは
   `devDependencies` も解決するため動作はしていたが、区分としては誤りである。
3. **型定義の不整合**: React 本体は 19 系なのに `@types/react` / `@types/react-dom` は
   18 系のままだった。

`flowbite` 本体も当初は未使用と判断しかけたが、調査の結果そうではなかった(下記)。

## 決定

- `flowbite-react` / `tailwind-scrollbar` / `tailwind-scrollbar-utilities` を削除する。
- **`flowbite` 本体は残す。** JS コンポーネントは一切 import していないが、
  `tailwind.config.ts` に登録された `flowbite/plugin` がフォーム要素のベーススタイルを
  注入しており(既定で `forms: true`)、`src/components/forms/` のチェックボックス・
  ファイル入力などがこれに依存している。`HorizontailCheckBox` の
  `class="w-4 h-4 text-blue-600 ... rounded"` は、プラグインが `appearance: none` と
  チェックマーク画像を当てていることを前提とした Flowbite 流の書き方であり、プラグインを
  外すとネイティブ描画に戻って崩れる。**「import されていない = 未使用」ではない**点を
  ここに記録しておく。
- ただし `content` の `./node_modules/flowbite/**/*.js` は削除する。flowbite の JS
  コンポーネントを使っていない以上、そこからクラス名を走査する必要はない。
- 実行時依存4件を `dependencies` に移す。
- `@types/react` / `@types/react-dom` を 19 系に更新する。

## 検証

`content` から flowbite を外す変更は生成CSSに影響するため、ビルド済みCSSを変更前後で比較した。

- CSS サイズ: 68,947 → 61,847 バイト(約 10% 削減)
- フォームのベーススタイルは維持: `[type=checkbox]` 9件、`[type=file]` 7件、
  `[type=radio]` 7件がいずれも変更前と同数
- `src` の `className` から収集した497クラスのうち、**変更前CSSにあって変更後に消えたものは0件**

`lint` / `format:check` / `typecheck` / `test`(16件)/ `build` はいずれも成功。

## 影響・トレードオフ

- 良い点: 生成CSSが約7KB減った。`dependencies` を見れば実行時に何が必要かが分かるようになった。
  React 19 に対する型チェックが正しく効くようになった。
- コスト: `flowbite` が「一見未使用に見えるが消せない依存」として残る。将来また削除を
  検討したときに同じ調査を繰り返さないよう、CLAUDE.md と本ADRに理由を明記した。
  フォームのベーススタイルを `@tailwindcss/forms` などに置き換えて flowbite を完全に
  外すことは可能だが、UIの見た目が変わるため今回のスコープ外とした。
