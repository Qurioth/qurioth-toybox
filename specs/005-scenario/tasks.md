---

description: "シナリオごとの専用ページの作業一覧"
---

# Tasks: シナリオごとの専用ページ

**Input**: Design documents from `/specs/005-scenario/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/](./contracts) / [quickstart.md](./quickstart.md)

**Tests**: 含める(テスティングトロフィー、ADR-0008)。

- 純粋関数(コマの変換・下書きの変換)はユニットテストで確かめる。
- 部品と MDX の要素マッピングは結合テストで確かめる。
- MDX の結合テストは `@mdx-js/mdx` の `evaluate` で、テスト内の小さな MDX を描画して行う。
- `mermaid` はモックする。
- 実データは、全 12 本の下書きのテストと登録のテストで確かめる。

**Organization**:

- US1(一覧)は変えないので、実装フェーズは設けない(T001 と最終確認で退行を確かめる)。
- 今回作るのは US2〜US8。
- 2026-10-02 版の構造化表示の部品は捨てずに、US3 で `src/components/scenario/` に移して作り直す。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US2〜US8)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ。

- 部品:`src/components/scenario/`
- シナリオの専用ページ:`src/scenarios/<slug>/`
- テスト:対象と同じディレクトリに `*.test.ts(x)` として置く。`describe` / `it` / `expect` は
  `vitest` から明示 import する。

---

## Phase 1: Setup

**Purpose**: 依存を加え、MDX をビルドに組み込む

- [X] T001 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、変更前の状態がすべて通ることを確認する(退行判定の基準)
- [X] T002 依存を追加する。`pnpm add @next/mdx @mdx-js/loader @mdx-js/react mermaid` と `pnpm add -D @types/mdx @mdx-js/mdx`。`@next/mdx` は導入済みの `next` と同じメジャー(16)に揃える
- [X] T003 `next.config.mjs` を `createMDX` で包む(`import createMDX from "@next/mdx"`)。`options.remarkPlugins` は Turbopack 向けに文字列で `[["remark-gfm", {}]]` と書く。`pageExtensions` は変えない(MDX はページではなくモジュールとして import する。research R1)
- [X] T004 `src/mdx-components.tsx` を作る。`useMDXComponents(): MDXComponents` が空の対応表を返す最小の形にする(`@next/mdx` の App Router での必須ファイル)
- [X] T005 `tsconfig.json` の `compilerOptions` に `"allowImportingTsExtensions": true` を足す(下書き生成スクリプトの `.ts` 付き import のため。research R10)。`pnpm typecheck && pnpm build` が通ることを確認する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 構造化表示の切り替えを外し、専用ページを登録できる形にする。NPC の型を用意する。
**このフェーズの後、全シナリオは従来の整形表示に戻る**(spec Assumptions)。

**⚠️ CRITICAL**: Phase 3 以降はこのフェーズの完了なしに開始できない

- [X] T006 `src/data/scenario/scenario-list.ts` の `Scenario` 型を [data-model.md](./data-model.md) の登録データのとおりに変える。
  - `markdown` を任意にする。
  - `page?: () => Promise<{ default: ComponentType<{ scenario: ScenarioInfo }> }>` を足す。`ScenarioInfo` は `title` / `system` / `players` / `playTimeHours` だけを持つ型で、同じファイルから export する。
  - `structured` を削除し、11 本のエントリから `structured: true` を外す。
- [X] T007 `src/app/trpg/scenario/[id]/page.tsx` から構造化表示の分岐(`StructuredScenario`)を外し、全シナリオを `LegacyScenarioBody` で描画する形に戻す。`src/app/trpg/scenario/[id]/StructuredScenario.tsx` と `StructuredScenario.test.tsx` を削除する(T006 に依存)
- [X] T008 [P] `src/types/scenario-npc.ts` を作り、`ScenarioNpc` / `NpcStatBlock` / `StatEntry` / `NpcSkill` を [data-model.md](./data-model.md) のとおりに定義する。`StatEntry` は `src/utils/scenario-structure-utils.ts` の同名の型と同じ形なので、utils 側はこちらを `import type` で使うように直す
- [X] T009 `src/data/scenario/scenario-list.test.ts` を書き直す(T006 に依存)。
  - 構造化表示のデータ適合テストを削除する。
  - 「各エントリは `markdown` と `page` のちょうど一方を持つ」テストを足す。
  - 「`markdown` を持つシナリオは区画に分けても行が欠落しない」テストは残す。
- [X] T010 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` が通り、`pnpm dev` で全シナリオが従来の整形表示になっていることを確認する

