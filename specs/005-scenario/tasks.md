---

description: "シナリオ詳細画面の構造化表示の作業一覧"
---

# Tasks: シナリオ詳細画面の構造化表示

**Input**: Design documents from `/specs/005-scenario/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/](./contracts) / [quickstart.md](./quickstart.md)

**Tests**: 含める。このリポジトリはテスティングトロフィー(ADR-0008)を採っており、テストは
完了条件の一部。解釈ロジック(純粋関数)はユニットテスト、表示は React Testing Library の
結合テスト、実データは適合テスト([research.md](./research.md) R8)で確かめる。表示のテストは
実シナリオではなく、テスト内に書いた小さな Markdown を使う。

**Organization**: spec.md のユーザーストーリーは画面全体の現行仕様を表す。US1(一覧の
絞り込み)は既に動いている機能で、今回の作業では「壊さないこと」が目標なので、実装フェーズは
設けない(Phase 1 と最終確認で退行を確かめる)。今回作るのは US2〜US7。

構造化表示は、移行済み(`structured: true`)のシナリオがないと画面で確かめられない。そのため
パイロットとして parasite を US2 のフェーズで構造化表示へ切り替え、以降のフェーズで部品を
足すたびに parasite で確認する([plan.md](./plan.md) 実装の段階 5)。parasite 以外の 10 本の
移行は最終フェーズで 1 本ずつ行う。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US2〜US7)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ。ソースは `src/` 配下、テストは対象と同じディレクトリにコロケーション
(`*.test.ts(x)`)。`describe` / `it` / `expect` は `vitest` から明示 import する。詳細画面専用の
部品は `src/app/trpg/scenario/[id]/` に置く([plan.md](./plan.md) Project Structure)。

---

## Phase 1: Setup

**Purpose**: 作業ブランチと、退行を判定するための基準を用意する

- [X] T001 作業ブランチ `structured-scenario-view` を master から切る(作成済み。spec・plan のコミットもこのブランチにある)
- [ ] T002 `pnpm install` の後 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、変更前の状態がすべて通ることを確認する。以降の退行判定はこの結果を基準にする

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのストーリーが使う土台を作る。本文を見出しで区画に分ける関数、移行済みの印、
従来表示の切り出しの 3 つ。**このフェーズでは利用者から見える振る舞いを変えない**(どの
シナリオにもまだ `structured` を付けない)。

**⚠️ CRITICAL**: Phase 3 以降はこのフェーズの完了なしに開始できない

- [ ] T003 `src/data/scenario/scenario-list.ts` の `Scenario` 型に、任意項目 `structured?: true` を追加し、`Scenario` 型を `export` する。値はまだどのエントリにも付けない([data-model.md](./data-model.md) 登録データ、[research.md](./research.md) R5)
- [ ] T004 [P] `src/app/trpg/scenario/[id]/page.tsx` の `ReactMarkdown` による本文描画(`img` の差し替えを含む)を、新規ファイル `src/app/trpg/scenario/[id]/LegacyScenarioBody.tsx` の `LegacyScenarioBody`(props: `markdown: string`)へ切り出す。page.tsx はこれを呼ぶだけにする。権利表記の描画は page.tsx に残す(表示形式によらず付けるため。FR-011)。見た目・DOM は変えない
- [ ] T005 [P] `src/utils/scenario-structure-utils.ts` を新規作成する。[data-model.md](./data-model.md) の `Heading` / `Subsection` / `Section` / `Chapter` / `ScenarioDocument` / `ChapterKind` / `SectionKind` の型と、`splitScenarioMarkdown(markdown: string): ScenarioDocument` を実装する。
  - 行単位で走査する。行頭が ` ``` ` のフェンスの開閉を追跡し、フェンス内の `#` 行は見出しにしない。
  - H1 より前はサブタイトル領域(原文を保持し、`_…_` の 1 行から `subtitle` を取り出す)、H1 から最初の `##` までが `lead`。
  - `####` より深い見出し(`#####`)は区切らず、`Subsection.body` に Markdown のまま含める。
  - `Heading` には見出し行の原文を保持する。`text` / `kana` は末尾の ` (…)` を分けて作る。`id` は空白を `-` に置換し、文書内で重複したら `-2`, `-3` … を付ける。
  - [research.md](./research.md) R2
