---

description: "JSONログ対応・成長チェック一覧・タブ絞り込みの作業一覧"
---

# Tasks: JSONログ対応・成長チェック一覧・タブ絞り込み

**Input**: Design documents from `/specs/003-ccfolia-grep/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/](./contracts)

**Tests**: 含める。このリポジトリはテスティングトロフィー(ADR-0008)を採っており、テストは
完了条件の一部。どのファイルに何を書くかは [research.md](./research.md) R9 の表に対応する。
実ログ(個人のセッション記録)はフィクスチャにせず、テスト内の小さな手書きサンプルを使う。

**Organization**: spec.md のユーザーストーリーは**画面全体の現行仕様**を表すため、6つのうち
今回新しく作るのは **US4(JSON読み込み)・US5(成長チェック一覧)・US6(タブ絞り込み)**。
US1〜US3 は既に動いている機能で、今回の作業では「壊さないこと」が目標。そのため US1〜US3 の
実装フェーズは設けず、Phase 2 の退行確認と最終フェーズで担保する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US4 / US5 / US6)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ。ソースは `src/` 配下、テストは対象と同じディレクトリにコロケーション
(`*.test.ts(x)`)。詳細は [plan.md](./plan.md) の Project Structure。

---

## Phase 1: Setup

**Purpose**: 作業の土台と、退行を判定するための基準を作る

- [X] T001 作業ブランチを master から切る(例: `git switch -c 003-ccfolia-grep-json-growth`)。このリポジトリの変更は PR 経由のため、master 上で直接作業しない
- [X] T002 `pnpm install` の後 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、変更前の状態が全て通ることを確認する。以降の退行判定はこの結果を基準にする

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 3つのストーリーが共通で使う土台(タブの保持形、フォーム部品の拡張、定数・文言)を
整える。**このフェーズでは利用者から見える振る舞いを変えない**(出力行の `[タブ] 名前 本文` は
そのまま)。

**⚠️ CRITICAL**: Phase 3 以降はこのフェーズの完了なしに開始できない

- [X] T003 `src/utils/convert-utils.ts` の `convertDicelog` で、`tab` に入れる文字列から角括弧を外す(`<span> [main]</span>` → `main`)。`DiceLog.tab` は括弧なしで保持し、出力時に付け直す方針を `src/types/DiceLog.ts` の `tab` フィールドにコメントで残す([research.md](./research.md) R5)
- [X] T004 `src/utils/grep-utils.ts` の `toOutputLine` を `[${tab}] ${name} ${content}` に変更し、`tab` が空文字のときは `${name} ${content}` にする(T003 に依存。既存の画面出力 `[メイン] 名前 本文` を維持するため)
- [X] T005 `src/utils/grep-utils.test.ts` の期待値を `メイン アリス …` から `[メイン] アリス …` に更新し、`tab: ""` の行が `[]` なしで出るケースを1つ足す(T004 に依存)
- [X] T006 [P] `src/components/forms/Select.tsx` に任意の props `id` / `ariaLabel` / `defaultValue` を足す。`id` 未指定時は従来の `"select"`、`ariaLabel` は `<select aria-label>` に渡す。`defaultValue` 指定時はそれを `<select defaultValue>` に使い、hidden の placeholder option は出さない。既存の呼び出し(名前プルダウン)は引数なしで従来通り動くこと([research.md](./research.md) R7)
- [X] T007 [P] `src/constants/message.ts` に UI 文言を追加する: `TAB_NAME = "タブ"`、`ALL_TABS = "すべて"`、`GROWTH_CHECK = "成長チェック"`、`EXCLUDE_MYTHOS_AND_CREDIT = "クトゥルフ神話・信用を除外する"`、`GROWTH_CHECK_EVIDENCE = "根拠"`
- [X] T008 [P] `src/constants/dicelog.ts` に成長チェック用の定数を追加する: `GROWTH_CHECK_SUCCESS_RESULTS`(クリティカル / イクストリーム成功 / ハード成功 / レギュラー成功 / 成功)、`GROWTH_CHECK_ALWAYS_EXCLUDED`(STR CON DEX APP POW SIZ INT EDU アイデア 知識 幸運 正気度ロール)、`GROWTH_CHECK_OPTIONAL_EXCLUDED`(クトゥルフ神話 信用)。値は [data-model.md](./data-model.md) §4 の通り
- [X] T009 `src/app/trpg/ccfolia-grep/page.tsx` の名前プルダウンに `ariaLabel={CHARACTER_NAME}` を渡し、`src/app/trpg/ccfolia-grep/page.test.tsx` の `getByRole("combobox")` / `findByRole("combobox")` を `{ name: "キャラクター名" }` 付きに変更する(T006 に依存。Phase 5 で2つ目の combobox を足しても既存テストが曖昧にならないようにする)
- [X] T010 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、T002 と同じく全て通ることを確認する

**Checkpoint**: タブは括弧なしで保持され、`Select` は複数置ける。画面の見え方は変更前と同一

---

## Phase 3: User Story 4 - JSON形式のログも読み込む (Priority: P1) 🎯 MVP

**Goal**: CCFOLIA の JSON 書き出しを、HTML と同じ操作で読み込めるようにする。読み込んだ後は
既存の名前一覧・成功度絞り込み・コピーがそのまま使える。

**Independent Test**: JSON のサンプルをアップロードすると名前が並び、名前を選んで `Submit`
すると `[main] 名前 CC<=30 【回避】 (1D100<=30) … ＞ 失敗` の形の行が結果に出る。壊れた
JSON では名前が空のまま画面が壊れない。

- [X] T011 [US4] `src/utils/convert-utils.ts` に `convertJsonDicelog(json: unknown): DiceLog[]` を追加する。`messages` の各要素から `tab = channelName`、`name`、`content` を作る。`type === "system"` の要素は生成しない。`text` の改行は既存 `toSingleLineContent` と同じ規則(` / ` 区切り、断片の前後空白除去、空断片除外)でつなぎ、`extend.roll.result` が文字列ならさらに半角スペース1つで結合する(HTML 書き出しのロール行と同じ形)。`name` / `channelName` が文字列でなければ `""`。`toSingleLineContent` のプレーンテキスト版を切り出して HTML 側と共有する([contracts/log-conversion.md](./contracts/log-conversion.md)、[research.md](./research.md) R2・R6)
- [X] T012 [US4] `src/utils/convert-utils.ts` に `parseDicelog(raw: string): DiceLog[]` を追加する。`raw.trim()` が `{` で始まれば `JSON.parse` を試み、成功して `messages` が配列なら `convertJsonDicelog`、それ以外(parse 失敗 / `messages` なし)は `[]`。`{` で始まらなければ `convertDicelog`。例外を外に投げない([research.md](./research.md) R1)(T011 に依存)
- [X] T013 [US4] `src/utils/convert-utils.test.ts` に JSON 変換のテストを追加する: 通常行の変換、ロール行が `text result`(半角スペース区切り)に結合されること、`text` 内改行が ` / ` になること、`system` 行が出ないこと、`name` 欠落が `""` になること、`parseDicelog` の判別(HTML / JSON / 壊れた JSON → `[]` / `messages` なし → `[]` / 空文字 → `[]`)、HTML の `tab` が括弧なしで出ること(T012 に依存)
- [X] T014 [US4] `src/app/trpg/ccfolia-grep/page.tsx` の `readFile` で `convertDicelog` の代わりに `parseDicelog` を呼ぶ(T012 に依存)
- [X] T015 [US4] `src/app/trpg/ccfolia-grep/page.test.tsx` に、JSON サンプル(`messages` 2〜3件、うち1件はロール行、1件は `system` 行)をアップロード → 名前選択 → `Submit` で結合済みの1行が表示され、`system` 行の名前が選択肢に出ないテストを追加する。壊れた JSON をアップロードしても combobox が空のまま例外が出ないテストも足す(T014 に依存)
- [X] T016 [US4] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を通す

**Checkpoint**: JSON ログが HTML と同じ操作で読み込め、既存の絞り込み・コピーがそのまま使える

---

## Phase 4: User Story 5 - 成長チェックを付けられる技能を一覧にする (Priority: P1)

**Goal**: 選んだ探索者について、ルール(FR-022〜030)に沿って成長チェック対象の技能名を
重複なく一覧にし、根拠行を画面で確認でき、技能名だけを Discord 向けにコピーできる。

**Independent Test**: JSON サンプルで探索者を選び `Submit` すると、2つ目のテキストボックスに
`**名前** 成長チェック` と技能名が並び、その下の `根拠` に判定行が出る。`【DEX】` や
ボーナスダイス付き成功、失敗のみの技能は載らない。除外チェックを外すとクトゥルフ神話が載る。

- [X] T017 [P] [US5] `src/types/GrowthCheck.ts` を新規作成し、`ParsedCheckRoll`(`diceModifier: number` / `skill: string` / `succeeded: boolean`)と `GrowthCheck`(`skill: string` / `evidence: DiceLog`)を定義する([data-model.md](./data-model.md) §2・§3)
- [X] T018 [US5] `src/utils/growth-check-utils.ts` を新規作成し、`parseCheckRoll(content: string): ParsedCheckRoll | null` を実装する。正規表現 `^CC(-?\d+)?<=\d+\s*h?\s*(.*?)\s*\(1D100<=\d+\)`(`i` フラグ)で `diceModifier`(未指定は 0)と `skill`(trim のみ、`【】` はそのまま)を取り、`content` の最後の `＞` 以降を trim した文字列が `GROWTH_CHECK_SUCCESS_RESULTS` に含まれれば `succeeded = true`。一致しなければ `null`。正規表現の意図(全角空白・`h` の位置ゆれ・閉じ括弧欠落を許す理由)をコメントで残す([research.md](./research.md) R3)(T017 に依存)
- [X] T019 [US5] `src/utils/growth-check-utils.ts` に `collectGrowthChecks(logs: DiceLog[], selectName: string, selectTab: string, options: { excludeMythosAndCredit: boolean }): GrowthCheck[]` を実装する。[data-model.md](./data-model.md) §3 のルール 1〜8 をこの順で適用し(`selectTab === ""` は全タブ、`tab === ""` の行は全タブ時のみ)、除外判定は `skill` の先頭 `【` と末尾 `】` を外したコアと除外集合の完全一致で行う。`skill` で重複排除して初出の行を `evidence` に残し、出現順で返す(T018 に依存)
- [X] T020 [US5] `src/utils/growth-check-utils.ts` に `formatGrowthChecks(selectName: string, checks: GrowthCheck[]): string[]` を実装する。戻り値は `["**名前** 成長チェック", "```", ...技能名, "```"]`。空でも見出しと囲みを返す(T019 に依存)
- [X] T021 [US5] `src/utils/growth-check-utils.test.ts` を新規作成し、[contracts/growth-check.md](./contracts/growth-check.md) の表をそのままケースにする: `parseCheckRoll` の 11 ケース(全角空白・`h` の2位置・ボーナス/ペナルティ・技能名なし・ファンブル・`CC` 系でない3種)、`collectGrowthChecks` の 10 ケース(重複・ボーナスあり/なし混在・成功失敗混在・特性値/アイデア/正気度の除外・クトゥルフ神話の選択除外 ON/OFF・タブ不一致・`tab: ""` の扱い)、`formatGrowthChecks` の通常と空(T020 に依存)
- [X] T022 [US5] `src/app/trpg/ccfolia-grep/page.tsx` に成長チェックを組み込む: `excludeMythosAndCredit` の ref(初期 `true`)、成功度チェックボックスの下に `HorizontalCheckBox`(`label={GROWTH_CHECK}`、項目 `[EXCLUDE_MYTHOS_AND_CREDIT]`、初期チェック済み)を置き、`onClickExecute` で `collectGrowthChecks(dicelog.current, selectName.current, "", { excludeMythosAndCredit })` を呼んで `growthChecks` state に入れる。既存の `CopyTextBox` の下に2つ目の `CopyTextBox`(`textList={formatGrowthChecks(selectName.current, growthChecks)}`)と、見出し `GROWTH_CHECK_EVIDENCE` 付きの `<ul>` で各件を `技能名 — [tab] 名前 本文` と表示する。専用コンポーネントは作らない([contracts/page-ui.md](./contracts/page-ui.md)、[research.md](./research.md) R8)(T020 に依存)
- [X] T023 [US5] `src/app/trpg/ccfolia-grep/page.test.tsx` に結合テストを追加する: ロール行(通常成功・`【DEX】` 成功・`CC1<=` 成功・失敗・`【クトゥルフ神話】` 成功)を含む JSON サンプルで、`Submit` 後に `**名前** 成長チェック` と対象技能だけが表示され、`根拠` にその判定行が出ること。`クトゥルフ神話・信用を除外する` を外して `Submit` すると `【クトゥルフ神話】` が載ること。既存の成功度チェックボックスを外しても成長チェックは変わらないこと(T022 に依存)
- [X] T024 [US5] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を通す

**Checkpoint**: 成長チェック一覧が出て、コピーでき、根拠行が確認できる(タブは「すべて」固定)

---

## Phase 5: User Story 6 - タブで対象を絞り込む (Priority: P2)

**Goal**: ログのタブをプルダウンで1つ選び、絞り込み結果と成長チェック一覧の両方をそのタブの
行だけから作る。初期状態と再読込後は「すべて」。

**Independent Test**: 2つのタブを持つサンプルで、タブを選んで `Submit` するとそのタブの行だけが
結果・成長チェックに出る。名前の選択肢は変わらない。別ファイルを読み込むとタブが「すべて」に
戻る。

- [X] T025 [US6] `src/utils/grep-utils.ts` に `grepTabnames(dicelog: DiceLog[]): string[]`(空文字を除き重複なくソート)を追加し、`grepDicelog` に第4引数 `selectTab = ""` を足して、`""` 以外なら `log.tab === selectTab` の行だけを対象にする([contracts/growth-check.md](./contracts/growth-check.md) 末尾)
- [X] T026 [US6] `src/utils/grep-utils.test.ts` に `grepTabnames` のテスト(重複・空文字除外・ソート)と、`grepDicelog` のタブ指定あり/なし、`tab: ""` の行が「すべて」のときだけ出るケースを追加する(T025 に依存)
- [X] T027 [US6] `src/app/trpg/ccfolia-grep/page.tsx` にタブ選択を組み込む: `tabList` state(`readFile` で `grepTabnames` を設定)、`fileVersion` state(`readFile` ごとに +1)、`selectTab` ref(初期 `""`)。名前プルダウンの下に `Select`(`id="select-tab"`、`ariaLabel={TAB_NAME}`、`defaultValue={ALL_TABS}`、`selectList={[ALL_TABS, ...tabList]}`、`key={fileVersion}`)を置き、`onChangeSelectBox` で `ALL_TABS` なら `""`、それ以外はその値を `selectTab.current` に入れる。`onClickExecute` の `grepDicelog` と `collectGrowthChecks` に `selectTab.current` を渡す([research.md](./research.md) R7)(T025 に依存)
- [X] T028 [US6] `src/app/trpg/ccfolia-grep/page.test.tsx` に結合テストを追加する: `main` と `other` の2タブを持つ JSON サンプルで、タブ `other` を選んで `Submit` すると `main` の行が結果・成長チェックから消えること、名前プルダウンの選択肢は変わらないこと、別ファイルをアップロードするとタブの combobox が `すべて` に戻ること。HTML サンプルでも同じタブ名(`[メイン]` → `メイン`)が選択肢に出ること(T027 に依存)
- [X] T029 [US6] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を通す

**Checkpoint**: タブ絞り込みが結果と成長チェックの両方に効き、再読込で「すべて」に戻る

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 実ログでの目視確認と、US1〜US3 の退行がないことの最終確認

- [X] T030 [quickstart.md](./quickstart.md) の「画面での確認」1〜5 を手元の実ログ(HTML と JSON の1組)で実施する。特に §2 で HTML と JSON の結果が一致すること(ロール行の区切りが半角スペースで揃っていること)を確認する([research.md](./research.md) R2)
- [X] T031 §3 の目視照合(SC-006)で、特性値・アイデア・知識・幸運・正気度・ボーナスダイス付きの成功が一覧に**載っていない**こと、ペナルティダイス付きの成功が載っていることを確認し、食い違いがあれば `src/utils/growth-check-utils.ts` とそのテストを直す
- [X] T032 `src/app/trpg/ccfolia-grep/page.tsx` のレイアウトをモバイル幅(Tailwind `sm` 未満)で確認し、2つ目の `CopyTextBox` と根拠行が横にはみ出さないことを確認する
- [X] T033 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` を実行し、CI と同じ一式が通ることを確認する。既存の US1〜US3 のテスト(`page.test.tsx` の3ケース、`grep-utils.test.ts`)が意図を変えずに通っていること
- [X] T034 [specs/003-ccfolia-grep/spec.md](./spec.md) と実装に食い違いがないか見直す(出力形式、除外集合、初期状態)。あれば spec を先に直す(constitution 原則3)。実ログをリポジトリに含めていないことを `git status` で確認して PR を作る(spec との照合・実ログ非含有の確認まで完了。PR 作成は利用者の指示待ち)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし
- **Phase 2 (Foundational)**: Phase 1 の後。**すべてのストーリーをブロックする**
- **Phase 3 (US4 JSON)**: Phase 2 の後
- **Phase 4 (US5 成長チェック)**: Phase 2 の後。JSON サンプルをテストに使うため **Phase 3 の後**に進めるのが実務上は楽(HTML サンプルでも書けるので厳密には独立)
- **Phase 5 (US6 タブ)**: Phase 2 の後。`collectGrowthChecks` にタブを渡すため **Phase 4 の後**
- **Phase 6 (Polish)**: 全ストーリーの後

### Within Each Story

- 型 → 純粋関数 → ユニットテスト → ページ組み込み → 結合テスト → CI 一式

### Parallel Opportunities

- Phase 2: T006(Select)/ T007(message.ts)/ T008(dicelog.ts)は互いに独立で並行可
- Phase 4: T017(型)は T011〜T016 と並行可
- Phase 3 と Phase 4 の utils 部分(T011〜T013 と T017〜T021)は別ファイルなので並行可。
  `page.tsx` を触る T014 / T022 / T027 は順に行う

---

## Implementation Strategy

### MVP First(Phase 1〜3)

1. Phase 1 → Phase 2 で土台を作る(見た目は変わらない)
2. Phase 3 で JSON が読めるようになる。**ここで一度動く状態**(手元の JSON ログで既存の
   絞り込み・コピーが使える)
3. 動作確認してから次へ

### Incremental Delivery

- Phase 4 を足すと成長チェック一覧が出る(この改修の主目的)
- Phase 5 を足すとタブで絞れる
- 各 Checkpoint で `pnpm test` が通る状態を保ち、PR は1本にまとめてよい(画面1つの改修)

### Notes

- 実ログ(`*_log.json` / HTML)はテストフィクスチャにもコミットにも含めない
- 技能名は正規化しない(FR-029)。テストで `【目星】` と `目星` が別々に出ても仕様通り
- `DiceLog.tab` の保持形を変えた影響は `grep-utils.test.ts` の期待値のみ(R5)
