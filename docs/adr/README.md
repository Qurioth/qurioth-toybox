# Architecture Decision Records (ADR)

このディレクトリには、本プロジェクトの重要な技術的・設計的な意思決定を記録する。

## いつ書くか

- 後から「なぜこうしたのか」を思い出せなくなりそうな判断をしたとき
- 複数の選択肢の中から一つを選び、他を捨てた理由を残したいとき
- 影響範囲が広い技術選定・アーキテクチャ変更を行うとき

typo修正や依存パッケージの更新など、影響の小さい変更には不要。

## 書き方

1. `docs/adr/0001-record-architecture-decisions.md` をコピーしてテンプレートとして使う。
2. ファイル名は `NNNN-短い-タイトル.md`(4桁連番 + kebab-case)。
3. ステータスは `Proposed` / `Accepted` / `Deprecated` / `Superseded by ADR-000X` のいずれか。
4. 一度 `Accepted` になった ADR の本文は基本的に変更しない。判断が変わったら新しい ADR を書き、
   古い ADR のステータスを `Superseded by ADR-000X` に更新する。

## 一覧

| ID | タイトル | ステータス |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Architecture Decision Recordを記録する | Accepted |
| [0002](0002-adopt-spec-driven-development.md) | Spec-Driven Development (spec-kit) を導入する | Accepted |
| [0003](0003-drop-renovate.md) | Renovateによる依存関係自動更新を廃止する | Accepted |
| [0004](0004-migrate-yarn-to-pnpm.md) | パッケージマネージャをyarnからpnpmに移行する | Accepted |
| [0005](0005-add-ci-workflow.md) | lint/buildを実行するCIワークフローを追加する | Accepted |
| [0006](0006-migrate-eslint-to-biome.md) | ESLint (next lint) からBiomeに移行する | Accepted |