- [ ] T006 `src/utils/scenario-structure-utils.ts` に種別判定を追加する。`##` の `text` から `ChapterKind`、`###` から `SectionKind` を決める。判定の順と条件は [data-model.md](./data-model.md) の ChapterKind / SectionKind の表のとおり([research.md](./research.md) R4。T005 に依存)
- [ ] T007 `src/utils/scenario-structure-utils.test.ts` を新規作成する(T006 に依存)。次をテストする。
  - サブタイトル・タイトル・リードの切り出し
  - フェンス内の `# …` 行が見出しにならないこと
  - `#####` が `Subsection.body` に残ること
  - `kana` の分離(`沖嶋 深月 (オキシマ ミツキ)` / `潮上灯台跡 (夜間)`)
  - `id` の重複時の連番
  - 各 `ChapterKind` / `SectionKind` の判定(`主な NPC` 直下は `character`、`#### ステータス` を持つクライマックスの `###` も `character`、`ED1 【…】` は `ending`、`その他報酬 (任意)` は `reward`、`『…』` は `tome`)
  - **網羅性**: 分割結果を [data-model.md](./data-model.md)「網羅性の不変条件」の順に連結すると入力と一致すること。再構成関数はテストファイル内のヘルパーとして書く
- [ ] T008 `src/data/scenario/scenario-list.test.ts` を新規作成し、登録済みの全 12 シナリオの `markdown` について T007 の網羅性(再構成した文字列が入力と一致)を確かめるテストを書く。再構成ヘルパーは T007 と共有するため、`src/utils/scenario-structure-utils.ts` から `restoreScenarioMarkdown(doc)` として export してよい(T007 に依存)
- [ ] T009 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` がすべて通り、`pnpm dev` で任意のシナリオ詳細が T002 時点と同じ見た目であることを確認する

**Checkpoint**: 解釈の土台ができ、全 12 本で行の欠落がないことが保証された。画面は変わっていない

---

## Phase 3: User Story 2 - シナリオを開いて概要と本文を読む (Priority: P1) 🎯 MVP

**Goal**: 移行済みのシナリオを、冒頭の概要と章立てに沿った共通の見せ方で表示する。未移行の
シナリオは従来どおり表示する。

**Independent Test**: parasite を開くと冒頭に対応システム・人数・プレイ時間・リードがまとまって
示され、続けて章が本文の順に並ぶ。queen-of-the-sea や未移行のシナリオは従来の表示のまま
([contracts/detail-view.md](./contracts/detail-view.md) 1〜2 章)。

### Tests for User Story 2

- [ ] T010 [P] [US2] `src/app/trpg/scenario/[id]/StructuredScenario.test.tsx` を新規作成する。テスト内に、サブタイトル・H1・リード・`## GM 向け情報`・`## 主な NPC`・場面の `##` 2 つ・`## クライマックス`・`## シナリオ終了` を持つ小さな Markdown を書き、次を確かめる。
  - 冒頭に `system`・人数・プレイ時間・リードの文が出る。人数・時間の上下限が同じなら単一の値で表示される
  - 章の見出しが本文の順に `heading` ロールで並ぶ
  - 各見出しに data-model の `id` が付く

  (T013 の実装前に書き、失敗することを確かめる)
- [ ] T011 [P] [US2] `src/app/trpg/scenario/[id]/LegacyScenarioBody.test.tsx` を新規作成し、見出し・表を含む Markdown が整形表示されることを確かめる(切り出しの退行確認)

### Implementation for User Story 2

- [ ] T012 [P] [US2] `src/app/trpg/scenario/[id]/ScenarioMarkdown.tsx` を新規作成する。区画の Markdown 文字列を `react-markdown` + `remark-gfm` で描画する共通部品で、以降のストーリーで `components` を足していく土台にする。この時点の `components` は 2 つ。
  - `table`: `overflow-x-auto` の枠で包む([research.md](./research.md) R7)
  - `img`: 本文中の画像を回り込ませずに最大幅に収める

  `prose dark:prose-dark` を付ける