**Checkpoint**: 全シナリオが従来表示。専用ページを登録する口ができた

---

## Phase 3: User Story 2 - シナリオごとに専用ページを作り込む (Priority: P1) 🎯 MVP

**Goal**: `page` を持つシナリオでは専用ページを描画し、権利表記・タブ名・登録情報の受け渡しは詳細画面が一括で担う。

**Independent Test**: テスト用の専用ページを登録したシナリオだけが専用ページになり、権利表記が付く。他のシナリオは従来表示のまま([contracts/detail-view.md](./contracts/detail-view.md) 1〜2 章)。

### Tests for User Story 2

- [X] T011 [P] [US2] `src/app/trpg/scenario/[id]/ScenarioDetailBody.test.tsx` を作る。`ScenarioDetailBody` は async のサーバーコンポーネントなので、`await ScenarioDetailBody({ scenario })` の戻り値を `render` する。次を確かめる。
  - テスト内で作った偽の `page`(見出しを1つ出すだけの部品)を持つシナリオでは、その部品が描画され、`scenario` の登録情報(タイトルなど)が props で渡る。
  - クトゥルフ神話TRPGのシナリオでは権利表記(`Chaosium`)が付き、他システムでは付かない。
  - `markdown` だけのシナリオは従来表示になる。
  - `scenario` が `undefined` でも壊れない。
- [X] T012 [P] [US2] `src/components/scenario/ScenarioPage.test.tsx` を作る。次を確かめる。
  - `theme` の値が外枠の要素の CSS 変数(`--scenario-accent` など)に設定される。
  - 本文の要素に `data-scenario-body` が付く。
  - `className` が外枠に付く。
  - 子の部品から `useScenarioInfo()` で登録情報を読める。

### Implementation for User Story 2

- [X] T013 [US2] `src/components/scenario/ScenarioPage.tsx` を作る(T012 を通す)。
  - props は `scenario: ScenarioInfo`、`theme?: ScenarioTheme`、`className?`、`children`。
  - `theme` は `accent` / `surface` / `border` と、そのダーク用の `dark` を持つ。
  - ライトの値は外枠の `style` に CSS 変数で、ダークの値は `dark:` 用の CSS 変数(`--scenario-accent-dark` など)で渡す。部品は `dark:` の Tailwind 任意値で切り替えて参照する。
  - 登録情報はクライアントの context(`src/components/scenario/ScenarioInfoContext.tsx`、`"use client"`)で子に渡し、`useScenarioInfo()` を export する。
  - `export type ScenarioPageProps` も出す([contracts/mdx-page.md](./contracts/mdx-page.md) 1 章)。
- [X] T014 [US2] `src/app/trpg/scenario/[id]/ScenarioDetailBody.tsx` を作り(T011 を通す)、`src/app/trpg/scenario/[id]/page.tsx` から使う(T006・T007・T013 に依存)。
  - `scenario.page` があれば `const { default: Page } = await scenario.page()` で読み込み、`<Page scenario={…登録情報…} />` を描画する。
  - `page` がなければ `LegacyScenarioBody` を描画する。
  - 権利表記はどちらの場合も末尾に付ける。
  - `generateMetadata`(タブ名)は変えない。
- [X] T015 [US2] `pnpm typecheck && pnpm test` が通ることを確認する

**Checkpoint**: 専用ページを登録すれば表示される(実際のシナリオの登録は US8 のパイロットで行う)

