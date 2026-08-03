# Research: テスティングトロフィー戦略に基づくテスト基盤の導入

Technical Contextに `NEEDS CLARIFICATION` は無い。技術選定自体は本feature着手前に
[ADR-0008](../../docs/adr/0008-adopt-testing-trophy-and-vitest.md) として既に決定済みのため、
本ドキュメントはその要約と、実装レベルの補足調査のみを記録する。

## Decision: テストランナー — Vitest

- **Rationale**: `environment: "jsdom"` を使い、起動・実行速度を優先。個人開発での反復速度を
  落とさないため。ESM/TypeScriptとの親和性も高い。
- **Alternatives considered**: Jest(`next/jest`)。Next.js公式のより手厚い統合があるが、
  起動速度・設定のシンプルさでVitestを選んだ。

## Decision: DOM環境 — jsdom

- **Rationale**: `next/image` や `FileReader`(`ccfolia-grep`のファイルアップロード処理)など、
  ブラウザAPIの網羅性が必要なため。
- **Alternatives considered**: happy-dom(高速だがDOM API網羅性で劣るため見送り)。

## Decision: コンポーネントテスト — React Testing Library

- **Rationale**: 実装の詳細(内部state・関数呼び出し)ではなくユーザー操作・表示結果を
  検証するAPIを持ち、テスティングトロフィーの「結合テストを主軸に」という方針と合致する。
- **Alternatives considered**: Enzyme(実装詳細に依存したテストになりやすく、React 19との
  互換性懸念もあるため不採用)。

## Decision: `next/image` のモック方針

- **Rationale**: jsdomには画像最適化・レイアウト計算が無く、`next/image` をそのまま使うと
  `sizes` 等の警告やloader関連のエラーが出やすい。`vitest.setup.ts` で
  `vi.mock("next/image", ...)` を使い、`<img {...props} />` を返す薄いモックに差し替える。
- **Alternatives considered**: モックせずそのまま使う(警告・エラーが頻発し、テストの
  シグナルノイズになるため不採用)。

## Decision: `ResizeObserver` のスタブ

- **Rationale**: jsdomは`ResizeObserver`を実装しておらず、`CharacterCard`が使う
  `ReaderChart`(recharts の `ResponsiveContainer`)がこれに依存しているため、
  未対応だと `ReferenceError` になる。`vitest.setup.ts` にグローバルスタブを追加する。
- **Alternatives considered**: `ReaderChart` 自体を `vi.mock` で丸ごと差し替える(併用する。
  `CharacterCard` の結合テストではチャートの内部実装はテスト対象外とし、`vi.mock` で
  差し替えることで `ResizeObserver` 問題そのものを回避する。スタブはchartを使う他のテストが
  将来増えた場合の保険として残す)。

## Decision: Testing Libraryの明示的クリーンアップ

- **Rationale**: `globals: false` にしているため、Testing Libraryが自動クリーンアップに
  使う `afterEach` がグローバルに存在せず、自動クリーンアップの仕組みが機能しない
  (実装中に、テスト間でレンダリング結果が残留し `getByRole` が複数要素にマッチして
  失敗する不具合として発覚)。`vitest.setup.ts` に `afterEach(() => cleanup())` を
  明示的に追加する。
- **Alternatives considered**: `globals: true` にしてTesting Libraryの自動検出に任せる
  (「明示import」というプロジェクトの既存スタイルと矛盾するため見送り)。

## Decision: `window.matchMedia` のスタブ

- **Rationale**: jsdomは `window.matchMedia` を実装しておらず、`DarkModeContext` が
  初期表示時にこれを呼び出すため、`DarkModeProvider` を含む画面(`ccfolia-grep`ページ等)の
  結合テストで `TypeError` になる。`vitest.setup.ts` にダーク/ライト判定を常に `false` で
  返す薄いスタブを追加する。
- **Alternatives considered**: `ccfolia-grep` ページのテストで `DarkModeProvider` を
  使わない(`Template` コンポーネントが内部で `Header` を経由して依存しているため、
  プロバイダ無しでのレンダリングは不可能)。

## Decision: テストファイルの配置 — コロケーション

- **Rationale**: テスト対象と同じディレクトリに `*.test.ts(x)` を置く。個人開発で
  対応関係を探しやすくするため。
- **Alternatives considered**: `__tests__/` ディレクトリへの集約(ファイル数が少ないうちは
  対応関係が分かりにくくなるデメリットの方が大きいと判断)。

## Decision: `describe`/`it`/`expect` はグローバル化しない

- **Rationale**: 各テストファイルで `vitest` から明示importする。「暗黙より明示」という
  既存プロジェクトのスタイル(Biome導入時の判断等)に合わせる。tsconfigに
  `vitest/globals` 型を追加する必要も無くなる。
- **Alternatives considered**: グローバル化してimport文を省略する(記述量は減るが、
  エディタの型解決に`vitest/globals`設定が必要になり、プロジェクトの既存スタイルとも
  ずれるため不採用)。