- [ ] T013 [US2] `src/app/trpg/scenario/[id]/ScenarioOverview.tsx` と `src/app/trpg/scenario/[id]/StructuredScenario.tsx` を新規作成する(T012 に依存)。
  - `StructuredScenario` は props で `Scenario`(T003)を受け取り、`splitScenarioMarkdown` の結果を描画する。冒頭に `ScenarioOverview`、続けて章の順に、`##`/`###`/`####` の見出し(`id` と、固定ヘッダーに隠れないための `scroll-mt-24`)と `ScenarioMarkdown` による各 `body` を並べる。
  - `ScenarioOverview` は次を表示する。
    - サブタイトル・タイトル
    - `system`
    - 人数・プレイ時間。`formatRange`(`src/utils/scenario-filter.ts`)で表記し、上下限が同じなら単一の値にする
    - `lead`(`ScenarioMarkdown` で描画)

    アイコンは一覧の `ScenarioCard.tsx` と同じ lucide-react のものを使う
  - 人物・エンディングなど種別ごとの見た目はまだ付けず、汎用の区画として表示する
- [ ] T014 [US2] `src/app/trpg/scenario/[id]/page.tsx` で、`scenario?.structured` が真なら `StructuredScenario`、それ以外は `LegacyScenarioBody` を描画するよう分岐する。権利表記とタブ名(`generateMetadata`)は両方の形式で従来どおり付ける。存在しない ID では従来どおり空の本文になる(FR-010〜FR-013。T004・T013 に依存)
- [ ] T015 [US2] パイロットとして `src/data/scenario/markdown/parasite.md` を [contracts/structured-markdown.md](./contracts/structured-markdown.md) に合わせて整え、`src/data/scenario/scenario-list.ts` の `Parasite` に `structured: true` を付ける。文言・数値は変えない(FR-028)。手直しの内容は次のとおり。
  - `## シナリオ終了報酬` の見出し行を削除し、ED1〜ED3 と `### その他報酬 (任意)` を直前の `## シナリオ終了` の下に入れる(contracts 1 章)
  - 「膨らんだ女 (怪物の姿)」のステータスの `HP` / `MP` を、規約の `耐久力` / `マジック・ポイント` に直す(README 5 章)
- [ ] T016 [US2] T010・T011 が通ることを確認し、`pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 1・2(目次以外)・6・9・10・11 を確かめる

**Checkpoint**: parasite が概要付きの共通の見せ方で読め、他のシナリオは従来どおり

---

## Phase 4: User Story 3 - セッション中に目的の箇所へすぐ移動する (Priority: P1)

**Goal**: 目次から章・人物・エンディングへ 2 操作以内で移動できる(FR-018 / SC-005)。

**Independent Test**: parasite の本文の途中から、目次で任意の場面・人物・ED を選ぶと、その見出しが
ヘッダーに隠れずに表示される。幅 375px では右下の「目次」ボタンから開いて同じ移動ができ、
選ぶとパネルが閉じる([contracts/detail-view.md](./contracts/detail-view.md) 3 章)。

### Tests for User Story 3

- [ ] T017 [P] [US3] `src/utils/scenario-structure-utils.test.ts` に `buildScenarioToc` のテストを追加する。全章が並ぶこと、章の下に `character` / `ending` / `reward` の `###` だけが入れ子になり `topic` / `tome` は載らないこと、`id` が見出しの `id` と一致することを確かめる
- [ ] T018 [P] [US3] `src/app/trpg/scenario/[id]/ScenarioToc.test.tsx` を新規作成する。次を確かめる。
  - 名前が「目次」の `navigation` があり、各項目が `#<id>` へのリンクになっている
  - 「目次」ボタンが `aria-expanded` を持ち、押すとパネルが開く
  - パネル内の項目を選ぶとパネルが閉じる

### Implementation for User Story 3

- [ ] T019 [US3] `src/utils/scenario-structure-utils.ts` に `buildScenarioToc(doc: ScenarioDocument): TocItem[]` を実装する。`TocItem` の形は [data-model.md](./data-model.md)「目次」、載せる範囲は [research.md](./research.md) R6
- [ ] T020 [US3] `src/app/trpg/scenario/[id]/ScenarioToc.tsx` を新規作成する。先頭に `"use client"` を付け、props で `TocItem[]` を受け取る。
  - `lg` 以上: `sticky`(ヘッダーの高さ分の `top`)で常に見える `<nav aria-label="目次">` を出す。
  - `lg` 未満: 画面右下に固定した「目次」ボタン(`aria-expanded`)を出し、押すと `@headlessui/react` の `Dialog` で目次を開く。項目を選ぶとパネルを閉じる。`Dialog` の使い方は `src/components/Header.tsx` のモバイルメニューに合わせる。

  UI 文言(「目次」など)は日本語にする(T019 に依存)