---

## Phase 4: User Story 3 - 共通の部品を組み合わせてページを作る (Priority: P1)

**Goal**: 2026-10-02 版の部品を `src/components/scenario/` に移して MDX から使える形にし、Markdown の要素に既定の見た目を当てる。

**Independent Test**: テスト内の小さな MDX を `evaluate` して描画し、各部品と Markdown の要素がそれぞれの見た目になる([contracts/mdx-page.md](./contracts/mdx-page.md) 3 章)。

### Tests for User Story 3

- [X] T016 [P] [US3] `src/components/scenario/Notation.test.tsx` を作る。`src/app/trpg/scenario/[id]/ScenarioMarkdown.test.tsx` の表記の強調のケースを、MDX の対応表(`strong` / `p` / `li` / `td`)に対するテストとして移す。
  - 判定と難易度。
  - 正気度喪失(成功/失敗、固定)。
  - 正気度回復(空白あり・なし)、呪文、物品、出典。
  - 通常の太字は通常の `strong` のまま。
- [X] T017 [P] [US3] `src/components/scenario/ScenarioToc.test.tsx` を作る。`data-scenario-body` の中に `h2` と `data-toc` 付きの見出しを置いた DOM で次を確かめる。
  - 目次の項目が `h2` の下に `data-toc` 見出しを入れ子にした形で並ぶ。
  - 各項目が見出しの id へのリンクになる。
  - パネルの開閉と、項目を選ぶとパネルが閉じること(旧 `src/app/trpg/scenario/[id]/ScenarioToc.test.tsx` を移して直す)。
- [X] T018 [P] [US3] `src/components/scenario/NpcCard.test.tsx` と `StatGrid.test.tsx` を作る。旧 `ScenarioCharacter.test.tsx` のケースを、`ScenarioNpc` のデータを渡す形に直して移す。
  - 名前と補足の見出しが `data-toc` を持つ。
  - 能力値の格子(項目名と値の対応)。
  - 副次ステータスだけの存在。
  - 技能の表示(値と `note`)。
  - 子要素(セリフ例)の表示。
  - 能力値のない人物で欄が出ないこと。
- [X] T019 [P] [US3] `src/mdx-components.test.tsx` を作る。`@mdx-js/mdx` の `evaluate`(`remarkGfm`、`react/jsx-runtime`、`useMDXComponents`)でテスト内の MDX を描画し、次を確かめる。
  - `##` が id 付きの見出しになる。
  - 引用がセリフとして1行ずつ区切られる。
  - 言語なしのコードブロックが作中テキストになる。
  - 表が横スクロールの枠に入る。
  - `<ReadAloud>`・`<Ending number="1" name="…">`・`<Reward>`・`<Tome name="…">`・`<ScenarioOverview>` が import なしで使える。

### Implementation for User Story 3

- [X] T020 [US3] `src/components/scenario/Notation.tsx` を作る。旧 `ScenarioMarkdown.tsx` の強調の処理(`decorate`・`strong` の分類・難易度の判定)を、react-markdown の `node` ではなく子要素の文字列から判定する形に直して移す。判定の関数は `src/utils/scenario-structure-utils.ts` の `classifyStrong` / `splitNotation` / `splitDifficulty` を使う。色は CSS 変数を参照してもよいが、種別ごとの見分け(枠・記号)は保つ(T016 を通す)
- [X] T021 [P] [US3] `src/components/scenario/StatGrid.tsx` を、旧 `src/app/trpg/scenario/[id]/StatGrid.tsx` から移して作り直す。props を `stats: NpcStatBlock` と `children`(形に合わない行など)にする(T018 の StatGrid 分を通す)
- [X] T022 [US3] `src/components/scenario/NpcCard.tsx` を、旧 `ScenarioCharacter.tsx` から移して作り直す(T021 に依存、T018 を通す)。
  - props は `npc: ScenarioNpc` と `children`。
  - 見出しは `data-toc` と id 付きの `h3`。
  - `stats` ごとに `StatGrid` を出し、`label` があれば姿の名前として出す。
  - `skills` は「名前: 値%」と `note` を並べる。
  - `profile` は改行を保って表示する。
  - 子要素はカードの中に出す。
  - 枠と背景の色は CSS 変数(`--scenario-border` / `--scenario-surface`)を参照する。
