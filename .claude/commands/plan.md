---
description: spec.md をもとに技術方針(plan.md)を作成する
---

対象/補足: $ARGUMENTS

Spec-Driven Development の第2ステップです。既存の spec を実装可能なレベルの技術方針に
落とし込んでください。

1. 対象の spec を特定する(`$ARGUMENTS` で指定がなければ、`specs/` 配下で最も新しく作られた
   spec.md、または直近の会話で作成した spec を使う)。
2. `specs/<番号>-<slug>/spec.md` を読み、要件・受け入れ条件・制約を把握する。
3. リポジトリの既存実装([CLAUDE.md](../../CLAUDE.md) のディレクトリ構成・コーディング規約)を
   踏まえ、`.specify/templates/plan-template.md` をベースに
   `specs/<番号>-<slug>/plan.md` を作成する。
   - 使用するコンポーネント/データ構造、追加・変更するファイル、代替案と選択理由を書く。
   - 既存ライブラリ(recharts, react-markdown, lucide-react 等)で足りるなら新規依存の追加は
     避ける。新規依存を追加する場合はその理由を明記する。
   - 影響範囲が大きい技術判断(依存の入れ替え、データ構造の破壊的変更など)は
     `docs/adr/` に ADR を追加することも検討し、plan.md からリンクする。
4. 作成した plan.md の内容を要約してユーザーに提示し、`/tasks` に進めるか確認する。