- [ ] T021 [US3] `src/app/trpg/scenario/[id]/StructuredScenario.tsx` を、`lg` 以上で「本文 + 右側(または左側)の目次」の 2 カラム、`lg` 未満で 1 カラムのレイアウトにして `ScenarioToc` を置く。幅 375px でページに横スクロールが出ないことを確かめる(T020 に依存)
- [ ] T022 [US3] T017・T018 が通ることを確認し、`pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 2・7 を parasite で確かめる

**Checkpoint**: 目次で parasite の任意の章・人物・ED へ移動できる

---

## Phase 5: User Story 4 - NPC・神話生物の情報を一目で確認する (Priority: P1)

**Goal**: 人物を、立ち絵・プロフィール・能力値の格子・技能・セリフ例などを持つカードで表示する。
登場する章によらず同じ見せ方にする(FR-019 / FR-020)。

**Independent Test**: parasite の主な NPC と、クライマックス・シナリオ終了の神話生物が同じカードで
表示され、能力値が項目名と値の格子で読める。場面内の `####` の敵の `##### ステータス` も
格子になる([contracts/detail-view.md](./contracts/detail-view.md) 4 章)。

### Tests for User Story 4

- [ ] T023 [P] [US4] `src/utils/scenario-structure-utils.test.ts` に `parseStatLines` のテストを追加する。
  - 通常の行(`STR: 55 CON: 75 …`)
  - 持たない能力値を飛ばした行(`STR: 60 CON: 50 DEX: 70 SIZ: 80`)
  - 数値以外の値(`POW: 15（初期値: 55）`、`STR: 105 - 10 CON: 110 - 10`)
  - 2 行目以降の副次ステータス
  - 形に合わない行が `rest` に残ること
  - 1 行目が能力値で始まらない段落を「能力値の段落ではない」と判定すること
- [ ] T024 [P] [US4] `src/utils/scenario-structure-utils.test.ts` に `toCharacter(section)` のテストを追加する。`body` 先頭の画像が `portrait`、残りが `profile` になること。立ち絵がない場合。`ステータス` で始まる `####` が姿ごとに分かれること(`#### ステータス (怪物の姿)`)。他の `####` が出現順のまま残ること
- [ ] T025 [P] [US4] `src/app/trpg/scenario/[id]/ScenarioCharacter.test.tsx` を新規作成する。立ち絵(`alt` が人物名)、見出しと補足、能力値の格子(`STR` と値の対応)、技能・セリフ例の区画が 1 つのカード(`article` など)の中に入っていることを確かめる。能力値のない人物で能力値の欄が出ないことも確かめる

### Implementation for User Story 4