- [X] T023 [P] [US3] `src/components/scenario/` に次の部品を作る。旧 `ScenarioEnding.tsx` / `ScenarioTome.tsx` / 旧 `ScenarioMarkdown.tsx` の読み上げ文の枠を移して作り直す。いずれも子要素は MDX。
  - `ReadAloud.tsx`
  - `Ending.tsx`(props `number` / `name`。見出しは `data-toc` 付き)
  - `Reward.tsx`(props `title?`。既定は「その他報酬」。見出しは `data-toc` 付き)
  - `Tome.tsx`(props `name`)
- [X] T024 [P] [US3] `src/components/scenario/ScenarioOverview.tsx` を、旧 `src/app/trpg/scenario/[id]/ScenarioOverview.tsx` から移して作り直す。登録情報は `useScenarioInfo()` から読み、リードは `children` で受け取る。`"use client"` にする(context を読むため)
- [X] T025 [US3] `src/components/scenario/ScenarioToc.tsx` を、旧 `src/app/trpg/scenario/[id]/ScenarioToc.tsx` から移して作り直す(T017 を通す)。
  - props の `items` をやめ、表示後に最も近い `[data-scenario-body]` の中から `h2` と `[data-toc]` の見出しを集めて目次を作る([contracts/detail-view.md](./contracts/detail-view.md) 3 章)。
  - 見出しに id がなければ付けてからリンクにする。
- [X] T026 [US3] `src/mdx-components.tsx` を仕上げる(T020〜T025 に依存、T019 を通す)。
  - 要素の対応表を作る。
    - `h2` / `h3` / `h4`:子要素の文字列から id を作り、`scroll-mt-24`。`h2` は目次に載る。
    - `strong` / `p` / `li` / `td`:`Notation`。
    - `blockquote`:セリフを1行ずつ。
    - `pre`:作中テキスト。
    - `table`:横スクロールの枠。
  - 部品(`ScenarioOverview` / `ScenarioToc` / `NpcCard` / `StatGrid` / `ReadAloud` / `Ending` / `Reward` / `Tome`)を登録する。
  - 本文の地の文の既定の書式として、`ScenarioPage` の本文の要素に `prose dark:prose-dark max-w-none` を付ける(`src/components/scenario/ScenarioPage.tsx`)。
- [X] T027 [US3] 旧部品を削除する(T026 に依存)。
  - `src/app/trpg/scenario/[id]/` の次のファイルと、そのテスト:`ScenarioCharacter` / `ScenarioEnding` / `ScenarioHeading` / `ScenarioMarkdown` / `ScenarioOverview` / `ScenarioToc` / `ScenarioTome` / `StatGrid`
  - `src/utils/scenario-structure-utils.ts` の `buildScenarioToc` / `TocItem` / `isReadAloud` / `READ_ALOUD_MARKER` と、それらのテスト
  - 残す関数(`splitScenarioMarkdown` / `restoreScenarioMarkdown` / `parseStatLines` / `toCharacter` / `toEnding` / `toTomeName` / `classifyStrong` / `splitNotation` / `splitDifficulty`)は、下書きの生成と強調で使う
- [X] T028 [US3] `pnpm lint && pnpm typecheck && pnpm test` が通ることを確認する

**Checkpoint**: MDX の中で部品と Markdown の要素がそれぞれの見た目になる

---

## Phase 5: User Story 4 - NPC を CCFOLIA のコマとして持ち出す (Priority: P2)

**Goal**: NpcCard の「CCFOLIA にコピー」で、CCFOLIA の Clipboard API (beta) 形式の JSON をクリップボードに書き込む。

