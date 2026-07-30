# specs/

`/specify` で作成した仕様(spec.md)、`/plan` で作成した設計(plan.md)、`/tasks` で作成した
タスク一覧(tasks.md)を機能ごとに配置するディレクトリ。

```
specs/
  0001-<slug>/
    spec.md
    plan.md
    tasks.md
```

- 番号は連番、`<slug>` は機能を表す短い kebab-case の名前。
- テンプレートは `.specify/templates/` を参照。
- 開発の進め方は [CLAUDE.md](../CLAUDE.md) の「開発フロー」節、原則は
  [.specify/memory/constitution.md](../.specify/memory/constitution.md) を参照。