- [ ] T026 [US4] `src/utils/scenario-structure-utils.ts` に、`parseStatLines(text: string): StatBlock | undefined`(能力値の段落でなければ `undefined`)と `toCharacter(section: Section): Character` を実装する([data-model.md](./data-model.md) Character / StatBlock)
- [ ] T027 [P] [US4] `src/app/trpg/scenario/[id]/StatGrid.tsx` を新規作成する。`StatBlock` の `abilities` を「項目名 + 値」の格子(狭い画面で 4 列、`md` 以上で 8 列)で、`derived` を項目名と値の並びで、`rest` をそのまま表示する([research.md](./research.md) R7)
- [ ] T028 [US4] `src/app/trpg/scenario/[id]/ScenarioMarkdown.tsx` の `components.p` で、段落の文字列が能力値の段落(`parseStatLines` が値を返す)なら `StatGrid` を描画するようにする。見出しレベルによらず効くので、場面内の `##### ステータス` も格子になる(T026・T027 に依存)
- [ ] T029 [US4] `src/app/trpg/scenario/[id]/ScenarioCharacter.tsx` を新規作成する。`Character` を、立ち絵・見出し(補足は小さく添える)・プロフィール・`statBlocks`・その他の `####` 区画の順でカード表示する。見出しには `Heading.id` を付ける。`StructuredScenario.tsx` で `kind === "character"` の Section をこのカードで描画する(T026・T028 に依存)
- [ ] T030 [US4] T023〜T025 が通ることを確認し、`pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 3 を parasite で確かめる

**Checkpoint**: parasite の全人物がカードで、能力値が格子で読める

---

## Phase 6: User Story 5 - 判定と正気度喪失を見落とさずに処理する (Priority: P2)

**Goal**: 判定(難易度を含む)・正気度喪失・正気度回復・呪文・魔導書/アーティファクト・出典を、
地の文や互いと見分けられる見た目で示す(FR-021)。

**Independent Test**: parasite の場面で、`〈…〉` の判定、`のハード`、正気度喪失の成功／失敗、
正気度回復、`《》`、`『』` が見分けられる。色を除いても(枠・記号で)区別できる
([contracts/structured-markdown.md](./contracts/structured-markdown.md) 4 章)。

### Tests for User Story 5

- [ ] T031 [P] [US5] `src/utils/scenario-structure-utils.test.ts` に表記の分類関数のテストを追加する。
  - `classifyStrong`: `〈目星〉` → 判定、`正気度喪失：0 ／ 1D6` → 正気度喪失(成功 `0`・失敗 `1D6`)、`正気度喪失：1D10` → 固定、`_基本ルールブック P319 黄色の印_` → 出典、それ以外 → 通常
  - `splitNotation`: 文字列中の `《…》`・`『…』`・`正気度回復: 1D6` を区切る
  - 難易度の接尾辞(` のハード` / ` のイクストリーム`)を取り出す関数
- [ ] T032 [P] [US5] `src/app/trpg/scenario/[id]/ScenarioMarkdown.test.tsx` を新規作成する。判定・難易度付き判定・正気度喪失・固定の正気度喪失・正気度回復・呪文・魔導書名・出典を含む段落を描画し、それぞれが種別ごとの要素(`data-notation` 属性など、テストで識別できる印)として描画されること、通常の太字は通常の `strong` のままであることを確かめる

### Implementation for User Story 5

- [ ] T033 [US5] `src/utils/scenario-structure-utils.ts` に `classifyStrong` と `splitNotation`、難易度の接尾辞の判定を実装する([research.md](./research.md) R3)
- [ ] T034 [US5] `src/app/trpg/scenario/[id]/ScenarioMarkdown.tsx` に次を追加する(T033 に依存)。
  - `components.strong`: `classifyStrong` の結果に応じて、判定・正気度喪失(成功／失敗を分けて表示)・出典の見た目にする
  - `p` / `li` / `td` の子要素の文字列を `splitNotation` で走査し、呪文・魔導書/アーティファクト・正気度回復を `<span>` で包む
  - 判定の `strong` の直後の文字列が難易度の接尾辞で始まる場合は、その部分も判定の見た目に含める

  見た目は枠・記号・色の組み合わせで区別し、ダークモードでも読めるようにする
- [ ] T035 [US5] T031・T032 が通ることを確認し、`pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 4・8 を parasite で確かめる

**Checkpoint**: parasite の判定・正気度喪失・呪文・物品が見分けられる

---

## Phase 7: User Story 6 - 作中テキストと読み上げ文を地の文と区別して読み上げる (Priority: P2)

**Goal**: 作中テキスト・セリフ・読み上げ文・魔導書・エンディング/その他報酬を、それぞれの
見せ方で表示する(FR-022〜FR-025)。

**Independent Test**: parasite の日誌が枠付きで改行を保ち、『フサン謎の七書』が魔導書のカード、
ED1〜ED3 とその他報酬が区別して表示される。読み上げ文(`> [!読み上げ]`)はテスト用本文で
枠付き表示を確かめる([contracts/detail-view.md](./contracts/detail-view.md) 4 章)。

### Tests for User Story 6

- [ ] T036 [P] [US6] `src/utils/scenario-structure-utils.test.ts` に次のテストを追加する。
  - `toEnding`: `ED1 【腐海より戻りし者】` → 番号 `1`・名称 `腐海より戻りし者`。`【】` がない場合
  - `toTome`: 規約の箇条書きの属性が読み取れ、それ以外は本文に残る。属性のないアーティファクト
  - `isReadAloud`: 段落の先頭が `[!読み上げ]` かどうか