**Independent Test**: `toCcfoliaKoma` が [contracts/ccfolia-koma.md](./contracts/ccfolia-koma.md) どおりの JSON を返し、ボタンでそれがクリップボードに書き込まれて結果が表示される。実際の貼り付けは quickstart 3 章でオーナーが確かめる。

### Tests for User Story 4

- [X] T029 [P] [US4] `src/utils/ccfolia-koma-utils.test.ts` を作る。contracts の例の NPC で、出力が例の JSON と一致することを確かめる。ほかに次のケースを確かめる。
  - 能力値・技能がない人物(`name` と `memo` だけになり、空の `status` / `params` / `commands` が出ない)
  - 副次ステータスだけの存在
  - 整数として読めない値(`105 - 10`)が `status` と `commands` から外れ、`params` には文字列で残る
  - `iconUrl` が出ない
  - `stats` が複数ある場合に 1 つ目を使う
- [X] T030 [P] [US4] `src/components/scenario/CopyKomaButton.test.tsx` を作る。`navigator.clipboard.writeText` をモックし、次を確かめる。
  - ボタン「CCFOLIA にコピー」を押すと JSON 文字列が渡る。
  - 成功時に「コピーしました」、失敗時(reject)に「コピーできませんでした」が `aria-live` の領域に出る。

### Implementation for User Story 4

- [X] T031 [US4] `src/utils/ccfolia-koma-utils.ts` に `toCcfoliaKoma(npc: ScenarioNpc)` と、その戻り値の型 `CharacterClipboardData` を実装する。対応は [contracts/ccfolia-koma.md](./contracts/ccfolia-koma.md) の表のとおり(T029 を通す)
- [X] T032 [US4] `src/components/scenario/CopyKomaButton.tsx`(`"use client"`)を作り、`NpcCard` の見出しの近くに置く。コピーする文字列は `JSON.stringify(toCcfoliaKoma(npc))`。結果の表示は数秒で消す。既存の `src/components/CopyTextBox.tsx` のコピー処理に倣う(T031 に依存、T030 を通す)

**Checkpoint**: NPC カードからコマの JSON をコピーできる

---

## Phase 6: User Story 5 - 画像を崩さずに見せる (Priority: P2)

**Goal**: 立ち絵を切り抜かずに表示し、図をキャプション付き・拡大可能にする(FR-025)。

**Independent Test**: 縦長の立ち絵が切り抜かれず、図を選ぶと原寸のダイアログが開いて閉じられる。

### Tests for User Story 5

- [X] T033 [P] [US5] `src/components/scenario/Figure.test.tsx` を作る。次を確かめる。
  - キャプションが `figcaption` に出る。
  - 画像のボタンを押すと `dialog` が開き、原寸の画像(`alt` 付き)が出る。
  - 閉じるボタンで閉じる。
  - MDX の `![alt](src "キャプション")` も `Figure` になる(`src/mdx-components.test.tsx` に追記)。

### Implementation for User Story 5

- [X] T034 [US5] `src/components/scenario/Figure.tsx`(`"use client"`)を作る(T033 を通す)。
  - 画像を `figure` に入れ、キャプションを `figcaption` で出す。
  - 選ぶと `@headlessui/react` の `Dialog` で原寸の画像を開き、`overflow-auto` の枠の中でスクロールして細部を読めるようにする。
  - 閉じるボタンの文言は「閉じる」。
  - `src/mdx-components.tsx` の `img` を `Figure` に対応させ、Markdown の画像タイトルをキャプションにする。
- [X] T035 [US5] `src/components/scenario/NpcCard.tsx` の立ち絵を、切り抜かない表示(`object-contain`、`max-h-80`、幅は自動)に直す。狭い画面では画像を上・文章を下に、`sm` 以上では横に並べる。立ち絵を選ぶと `Figure` と同じ拡大ダイアログで開く

**Checkpoint**: 縦長・横長の立ち絵と地図を崩さずに載せられる

