# specs/

`/speckit-specify` で作成した仕様(spec.md)、`/speckit-plan` で作成した設計(plan.md)、
`/speckit-tasks` で作成したタスク一覧(tasks.md)を機能ごとに配置するディレクトリ。

```
specs/
  001-<slug>/
    spec.md
    plan.md
    tasks.md
    (research.md / data-model.md / contracts/ / quickstart.md — 該当する場合のみ)
```

- 番号は spec-kit公式CLIのスクリプトが既存ディレクトリを見て自動採番する(3桁ゼロ埋め)。
  `specs/0001-introduce-testing/` は手動再現版時代に4桁で作ったもので、以降は3桁になる
  (混在するが実害は無い)。
- `<slug>` は機能を表す短い kebab-case の名前。
- テンプレートは `.specify/templates/`(公式spec-kitのテンプレート)を参照。
- 開発の進め方は [CLAUDE.md](../CLAUDE.md) の「開発フロー」節、原則は
  [.specify/memory/constitution.md](../.specify/memory/constitution.md) を参照。
