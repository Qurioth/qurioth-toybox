# Feature Specification: テスティングトロフィー戦略に基づくテスト基盤の導入

**Feature Branch**: `001-vitest-testing-trophy`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "テスティングトロフィー戦略に基づくテスト基盤(Vitest)の導入。リファクタリングを安全に行うための回帰検知が目的。対象は既存のユーティリティ関数(grep-utils.ts, convert-utils.ts等)とロジックを持つコンポーネント(CharacterCard, ccfolia-grep等)。Vitest + React Testing Libraryを想定、E2Eは当面スコープ外(将来的にPlaywright等を検討)。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 既存ロジックのユニットテスト (Priority: P1)

サイトオーナー(開発者)として、CCFOLIAのダイスログ解析・変換を行う既存のユーティリティ関数
(`grep-utils.ts`、`convert-utils.ts`)に対するユニットテストが欲しい。リファクタリング時に
これらの複雑な正規表現・文字列処理ロジックを壊していないことを、ブラウザで手動確認せずに
確信できるようにするため。

**Why this priority**: これらの関数は正規表現による文字列処理が中心で複雑度が高く、かつ
`ccfolia-grep`ページの中核ロジックである。最も回帰リスクが高い箇所であり、単体で価値を
持つ最小の安全網になる。

**Independent Test**: `pnpm test` を実行し、`grep-utils.ts`/`convert-utils.ts` に対する
テストが存在し、既存の入出力を検証してパスすることで、他のテストが無くても単独で
「ダイスログ解析ロジックが壊れていない」という価値を提供できる。

**Acceptance Scenarios**:

1. **Given** CCFOLIAのダイスログのサンプルHTML文字列、**When** `convertDicelog` に渡す、
   **Then** 既存の実装通りに `DiceLog[]`(tab/name/content)へ変換される。
2. **Given** 変換済みの `DiceLog[]` とキャラクター名・成功度リスト、**When** `grepDicelog` に
   渡す、**Then** 該当する行だけが抽出されたMarkdown形式のテキスト配列が返る。
3. **Given** 複数キャラクターを含む `DiceLog[]`、**When** `grepCharactername` に渡す、
   **Then** 重複を除いた五十音/アルファベット順のキャラクター名一覧が返る。

---

### User Story 2 - 状態を持つコンポーネントの結合テスト (Priority: P2)

サイトオーナーとして、状態やユーザー操作ロジックを持つコンポーネント(`CharacterCard`の
表裏切り替え、`ccfolia-grep`ページのファイルアップロード〜結果表示のフロー)に対する
結合テストが欲しい。UIの見た目ではなく、クリック/キーボード操作によって正しい状態・
コンテンツに切り替わることを、実際の入力に近いデータで確認できるようにするため。

**Why this priority**: User Story 1 だけでは、コンポーネント側の状態管理(クリックした時に
正しく表示が切り替わるか等)の回帰は検知できない。直近でも `CharacterCard` の表示切り替えで
実際に不具合が発生しており、ロジック面の回帰検知の価値は高い。

**Independent Test**: `CharacterCard` をレンダリングし、クリック/キーボード操作
(Enter・Space)で表面(ステータス)と裏面(技能表・バックストーリー)の表示コンテンツが
切り替わることを検証するテストが単独でパスすることで確認できる。

**Acceptance Scenarios**:

1. **Given** `CharacterCard` が表面(ステータス)を表示している状態、**When** カードを
   クリックする、**Then** 裏面(技能表・バックストーリー)の内容が表示される。
2. **Given** `CharacterCard` にキーボードフォーカスが当たっている状態、**When** Enterまたは
   Spaceキーを押す、**Then** クリックと同じく表裏が切り替わる。
3. **Given** `ccfolia-grep` ページでCCFOLIAログファイルをアップロードした状態、**When**
   キャラクター名・成功度を選択してSubmitする、**Then** 該当する行だけを含む結果テキストが
   表示される。

---

### User Story 3 - CIでの自動テスト実行 (Priority: P3)