---

## Phase 7: User Story 6 - シナリオの進行をフローチャートで把握する (Priority: P2)

**Goal**: Mermaid 記法のフローチャートを、ダークモードと狭い画面に合わせて表示する(FR-026)。

**Independent Test**: ` ```mermaid ` のコードブロックが図として描画され、枠の中でスクロールでき、ダークモードで配色が切り替わる。

### Tests for User Story 6

- [X] T036 [P] [US6] `src/components/scenario/Flowchart.test.tsx` を作る。`vi.mock("mermaid")` で `render` が SVG 文字列を返すようにして、次を確かめる。
  - 図が `overflow-x-auto` の枠の中に描画される。
  - `useDarkMode` がダークのときに `initialize` に `theme: "dark"` が渡る(`src/contexts/dark-mode-context` の Provider で包む)。
  - 描画に失敗したときに、元の記法をコードとして表示する。
  - MDX の ` ```mermaid ` が `Flowchart` になる(`src/mdx-components.test.tsx` に追記)。

### Implementation for User Story 6

- [X] T037 [US6] `src/components/scenario/Flowchart.tsx`(`"use client"`)を作る(T036 を通す)。
  - props は `chart: string`。
  - `useEffect` の中で `await import("mermaid")` して読み込み、`initialize({ startOnLoad: false, securityLevel: "strict", theme })` してから `render` する。
  - 返ってきた SVG を挿入する(Biome の `noDangerouslySetInnerHtml` は理由を書いて抑止)。
  - 図の id は `useId` で作る。
  - `src/mdx-components.tsx` の `pre` で、子の `code` の `className` が `language-mermaid` なら `Flowchart` を描画し、それ以外は作中テキストにする。
  - `Flowchart` を部品として登録する。

**Checkpoint**: 本文の中にフローチャートを書ける

---

## Phase 8: User Story 7 - 既存の本文から下書きを作って移行を始める (Priority: P3)

**Goal**: `pnpm scenario:draft <ID>` で、既存の本文から専用ページの下書きを作る(FR-033 / SC-009)。

**Independent Test**: 全 12 本の下書きが MDX としてコンパイルでき、元の本文の行が欠落しない。

### Tests for User Story 7

- [X] T038 [P] [US7] `src/utils/scenario-draft-utils.test.ts` を作り、[data-model.md](./data-model.md)「下書きへの変換」の規則ごとにテスト内の小さな本文で確かめる。
  - 人物 → `npcs.ts` のデータと `<NpcCard>`:立ち絵・プロフィール・ステータス・技能、技能を解析できない場合は小節が子要素に残る。
  - 場面内の能力値の段落 → `<StatGrid>`:形に合わない行は子要素。
  - ED・その他報酬・魔導書 → 部品。
  - HTML コメント → MDX のコメント。
  - `{` `}` `<` のエスケープ(コードブロック内はしない)。
  - `npcs` のキー(立ち絵のファイル名、なければ連番)。
- [X] T039 [P] [US7] `src/utils/scenario-draft-utils.test.ts` に、登録済みの `markdown` を持つ全シナリオについて次の2つを確かめるテストを足す(research R10)。
  1. `createScenarioDraft` の `contentMdx` が `@mdx-js/mdx` の `compile` でエラーにならない。
  2. 元の本文の空でない各行(見出し・リスト・引用・太字の記号と前後の空白を除いた文字列。エスケープを戻して比べる)が `contentMdx` か `npcsTs` に含まれる。

### Implementation for User Story 7

- [X] T040 [US7] `src/utils/scenario-draft-utils.ts` に `createScenarioDraft(id: string, scenario: { title: string; markdown: string }): { slug; indexTsx; contentMdx; npcsTs }` を実装する(T038・T039 を通す)。
  - 解析は `./scenario-structure-utils.ts` の `splitScenarioMarkdown` / `parseStatLines` / `toCharacter` / `toEnding` / `toTomeName` を使う。
  - Node から直接実行されるので、このファイルから辿る相対 import はすべて `.ts` 付きにし、型は `import type` にする。`@/` のエイリアスは使わない。
  - `indexTsx` は [contracts/mdx-page.md](./contracts/mdx-page.md) 1 章の形(`theme` は未指定、コメントで書き方を案内)。
  - `slug` は、本文ファイル名(`readScenarioMarkdown` に渡しているもの)から拡張子を除いたもの。
