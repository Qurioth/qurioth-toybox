# 0008. テスト戦略にテスティングトロフィー、テストランナーにVitestを採用する

## ステータス

Accepted

## 日付

2026-07-31

## コンテキスト

`qurioth-toybox` はこれまでテストを一切持たず、実装方針も明文化せずに機能を継ぎ足してきた。
今後リファクタリングを行うにあたり、変更のたびに全ページを手動確認する以外に回帰を検知する
手段が無く、安全にリファクタリングを進められない状態だった。

テスト戦略として「テスティングトロフィー」(Kent C. Dodds提唱。静的解析を土台に、結合テストを
主軸とし、ユニットテストとE2Eは必要な分だけ書く)と、従来の「テストピラミッド」(ユニット
テストを主軸とする)を比較検討した。このプロジェクトは既にTypeScript strict + Biome lintという
静的解析の土台を持っており、UIロジック(コンポーネントの状態・表示切り替え)が複雑さの中心に
あるため、実装の詳細に依存しすぎないテストで回帰を検知しやすい結合テスト主軸の方が
費用対効果が高いと判断した。

テストランナーはVitestとJest(`next/jest`)を比較した。

## 決定

- テスト戦略として **テスティングトロフィー** を採用する。既存の静的解析(TypeScript strict /
  Biome)を土台とし、結合テスト(React Testing Library でのコンポーネントテスト)を主軸に、
  複雑なロジックを持つ純粋関数にはユニットテストを書く。E2Eは当面導入しない。
- テストランナーとして **Vitest** を採用する。環境は `jsdom`、コンポーネントテストには
  `@testing-library/react` / `@testing-library/jest-dom` / `@testing-library/user-event` を
  使う。
- テストファイルはテスト対象と同じディレクトリに `*.test.ts(x)` として配置する
  (コロケーション)。
- スナップショットテストとカバレッジ数値目標は採用しない。
- DOM環境は `jsdom` を使う。`ccfolia-grep` の `FileReader` や `next/image` などブラウザAPIの
  網羅性が必要なため、より高速な happy-dom は採用しない。
- `describe` / `it` / `expect` はグローバル化せず、各テストファイルで `vitest` から明示
  import する(「暗黙より明示」という既存スタイルに合わせる)。
- jsdom に無いブラウザAPIは `vitest.setup.ts` でまとめて補う。導入時点で必要だったのは以下:
  - `next/image` を `<img {...props} />` を返す薄いモックに差し替える(画像最適化・loader
    由来の警告やエラーがテストのノイズになるため)。
  - `ResizeObserver` のグローバルスタブ(recharts の `ResponsiveContainer` が依存する)。
    `CharacterCard` の結合テストでは `ReaderChart` 自体を `vi.mock` で差し替えて回避して
    いるが、チャートを使うテストが増えた場合の保険として残す。
  - `window.matchMedia` のスタブ(`DarkModeContext` が初期表示時に呼ぶため、
    `DarkModeProvider` を含む画面の結合テストで必要)。
  - `afterEach(() => cleanup())` の明示的な呼び出し。`globals: false` では Testing Library の
    自動クリーンアップが働かず、テスト間でレンダリング結果が残留する。
- 最初のテスト対象は `grep-utils.ts` / `convert-utils.ts`(ユニットテスト)と
  `CharacterCard` / `ccfolia-grep` ページ(結合テスト)の4箇所に限定する。

## 影響・トレードオフ

- 良い点: 実装の詳細(内部関数呼び出しなど)に依存しないテストになるため、今後
  リファクタリングをしてもテストが壊れにくい。Vitestは起動・実行が高速で、個人開発での
  反復速度を落としにくい。
- コスト: Jest(`next/jest`)ほどNext.js公式の手厚い統合は無く、`next/image` や
  recharts の `ResponsiveContainer`(`ResizeObserver`)など、ブラウザAPIに依存する箇所は
  個別にモック・スタブが必要になる。結合テスト主軸のため、細かいロジック単位のバグの
  原因特定はユニットテストより追いにくい場合がある。
- 既知の限界: CSSアニメーションの描画バグ(例: `CharacterCard`のフリップで実際に発生した、
  ブラウザのコンポジット処理に起因する表示崩れ)は、jsdomに実際の描画エンジンが無いため
  結合テストは元よりE2Eの通常の機能テストでも検出できない。ビジュアルリグレッションテストが
  必要になるが、個人開発のスコープでは過剰と判断し今回は対応しない。