- [ ] T037 [P] [US6] `src/app/trpg/scenario/[id]/ScenarioMarkdown.test.tsx` に次を追加する。
  - 作中テキスト(言語指定なしのコードブロック)が枠付きで改行を保つこと
  - セリフ(引用)が 1 行ずつ区切られること
  - 読み上げ文: `> [!読み上げ]` の引用が読み上げ文の枠で描画されること、目印の文字列が表示されないこと、中の改行と判定の強調が保たれること、目印のない引用はセリフのままであること
- [ ] T038 [P] [US6] `src/app/trpg/scenario/[id]/StructuredScenario.test.tsx` に、ED とその他報酬、魔導書を含むテスト用本文を追加し、ED の番号と名称が分かれた見出しになること、その他報酬・魔導書がそれぞれの見た目で描画されることを確かめる

### Implementation for User Story 6

- [ ] T039 [US6] `src/utils/scenario-structure-utils.ts` に `toEnding(section)`・`toTome(section)`・`isReadAloud(text)` を実装する([data-model.md](./data-model.md) Ending / Tome、[research.md](./research.md) R10)
- [ ] T040 [US6] `src/app/trpg/scenario/[id]/ScenarioMarkdown.tsx` に次を追加する(T039 に依存)。
  - `components.pre`: 作中テキストを枠付き・改行保持で表示する
  - `components.blockquote`:
    - 1 段落目の先頭が `[!読み上げ]` なら、目印(と直後の改行)を除いて読み上げ文の枠で表示する。作中テキスト・セリフと見分けられる見た目にする
    - それ以外はセリフとして、行(`<br>` 区切り)ごとに区切って表示する
- [ ] T041 [P] [US6] `src/app/trpg/scenario/[id]/ScenarioTome.tsx` を新規作成し、`Tome` を属性の一覧 + 本文のカードで表示する。`StructuredScenario.tsx` で `kind === "tome"` の Section に使う(T039 に依存)
- [ ] T042 [P] [US6] `src/app/trpg/scenario/[id]/ScenarioEnding.tsx` を新規作成し、`ending` を「ED<番号>」と名称を分けた見出しで、`reward` をエンディングと区別した見た目で表示する。`StructuredScenario.tsx` で `kind === "ending"` / `"reward"` の Section に使う(T039 に依存)
- [ ] T043 [US6] T036〜T038 が通ることを確認し、`pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 5・6a を parasite で確かめる(6a は確認後に本文を元に戻す)

**Checkpoint**: 構造化表示の部品がすべてそろい、parasite で quickstart 2 章の全項目を満たす

---

## Phase 8: User Story 7 - シナリオを 1 本ずつ新しい見せ方へ移行する (Priority: P3)

**Goal**: 移行の正しさを自動で確かめられるようにし、移行の手順を文書化する(FR-027〜FR-029 /
SC-008 / SC-009)。

**Independent Test**: parasite だけが移行済みの状態で、全シナリオが一覧から開けて読める。
データ適合テストが、移行済みシナリオの規約違反(章の順序・能力値の書式・対象システム)を
検出できる。

### Tests for User Story 7

- [ ] T044 [US7] `src/data/scenario/scenario-list.test.ts` に、`structured: true` の全シナリオを対象とするデータ適合テストを追加する([research.md](./research.md) R8)。
  - `system` にクトゥルフ神話TRPGを含むこと(FR-029)
  - 固定セクション名の章どうしが規約の順に並ぶこと(場面の位置は問わない)
  - `ステータス` で始まる見出しの下に、`parseStatLines` が読み取れる能力値の段落が 1 つ以上あること
  - 必須の章(`GM 向け情報`・`主な NPC`・`シナリオの導入`・`クライマックス`・`シナリオ終了`)があること

  テストが失敗したときは、どのシナリオのどの見出しかが分かるメッセージにする
- [ ] T045 [US7] T044 が parasite で通ることを確認する。失敗した場合は `parasite.md` を [contracts/structured-markdown.md](./contracts/structured-markdown.md) に合わせて直す(文言・数値は変えない)
- [ ] T046 [US7] `git diff master -- src/data/scenario/markdown/parasite.md` を見て、本文の変更が見出しと配置の調整(T015)だけであることを確かめる(SC-008)

**Checkpoint**: 移行済みと未移行が混在した状態で、全シナリオが読め、移行の正しさをテストで確かめられる

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 判断の記録とドキュメントの更新、全体の確認

- [ ] T047 [P] `docs/adr/0015-structure-scenario-markdown-for-display.md` を `docs/adr/0001-record-architecture-decisions.md` のフォーマットで書く。内容は次のとおり。
  - 本文は Markdown を正とし、規約の見出しと書式に沿って表示時に構造化する
  - 行単位の分割で、新規依存なし
  - 移行済みの印 `structured`
  - 読み上げ文の記法

  [research.md](./research.md) R1・R2・R5・R10 の判断と却下案を要約し、ADR-0014 を参照する。`docs/adr/README.md` に一覧があれば追記する
- [ ] T048 [P] `src/data/scenario/README.md` を更新する([research.md](./research.md) R9)。
  - 1 章: `structured: true` の意味と付け方
  - 4 章: 読み上げ文の記法を表に追加し、例を載せる
  - 7 章: 構造化表示での扱いを追記する
    - 立ち絵は人物カード内に出る
    - 見出し名が種別の判定に使われる
    - 能力値の段落の検出
    - 読み上げ文は移行済みシナリオでだけ使う
    - 詳細は `specs/005-scenario/contracts/structured-markdown.md`
- [ ] T049 [P] `src/data/scenario/template.md` の場面の雛形に、読み上げ文の書き方を HTML コメントで添える(使わなければ削除してよい旨も書く)
- [ ] T050 [P] `CLAUDE.md` の「シナリオデータ(`src/data/scenario`)」節に、移行済みのシナリオは `structured: true` で構造化表示になること、移行の条件は `specs/005-scenario/contracts/structured-markdown.md` を参照することを 1〜2 行で追記する
- [ ] T051 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` がすべて通ることを確認する
- [ ] T052 `pnpm dev` で [quickstart.md](./quickstart.md) 2 章の全項目(1〜11)を確かめる。US1(一覧の絞り込み)が T002 時点から変わっていないことも確かめる

