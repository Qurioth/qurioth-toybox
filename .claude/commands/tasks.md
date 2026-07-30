---
description: plan.md を実行可能なタスク一覧(tasks.md)に分解する
---

対象/補足: $ARGUMENTS

Spec-Driven Development の第3ステップです。plan.md を、順番に実行できる粒度のタスクに
分解してください。

1. 対象の plan を特定する(`$ARGUMENTS` で指定がなければ、直近で作成/参照した plan.md を使う)。
2. `specs/<番号>-<slug>/plan.md` と対応する `spec.md` を読む。
3. `.specify/templates/tasks-template.md` をベースに `specs/<番号>-<slug>/tasks.md` を作成する。
   - 各タスクは、対象ファイル/ディレクトリが分かる粒度にする(1タスク=だいたい1コミット相当)。
   - 依存関係があるタスクは順番を明示し、なければ並行実施可能と分かるようにする。
   - 完了の定義に `yarn lint` の実行と、実際にブラウザで動作確認することを含める。
4. tasks.md の内容を要約してユーザーに提示する。実装(`/implement` 相当)に進んでよいか確認して
   から着手する。
