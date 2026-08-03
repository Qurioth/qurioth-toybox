# Quickstart: テスト基盤の動作確認

このfeature実装後、以下の手順で一連の受け入れ条件を手元で確認できる。

## 前提

- `pnpm install` 済みであること(Vitest関連の依存が `package.json` に追加されている)。

## 1. テストスイートを実行する

```bash
pnpm test
```

**期待される結果**: `grep-utils.ts` / `convert-utils.ts` のユニットテスト、
`CharacterCard` / `ccfolia-grep` ページの結合テストがすべてパスする
(spec.md の User Story 1・2 に対応)。

## 2. テストが回帰を検知することを確認する(任意)

`src/utils/grep-utils.ts` の `grepDicelog` の実装を一時的に壊す(例: 条件分岐を反転させる)
などして `pnpm test` を再実行し、対応するテストが失敗することを確認する。確認後は変更を
元に戻す。

**期待される結果**: 壊した箇所に対応するテストが失敗し、原因箇所が分かる。

## 3. CIでの自動実行を確認する(任意、User Story 3)

このブランチをpushし、GitHub ActionsのCI(`.github/workflows/ci.yml`)の `Test` ステップが
実行され成功することを確認する。

## 4. ブラウザでの実機確認

`pnpm dev` でローカルサーバーを起動し、以下のページが従来通り動作することを目視で確認する
(テスト追加によって実装は変更していないため、表示・挙動に変化が無いことの確認)。

- `/trpg/charaeno-chart/sample-character` — `CharacterCard` のクリック/キーボード操作での
  表裏切り替え
- `/trpg/ccfolia-grep` — ファイルアップロード→選択→実行→結果表示
