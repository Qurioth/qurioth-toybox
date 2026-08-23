# specs/

画面ごとの仕様(spec.md)・設計(plan.md)・タスク(tasks.md)を置くディレクトリ。
spec の単位を「機能ごと」ではなく「画面ごと」にする経緯は
[ADR-0013](../docs/adr/0013-spec-per-screen.md) を参照。

```
specs/
  001-<画面slug>/
    spec.md    # その画面の現行仕様(改修のたびに更新する)
    plan.md
    tasks.md
    (research.md / data-model.md / contracts/ / quickstart.md — 該当する場合のみ)
```

## 運用ルール

- 1ディレクトリ = 1画面(App Router のルート)。`src/app/trpg/ccfolia-grep/` に対して
  `specs/NNN-ccfolia-grep/` のように対応させる。
- 既存画面を改修するときは新しいディレクトリを作らず、その画面のディレクトリの
  `spec.md` を更新する。`spec.md` は「今どういう画面か」を表す現行仕様として維持する。
- 全画面分を先回りして書き揃えることはしない。実際に改修する画面から作る
  ([constitution.md](../.specify/memory/constitution.md) 原則1・5)。
- 画面に紐づかない横断的な判断(テスト戦略、ツールチェイン、CI構成など)は spec ではなく
  [docs/adr/](../docs/adr/) にADRとして記録する。
- 番号は spec-kit公式CLIのスクリプトが既存ディレクトリを見て自動採番する(3桁ゼロ埋め)。
- `<画面slug>` はその画面を表す短い kebab-case の名前(ルートのセグメント名を使うとよい)。
- テンプレートは `.specify/templates/`(公式spec-kitのテンプレート)を参照。
- 開発の進め方は [CLAUDE.md](../CLAUDE.md) の「開発フロー」節、原則は
  [.specify/memory/constitution.md](../.specify/memory/constitution.md) を参照。
