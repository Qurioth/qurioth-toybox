# 0009. spec-kit 公式CLIを導入し、手動再現していたSDD構成を置き換える

## ステータス

Accepted

## 日付

2026-07-31

## コンテキスト

[ADR-0002](0002-adopt-spec-driven-development.md) では、公式の `specify` CLI が
Python 3.11+ を要求し開発機には Python 3.10 しか無かったため、spec-kit と同等の
ディレクトリ構成・テンプレート・Claude Code用スラッシュコマンド(`.claude/commands/specify.md`
等)を手動で再現していた。同ADRには「公式CLIが使える環境になったら、手動再現した構成を
公式CLI管理下に置き換えることを検討する」と明記していた。

今回、`uv tool install specify-cli` によって spec-kit CLI (v0.15.0) を導入した。
`uv` はツールごとに必要なPython(3.11+)を自動的に用意するため、システムのPython
バージョン(3.10.6のまま)に関係なく利用できることを確認した。

導入前に一時ディレクトリで `specify init --here --force` の影響を検証したところ、
以下が判明した。

- `.specify/memory/constitution.md`(このプロジェクト固有の開発原則)は上書きされず
  保持される。
- `.specify/templates/{spec,plan,tasks}-template.md` は公式の英語テンプレートに
  置き換わる。ユーザーストーリーの優先度付け(P1/P2/P3)、`FR-001`のような機能要件ID、
  `SC-001`のような測定可能な成功基準、`[NEEDS CLARIFICATION]`マーカーによる曖昧箇所の
  対話的解消など、手動再現版より遥かに厚い構成になる。
- `.claude/skills/speckit-*/SKILL.md` として `/speckit-specify` `/speckit-plan`
  `/speckit-tasks` `/speckit-implement` `/speckit-converge` などが追加される。
  手動再現版には無かった実装自動化(`/speckit-implement`)や、実装済みコードと
  spec/plan/tasksの差分から残作業を棚卸しする機能(`/speckit-converge`)を含む。
  スキルの構造(P1/P2/P3等)はSKILL.mdのプロンプト自体に書かれているため、
  テンプレートファイルだけ簡易な日本語版に差し替えても出力は公式構造に寄る
  (テンプレートとスキットは実質セットで採用するかどうかの二択になる)。
- `specs/` 配下の機能番号は、公式CLIのスクリプト(`create-new-feature.sh`)が
  既存ディレクトリの最大番号を検出して自動採番する。3桁ゼロ埋め(`NNN`)が既定のため、
  既存の `specs/0001-introduce-testing`(4桁)以降は `specs/002-...` のように
  桁数が変わる。実害はないため既存ディレクトリの改名はしない。

## 決定

- spec-kit公式CLI(`specify` コマンド、`uv tool install specify-cli` で導入)を正式に
  採用する。
- 手動再現していた `.claude/commands/{specify,plan,tasks}.md` は削除し、
  `.claude/skills/speckit-*` に一本化する。今後は `/speckit-specify` → `/speckit-plan`
  → `/speckit-tasks` → (必要なら `/speckit-clarify` `/speckit-analyze` `/speckit-checklist`)
  → `/speckit-implement` の流れを使う。
- `.specify/memory/constitution.md` はそのまま維持する(公式CLIも上書きしない)。
- `.specify/templates/*` は公式テンプレートをそのまま使う。英語構成(P1/P2/P3の
  ユーザーストーリー、FR-XXX/SC-XXX)になるが、記述内容(実際に書く文章)は
  引き続き日本語で書いてよい。テンプレートの見出し構造だけ公式のものに従う。
- 本ADRを機に、[ADR-0002](0002-adopt-spec-driven-development.md) のステータスを
  `Superseded by ADR-0009` に更新する(本文は変更しない)。
- `specs/0001-introduce-testing/` など既に手動再現版で作成済みのfeatureドキュメントは
  そのまま残し、遡って公式テンプレート形式へ書き直すことはしない。

## 影響・トレードオフ

- 良い点: `/speckit-implement`・`/speckit-converge`など、手動再現版には無かった
  自動化が使える。テンプレートの追従・更新を手動でメンテナンスする必要がなくなる
  (公式CLIのアップデートで追従できる)。
- コスト: spec/plan/tasksの構成が英語かつ大幅に厚くなる(P1/P2/P3、FR-XXX/SC-XXX、
  品質チェックリスト、`[NEEDS CLARIFICATION]`の対話的解消など)。個人開発の
  「おもちゃ箱」サイトの規模に対しては過剰に感じる場面が出てくる可能性があり、
  運用しながら重すぎると判断すれば見直す。
- `uv`(Python製ツールを隔離環境で管理するツール)という新しい外部依存が増える。
  ただし `specify` コマンドの実行にのみ使い、アプリケーションのビルド・実行には
  関与しない。
