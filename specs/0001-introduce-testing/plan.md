# Plan: テスト基盤の導入(テスティングトロフィー戦略)

対応する spec: `specs/0001-introduce-testing/spec.md`

## 技術方針

### テストランナー・ライブラリ構成

- **テストランナー**: [Vitest](https://vitest.dev/)。`environment: "jsdom"` を使用する
  (Next.js公式のテスト例・エコシステムがjsdom前提のものが多く、`next/image`・`FileReader`
  等のブラウザAPI互換性で無難なため)。より高速な `happy-dom` も選択肢だが、DOM API網羅性の
  差により今回は見送る(将来テスト量が増え速度がボトルネックになれば再検討)。
- **結合テスト用ライブラリ**: `@testing-library/react`(コンポーネントの描画・操作)、
  `@testing-library/jest-dom`(`toBeInTheDocument`等のカスタムマッチャ)、
  `@testing-library/user-event`(クリック・キーボード操作・ファイルアップロードの模擬)。
- **Reactプラグイン**: `@vitejs/plugin-react`(JSX/TSXのトランスフォーム)。
- **globals不使用**: `describe`/`it`/`expect` はグローバルに生やさず、各テストファイルで
  `vitest` から明示import する。プロジェクトの「暗黙より明示」の既存スタイル
  (Biome導入時の判断等)に合わせる。tsconfigに `vitest/globals` 型を追加する必要も無くなる。

### 設定ファイル

- `vitest.config.ts` — `environment: "jsdom"`、`@/*` エイリアス(tsconfigと同じ)、
  `setupFiles: ["./vitest.setup.ts"]` を設定。
- `vitest.setup.ts` — 以下を行う。
  1. `@testing-library/jest-dom` のマッチャを読み込む。
  2. `next/image` を軽量モックに差し替える(`vi.mock("next/image", ...)`)。jsdomには
     実際の画像最適化・レイアウト計算が無く、`next/image` をそのまま使うと `sizes` 等の
     警告やloader関連のエラーが出やすいため、`<img {...props} />` を返す薄いモックにする。
  3. `ResizeObserver` のスタブをグローバルに追加する。jsdomは`ResizeObserver`を実装して
     おらず、rechartsの`ResponsiveContainer`がこれに依存しているため、未対応だと
     `ReferenceError` になる。

### テストファイルの配置

- テスト対象ファイルと同じディレクトリに `*.test.ts` / `*.test.tsx` として配置する
  (`__tests__/` のような別ツリーは作らない)。個人開発でテスト対象との対応関係を
  探しやすくするため。

### 最初のテスト対象(オープンな疑問の解消)

1. **ユニットテスト**
   - `src/utils/grep-utils.ts` の `grepDicelog` / `grepCharactername`
   - `src/utils/convert-utils.ts` の `convertDicelog`
   - いずれも副作用の無い純粋関数で、CCFOLIAのダイスログ解析という複雑度の高いロジックを
     持つため、最初の対象として適切。
2. **結合テスト**
   - `src/components/CharacterCard.tsx` — クリック/キーボード操作(Enter・Space)で
     表面(ステータス・レーダーチャート)と裏面(技能表・バックストーリー)が正しく
     切り替わることを検証する。直近の実装(`div role="button"`)で発生したフリップ表示の
     不具合はCSSアニメーションの描画バグでありDOMレベルのテストでは検出できないが
     (ユーザーとの合意事項)、クリック/キーボード操作によるコンテンツ切り替えという
     ロジック面の回帰は検出できる。`ReaderChart`(recharts使用)は`vi.mock`で差し替え、
     チャート自体の描画はテスト対象外とする(サードパーティchartライブラリの内部実装は
     テストしない、YAGNI)。
   - `src/app/trpg/ccfolia-grep/page.tsx` — ファイルアップロード→キャラクター名選択→
     成功度チェックボックス→Submit→結果テキスト表示、という一連の実際に近い操作フローを
     検証する。`convert-utils`/`grep-utils`をコンポーネント経由で使う経路のテストになる。

### CI統合

- `.github/workflows/ci.yml` の `Lint` ステップと `Build` ステップの間に `Test` ステップ
  (`pnpm test`)を追加する。
- `package.json` に `"test": "vitest run"` を追加する(watchモードが必要な場合は
  ローカルで `pnpm exec vitest` を直接使う。専用scriptは今回追加しない、YAGNI)。

## 影響範囲

- 追加: `vitest.config.ts`、`vitest.setup.ts`、各対象ファイルに対応する `*.test.ts(x)`
- 変更: `package.json`(devDependencies・`test`スクリプト追加)、
  `.github/workflows/ci.yml`(Testステップ追加)、`CLAUDE.md`(テスト方針の追記)
- 追加: `docs/adr/0008-adopt-testing-trophy-and-vitest.md`(本Planの技術判断の記録)
- 既存コンポーネント・ユーティリティの実装自体への変更は無い(テスト追加のみ)。

## 代替案と選択理由

| 検討した案 | 不採用の理由 |
| --- | --- |
| Jest (`next/jest`) | Next.js公式のより手厚い統合があるが、Vitestに比べ起動・実行速度で劣り、ESM周りの設定も煩雑になりがち。個人開発の反復速度を優先しVitestを採用。 |
| happy-dom | 高速だがDOM API網羅性がjsdomに劣り、`FileReader`等を使う`ccfolia-grep`のテストで挙動差が出るリスクがある。まずはjsdomで様子を見る。 |
| Playwright等のE2E | テスティングトロフィー最上層。spec.mdの通り今回はスコープ外。 |
| スナップショットテスト | DOM構造の些細な変更で壊れやすく「意味のある回帰検知」との相性が悪いため、個別のアサーションを書く方針にする。 |
| `__tests__/` ディレクトリでのテスト集約 | ファイル数が少ないうちはテスト対象との対応が分かりにくくなるデメリットの方が大きいと判断し、コロケーション配置を選んだ。 |

大きな技術判断(テストランナー・戦略の採用)のため、`docs/adr/0008-adopt-testing-trophy-and-vitest.md`
にADRを追加し、本Planからもリンクする。

## リスク・懸念

- `next/image` のモックはNext.jsのバージョンアップで挙動が変わる可能性がある
  (メジャーアップデート時に確認が必要)。
- recharts + jsdom の相性問題(`ResizeObserver`)は今回`ReaderChart`をモックすることで
  回避するが、将来チャート自体のロジックをテストしたくなった場合は別途対応が要る。
- CharacterCardのフリップ時に発生したようなCSSアニメーション由来の描画バグは、
  今回導入する結合テストの層では検出できない(ユーザーとの合意済みの既知の限界)。

## この Plan では扱わないこと

- E2E/ビジュアルリグレッションテストの導入(spec.mdの「やらないこと」を参照)。
- `CharacterCard`/`ccfolia-grep`以外のコンポーネントへのテスト追加(`/tasks`以降、
  必要に応じて別途追加していく)。
- カバレッジ計測ツール(`@vitest/coverage-v8`等)の導入。数値目標を設定しない方針
  (spec.md「やらないこと」)のため今回は入れない。