---

## Phase 10: 残りのシナリオの移行(US7 の継続)

**Purpose**: クトゥルフ神話TRPG 7版の残り 10 本を 1 本ずつ構造化表示へ移行する。順序はオーナーが
決めてよい(spec Assumptions)。各タスクは [quickstart.md](./quickstart.md) 3 章の手順
(整える → `structured: true` → `pnpm test` → 画面確認 → 差分確認)で行い、1 本 = 1 コミットにする。
queen-of-the-sea は移行しない(FR-029)。

- [ ] T053 [US7] `src/data/scenario/markdown/the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars.md` を移行し、`ThePrisonerInTheGlassCageDreamsInTheSeaOfStars` に `structured: true` を付ける(最長 1,847 行。場面内 `####` の敵の `##### ステータス` が格子になることも確かめる)
- [ ] T054 [US7] `src/data/scenario/markdown/bubble-on-wet-hands.md` を移行し、`BubbleOnWetHands` に `structured: true` を付ける
- [ ] T055 [US7] `src/data/scenario/markdown/silent-journey.md` を移行し、`SilentJourney` に `structured: true` を付ける
- [ ] T056 [US7] `src/data/scenario/markdown/agnus-dei-qui-tollis-peccata-mundi.md` を移行し、`AgnusDeiQuiTollisPeccataMundi` に `structured: true` を付ける
- [ ] T057 [US7] `src/data/scenario/markdown/das-dornröschen-des-wahnsinnigen-königs.md` を移行し、`DasDornroschenDesWahnsinnigenKonigs` に `structured: true` を付ける
- [ ] T058 [US7] `src/data/scenario/markdown/the-sound-of-stepping-on-fog.md` を移行し、`TheSoundOfSteppingOnFog` に `structured: true` を付ける
- [ ] T059 [US7] `src/data/scenario/markdown/palate-of-the-crawling.md` を移行し、`PalateOfTheCrawling` に `structured: true` を付ける
- [ ] T060 [US7] `src/data/scenario/markdown/the-smile-of-the-bangs-less-goddess.md` を移行し、`TheSmileOfTheBangsLessGoddess` に `structured: true` を付ける
- [ ] T061 [US7] `src/data/scenario/markdown/shadow-feather.md` を移行し、`ShadowFeather` に `structured: true` を付ける
- [ ] T062 [US7] `src/data/scenario/markdown/nocturne.md` を移行し、`Nocturne` に `structured: true` を付ける
- [ ] T063 [US7] 全 11 本の移行後、`pnpm test` のデータ適合テストが全シナリオで通ることを確認し、spec.md の Assumptions にある「改修完了までは現行実装と一致しない」旨の記述を、移行完了に合わせて更新する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1(Setup)**: 依存なし
- **Phase 2(Foundational)**: Phase 1 の後。**すべてのストーリーをブロックする**
- **Phase 3(US2)**: Phase 2 の後。T014(切り替え)と T015(parasite のパイロット移行)が、以降の
  ストーリーを画面で確かめるための前提になる