サイトオーナーとして、テストがCIで自動実行されてほしい。プルリクエストを作成した時点で
テストの成否が分かり、レビュー・マージ前に回帰に気づけるようにするため。

**Why this priority**: User Story 1・2 でテストが書かれていても、手元で実行し忘れれば
意味が薄れる。CI連携によって初めて「書いたテストが継続的に効く」状態になるが、
テスト本体(US1・US2)が無ければCI連携単体では価値が無いため優先度は最も低い。

**Independent Test**: テストを1つでも壊すコミットをpushし、CIのTestステップが失敗して
ワークフロー全体が失敗することを確認する。

**Acceptance Scenarios**:

1. **Given** テストが全てパスする状態のブランチ、**When** pushまたはpull requestを作成する、
   **Then** CIの `Test` ステップが実行され成功する。
2. **Given** いずれかのテストが失敗するように変更したブランチ、**When** pushする、
   **Then** CIの `Test` ステップが失敗し、ワークフロー全体が失敗として報告される。

---

### Edge Cases

- CCFOLIAのダイスログHTMLが想定外の形式(タグの欠落、空文字列)だった場合、
  `convertDicelog`/`grepDicelog` は現状の実装通りの挙動(エラーを投げず、空や不完全な
  結果を返す)をそのままテストで固定する。挙動自体の変更は本featureのスコープ外。
- `CharacterCard` のフリップアニメーション中(`classChanging` が `true` の間)に再度
  クリック/キー操作した場合の挙動は、既存の実装通りをテストで固定する。
- `ccfolia-grep` ページでファイル未選択のままSubmitした場合、既存の実装通り
  (何も処理されない、ではなく実際には空の見出し付き結果(`**` + `**` + コードブロック)が
  表示される)であることを確認する。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは `pnpm test` コマンドでテストスイートを実行できなければならない。
- **FR-002**: システムは `grepDicelog` / `grepCharactername`(`grep-utils.ts`)の既存の
  入出力の振る舞いを検証するユニットテストを持たなければならない。
- **FR-003**: システムは `convertDicelog`(`convert-utils.ts`)の既存の入出力の振る舞いを
  検証するユニットテストを持たなければならない。
- **FR-004**: システムは `CharacterCard` のクリック/キーボード操作による表裏切り替えを
  検証する結合テストを持たなければならない。
- **FR-005**: システムは `ccfolia-grep` ページのファイルアップロード→選択→実行→結果表示
  という一連の操作を検証する結合テストを持たなければならない。
- **FR-006**: CIはpush/pull request時に自動でテストを実行し、失敗時にワークフロー全体を
  失敗させなければならない。
- **FR-007**: 「何をテストし、何をテストしないか」というテスト方針がドキュメントとして
  記録されていなければならない。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: サイトオーナーは `pnpm test` を1回実行するだけで、ダイスログ解析ロジックと
  `CharacterCard`/`ccfolia-grep` の主要な操作フローの正しさを確認できる。
- **SC-002**: ダイスログ解析ロジックの破壊的な変更が、実装変更後にテストを1回実行する
  だけで検知できる。
- **SC-003**: プルリクエスト作成時に、CIのテスト結果を見るだけで(全ページを手動で
  ブラウザ確認しなくても)主要ロジックの回帰有無が分かる。

## Assumptions

- E2Eテスト・ビジュアルリグレッションテストは本featureのスコープ外(将来的に
  Playwright等の導入を別途検討する)。
- テストカバレッジの数値目標(100%等)は設定しない。個人開発のスコープに見合わない
  重厚化を避けるため。
- 既存コードの実装自体(ロジック・UI)は変更しない。今回はテスト基盤とテストの追加のみで、
  リファクタリング本体は別featureで行う。
- テスト対象は `grep-utils.ts` / `convert-utils.ts` / `CharacterCard` / `ccfolia-grep`
  ページに限定する。他のコンポーネント・ユーティリティへの拡大は本featureのスコープに
  含めない(必要になれば別featureで追加する)。