- [X] T041 [US7] `scripts/create-scenario-draft.ts` を作る。中身はファイルの入出力だけにする(T040 に依存)。
  - 引数のシナリオ ID から `src/data/scenario/scenario-list.ts` の登録を引く。Node から読めるよう、本文は `src/data/scenario/markdown/` から直接読み、ID と本文ファイル名の対応は `scenario-list.ts` の `readScenarioMarkdown("…")` の引数を正規表現で取り出して得る。
  - `src/scenarios/<slug>/` に3ファイルを書き出す。既存のファイルがあれば中止する。
  - `scenario-list.ts` に足す行(`page: () => import("@/scenarios/<slug>")`)と、消す行(`markdown: …`)を表示する。
  - `package.json` に `"scenario:draft": "node scripts/create-scenario-draft.ts"` を足す。
  - 未登録の ID や、移行済みの ID では日本語のエラーを出して終了コード 1 で終わる。

**Checkpoint**: 任意のシナリオの下書きを1コマンドで作れる

---

## Phase 9: User Story 8 - シナリオを1本ずつ専用ページへ移行する(パイロット) (Priority: P3)

**Goal**: parasite で、下書き → 登録 → 表示の一連の流れを通しで確かめる(plan「実装の段階」8)。

**Independent Test**: parasite だけが専用ページ(下書きのまま)になり、他の 11 本は従来表示のまま全シナリオが読める。

- [X] T042 [US8] `pnpm scenario:draft Parasite` を実行し、`src/scenarios/parasite/` を作る。表示された行に従って `src/data/scenario/scenario-list.ts` の `Parasite` に `page` を足し、`markdown` の行を消す。`src/data/scenario/markdown/parasite.md` を削除する(quickstart 4 章)
- [X] T043 [US8] `pnpm dev` で [quickstart.md](./quickstart.md) 2 章の 1〜11 を確かめる。
  - 対象は parasite。目次・NPC カード・強調・図・幅 375px・ダークモード。
  - 移行前の従来表示と見比べて、文言・数値・画像に欠落がないことも確かめる。
  - 図とフローチャートは parasite に無いので、確かめるときだけ `content.mdx` に一時的に足し、確認後に戻す。
- [X] T044 [US8] オーナーに確認を依頼する。
  - quickstart 3 章の CCFOLIA への貼り付け(SC-007)。
  - parasite を下書きのまま登録しておくか。登録を戻す場合は、次の3つを行う。
    - `page` を消す。
    - `markdown` と `parasite.md` を戻す。
    - `src/scenarios/parasite/` は未登録の下書きとして残す。

**Checkpoint**: 移行の流れが通しで動く

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 判断の記録とドキュメントの更新、全体の確認

- [X] T045 [P] `docs/adr/0016-scenario-pages-with-mdx.md` を `docs/adr/0001-record-architecture-decisions.md` のフォーマットで書く([research.md](./research.md) R1〜R10 の要約と却下案)。
  - `docs/adr/0015-structure-scenario-markdown-for-display.md` のステータスを「Superseded by [ADR-0016](0016-scenario-pages-with-mdx.md)」にする。
  - `docs/adr/README.md` の一覧に 0016 を足し、0015 のステータスも直す。
- [X] T046 [P] `src/scenarios/README.md` を作る。
  - ファイル構成。
  - 部品の一覧と使い方([contracts/mdx-page.md](./contracts/mdx-page.md) を参照)。
  - 配色の変え方。
  - MDX で気を付ける文字。
  - 下書きの作り方と移行の手順(quickstart 4 章)。