- **Phase 4〜7(US3〜US6)**: Phase 3 の後。互いに独立しており、どの順でも進められる。
  ただし US4〜US6 はいずれも `ScenarioMarkdown.tsx` と `scenario-structure-utils.ts` に追記する
  ため、並行して進めるとこの 2 ファイルが衝突しやすい。1 人で進めるなら番号順がよい
- **Phase 8(US7)**: Phase 3 の後(適合テストは US4 の `parseStatLines` を使うので Phase 5 の後)
- **Phase 9(Polish)**: Phase 3〜8 の後
- **Phase 10(残りの移行)**: Phase 9 の後。各タスクは互いに独立だが、すべて
  `scenario-list.ts` を編集するので 1 本ずつ順にコミットする

### Within Each Story

- テストを先に書き、実装前に失敗することを確かめる
- `scenario-structure-utils.ts`(純粋関数) → 表示部品 → `StructuredScenario.tsx` への組み込み → 画面確認

### Parallel Opportunities

- Phase 2: T004(従来表示の切り出し)と T005(分割関数)は別ファイルで並行できる
- 各ストーリーの「Tests」の [P] タスク(ユーティリティのテストと部品のテスト)は並行して書ける
- US4 の T027(`StatGrid.tsx`)、US6 の T041(`ScenarioTome.tsx`)と T042(`ScenarioEnding.tsx`)は、
  他の部品と並行して作れる
- Phase 9 の T047〜T050(ADR・README・template・CLAUDE.md)は並行できる

### Parallel Example: User Story 6

```text
# テストを並行して書く
T036 scenario-structure-utils.test.ts に toEnding / toTome / isReadAloud のテスト
T037 ScenarioMarkdown.test.tsx に作中テキスト・セリフ・読み上げ文のテスト
T038 StructuredScenario.test.tsx に ED・その他報酬・魔導書のテスト

# T039(関数の実装)の後、部品を並行して作る
T041 ScenarioTome.tsx
T042 ScenarioEnding.tsx
```

---

## Implementation Strategy

### MVP First(Phase 1〜3)

1. Phase 1・2 で土台を作る。全 12 本で行の欠落がないことがテストで保証された状態にする
2. Phase 3 で、parasite が概要付きの共通の見せ方で読める状態にする
3. **STOP and VALIDATE**: parasite と未移行シナリオを開き、表示の切り替えが正しいことを確かめる

### Incremental Delivery

1. MVP(US2)→ 目次(US3)→ 人物カード(US4)→ 表記の強調(US5)→ 作中テキスト・読み上げ文・
   魔導書・ED(US6)の順に足す。各フェーズの終わりで parasite を開いて確かめる
2. US7 で移行の正しさを自動で確かめられるようにし、Phase 9 で記録を残す
3. ここまでで 1 つの PR にまとめてよい。Phase 10 の移行は、1 本ずつ(または数本ずつ)別の PR に
   分けてもよい

### Notes

- [P] は別ファイルで依存のないタスク
- 本文 Markdown の移行では文言・数値を変えない。直してよいのは見出しの名前・レベル、配置、
  規約で定めた項目名(`HP` → `耐久力` など)だけ
- 各タスク(または論理的なまとまり)ごとにコミットする
