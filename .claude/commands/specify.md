---
description: 新しい機能の仕様(spec.md)を作成する
---

ユーザーの依頼: $ARGUMENTS

これは Spec-Driven Development の最初のステップです。実装方法ではなく「何を・なぜ作るか」を
明確にしてください。

1. `specs/` ディレクトリを確認し、次に使う番号(既存の最大番号+1、4桁)と、依頼内容から
   短い kebab-case の slug を決める。
2. `specs/<番号>-<slug>/spec.md` を `.specify/templates/spec-template.md` をベースに作成する。
   - 背景・目的、スコープ(やる/やらない)、ユーザーストーリー、受け入れ条件を埋める。
   - 実装方法(使用ライブラリ、コンポーネント設計、ファイル構成)は書かない。それは `/plan` の
     役割。
   - `.specify/memory/constitution.md` と [CLAUDE.md](../../CLAUDE.md) の慣習を踏まえる。
   - ユーザーの依頼だけでは要件が曖昧な場合は、想定を書いた上で「オープンな疑問」節に残すか、
     ユーザーに確認する。
3. 作成した spec.md の内容を要約してユーザーに提示し、次に `/plan` に進めるか確認する。