- [X] T047 [P] `src/data/scenario/README.md` を更新する。
  - 冒頭に「移行済みのシナリオは `src/scenarios/` の専用ページが正」と案内する。
  - 1 章の `structured: true` の段落を `page` の説明に置き換える。
  - 4 章の読み上げ文の記法(`[!読み上げ]`)を、専用ページの `<ReadAloud>` への案内に置き換える。
  - 7 章の「構造化表示」の節を削除する。
  - 表記規約は専用ページの地の文にも適用されることを書く。
- [X] T048 [P] `src/data/scenario/template.md` から読み上げ文の目印のコメントを削除する
- [X] T049 [P] `CLAUDE.md` を更新する。
  - 技術スタック:MDX(`@next/mdx`)と `mermaid` を足す。
  - ディレクトリ構成:`src/scenarios/` と `src/components/scenario/` を足す。
  - 「シナリオデータ」節:`structured` の段落を専用ページ・`pnpm scenario:draft` の説明に置き換える。
  - 開発コマンド:`pnpm scenario:draft` を足す。
- [X] T050 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` がすべて通ることを確認する。US1(一覧の絞り込み)が T001 時点から変わっていないことも確かめる

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1(Setup)** → **Phase 2(Foundational)**:Phase 2 は**すべてのストーリーをブロックする**
- **Phase 3(US2)**:Phase 2 の後
- **Phase 4(US3)**:Phase 3 の後(`ScenarioPage` と登録情報の context を使う)
- **Phase 5〜7(US4・US5・US6)**:Phase 4 の後
  - 互いに独立。ただし US4・US5 はどちらも `NpcCard.tsx`、US5・US6 はどちらも `mdx-components.tsx` を
    編集するので、1 人で進めるなら番号順がよい
- **Phase 8(US7)**:Phase 2 の後なら着手できる(部品には依存しない)。出力する部品名は
  contracts に従う
- **Phase 9(US8)**:Phase 3〜8 の後
- **Phase 10**:Phase 9 の後

### Within Each Story

- テストを先に書き、実装前に失敗することを確かめる
- 純粋関数 → 部品 → `mdx-components.tsx` への登録 → 画面確認

### Parallel Opportunities

- Phase 2:T008(型)は T006・T007 と並行できる
- 各ストーリーの「Tests」の [P] タスクは並行して書ける
- US3 の T021・T023・T024 は別ファイルで並行できる
- US7(下書き)は US3〜US6 と並行して進められる
- Phase 10 の T045〜T049 は並行できる

### Parallel Example: User Story 3

```text
# テストを並行して書く
T016 Notation.test.tsx
T017 ScenarioToc.test.tsx
T018 NpcCard.test.tsx / StatGrid.test.tsx
T019 mdx-components.test.tsx

# 部品を並行して作る
T021 StatGrid.tsx
T023 ReadAloud / Ending / Reward / Tome
T024 ScenarioOverview.tsx
```

---

## Implementation Strategy

### MVP First(Phase 1〜3)

1. Phase 1・2 で MDX をビルドに組み込み、構造化表示を外して全シナリオを従来表示に戻す
2. Phase 3 で、`page` を登録したシナリオが専用ページになる口を作る
3. **STOP and VALIDATE**:テスト用の専用ページで、表示の切り替えと権利表記を確かめる

### Incremental Delivery

1. 部品集(US3)→ CCFOLIA(US4)→ 画像(US5)→ フローチャート(US6)の順に足す
2. 下書き(US7)は並行して作れる
3. パイロット(US8)で全体を通しで確かめ、オーナーに CCFOLIA での確認とパイロットの扱いを依頼する
4. 以後の各シナリオの移行とデザインは、オーナーが quickstart 4 章の手順で 1 本ずつ行う(この tasks の範囲外)

### Notes

- [P] は別ファイルで依存のないタスク
- 本文の文言・数値を変えない(移行でも下書きでも)
- 各タスク(または論理的なまとまり)ごとにコミットする
