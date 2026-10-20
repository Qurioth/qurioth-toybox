---

description: "動画一覧の作業一覧"
---

# Tasks: 動画一覧

**Input**: Design documents from `/specs/010-movie/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/movie-page.md](./contracts/movie-page.md) /
[quickstart.md](./quickstart.md)

**Tests**: 含める(テスティングトロフィー、ADR-0008)。

- 並び順の規則は純粋関数のユニットテストで確かめる。
- 一覧の表示は `MovieList` に任意のデータを渡す結合テストで確かめる(データのモックは使わない)。
- 手で書き足すデータは、データのテストで書き間違いを止める。
- `/other` の入口は結合テストで確かめる。

**Organization**:

- US1(動画が並び、その場で再生できる)を MVP とする。
- US2(撮影場所・撮影日・メモ)は US1 の `MovieCard` に項目を足す。
- US3(`/other` の区分)は他と独立して進められる。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US1〜US3)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ。

- 画面: `src/app/other/movie/`(ページ専用の部品も同じディレクトリに置く)
- テスト: 対象と同じディレクトリに `*.test.ts(x)` として置く。`describe` / `it` / `expect` は
  `vitest` から明示 import する。
- 整形は Biome に任せる(2スペース / ダブルクォート / LF)。

---

## Phase 1: Setup

**Purpose**: 着手前の状態を確かめる

- [X] T001 `pnpm test` と `pnpm typecheck` を実行し、着手前にすべて通ることを確かめる(失敗があれば
  本件と無関係かを切り分けてから進める)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: どのストーリーも使うデータの型と、埋め込み部品の遅延読み込み

**⚠️ CRITICAL**: US1・US2 はこのフェーズの完了後に着手する

- [X] T002 [P] `src/data/youtube/movie/movie-videos.ts` を新規作成する。data-model.md の
  `MovieVideo` 型(`videoId: string` / `title: string` / `location?: string` / `shotAt?: string` /
  `note?: string`)を export し、各フィールドに用途と書式(`shotAt` は `YYYY-MM-DD`)を JSDoc で
  書く。`export const movieVideos: MovieVideo[] = [];` とし、実データはオーナーが後で書き足す
  (書き方は quickstart.md「動画を追加するとき」)
- [X] T003 [P] `src/components/YoutubeEmbed.tsx` の iframe 2つ(動画・再生リスト)に
  `loading="lazy"` を加える。それ以外(大きさ・`allow`・`title`)は変えない(research R1・R2)

**Checkpoint**: データの型と遅延読み込みの準備ができた

---

## Phase 3: User Story 1 - 旅先で撮った動画を眺める (Priority: P1) 🎯 MVP

**Goal**: `/other/movie` に登録した動画が撮影日の新しい順で並び、その場で再生できる。0件ならその旨を示す。

**Independent Test**: `MovieList` に撮影日の異なる動画を渡すと、新しい順に `article` が並び、
それぞれに `youtube.com/embed/<videoId>` の iframe(`loading="lazy"`)とタイトルの `h2` がある。
空配列を渡すと「公開している動画はまだありません。」が出る。

### Tests for User Story 1

- [X] T004 [P] [US1] `src/utils/movie-utils.test.ts` を新規作成する。`sortMoviesByShotAt` について
  次を確かめる: (1) `shotAt` の新しい順に並ぶ、(2) 同じ `shotAt` 同士は入力の順を保つ、
  (3) `shotAt` が無いものは末尾に入力の順で並ぶ、(4) 入力の配列を変更しない
- [X] T005 [P] [US1] `src/app/other/movie/MovieList.test.tsx` を新規作成する。`MovieList` に
  テスト内で作った `MovieVideo[]` を渡し、次を確かめる:
  (1) 動画1本につき `article` が1つあり、その中に `h2` のタイトルと、`src` が
  `https://www.youtube.com/embed/<videoId>` で `loading="lazy"` の iframe がある、
  (2) `article` の並びが撮影日の新しい順(撮影日なしは末尾)、
  (3) 空配列のとき「公開している動画はまだありません。」が表示され、`article` が無い
- [X] T006 [P] [US1] `src/data/youtube/movie/movie-videos.test.ts` を新規作成する。`movieVideos` の
  全件について data-model.md の検証ルールを確かめる: `videoId` が重複しない、`title` が空白だけで
  ない、`shotAt` があれば `YYYY-MM-DD` の形で実在する日付(例: `2026-02-30` を弾く)。0件でも
  通ること

### Implementation for User Story 1

- [X] T007 [US1] `src/utils/movie-utils.ts` を新規作成し、
  `sortMoviesByShotAt(movies: MovieVideo[]): MovieVideo[]` を実装する。元の配列を複製してから
  安定ソートで並べる(`shotAt` のあるものを文字列の降順、無いものは末尾)。T004 が通ること
- [X] T008 [US1] `src/app/other/movie/MovieCard.tsx` を新規作成する。`{ movie: MovieVideo }` を受け、
  `article` の中に `YouTubeEmbed`(`videoId` を渡す)と `h2` のタイトルを置く。見た目は
  `src/app/trpg/replay/ReplayCard.tsx` のカード(枠線・角丸・ダークモードの配色)に合わせ、
  タイトルは `break-words` で折り返す。`"use client"` は付けない
- [X] T009 [US1] `src/app/other/movie/MovieList.tsx` を新規作成する。`{ movies: MovieVideo[] }` を
  受け、`sortMoviesByShotAt` で並べて `MovieCard` を描画する(key は `videoId`)。並びは
  `grid grid-cols-1 lg:grid-cols-2`、狭い画面で幅いっぱい。0件のときは一覧の代わりに
  「公開している動画はまだありません。」を表示する。T005 が通ること
- [X] T010 [US1] `src/app/other/movie/page.tsx` を新規作成する。default export は `MoviePage`。
  `Template` の中に見出し `h1`「Movie」と `<MovieList movies={movieVideos} />` を置く。見出しの
  大きさは `src/app/trpg/replay/page.tsx` の `h1` に合わせる。状態を持たないので `"use client"` は
  付けない(plan.md Post-design re-check)

**Checkpoint**: `/other/movie` を直接開けば、動画の一覧として使える(MVP)

---

## Phase 4: User Story 2 - どこでいつ撮った動画かを知る (Priority: P2)

**Goal**: 各動画に撮影場所・撮影日・メモが添えられ、未登録の項目は欄ごと出ない。

**Independent Test**: 全項目ありの動画と一部欠けた動画を `MovieList` に渡すと、登録した項目だけが
項目名つきで表示され、「未設定」などの表記は出ない。

### Tests for User Story 2

- [X] T011 [US2] `src/app/other/movie/MovieList.test.tsx` に次のテストを追加する:
  (1) 全項目のある動画の `article` に「撮影場所」「撮影日」「メモ」の項目名と値が出る、
  (2) 項目が未登録または空白だけの動画では、その項目名が `article` 内に出ず、「未設定」も出ない、
  (3) 改行を含むメモの各行の文字列が `article` 内にすべて含まれる

### Implementation for User Story 2

- [X] T012 [US2] `src/app/other/movie/MovieCard.tsx` のタイトルの下に `dl` を追加し、
  撮影場所・撮影日・メモを `dt`(項目名)/ `dd`(値)で並べる。値が未登録または空白だけの項目は
  `dt` ごと描画しない。撮影日は `YYYY-MM-DD` のまま表示する。メモは `whitespace-pre-line` で
  改行を保ち、長い文字列は `break-words` で折り返す。項目名の見た目は `ReplayCard.tsx` の `dl` に
  合わせる。T011 が通ること

**Checkpoint**: 再生前に、どこでいつ撮った動画かが分かる

---

## Phase 5: User Story 3 - `/other` から動画一覧へ移動する (Priority: P2)

**Goal**: `/other` に写真と同じ形式で Movie の区分があり、1操作で動画一覧へ移れる。

**Independent Test**: `/other` を描画すると、見出し「Photograph」「Movie」があり、「Movie」の
リンクが `/other/movie` を指す。

### Tests for User Story 3

- [X] T013 [P] [US3] `src/app/other/page.test.tsx` を新規作成する。`DarkModeProvider`
  (`@/contexts/dark-mode-context`)で包んで `OtherPage` を描画し、次を確かめる:
  (1) 見出し「Photograph」「Movie」がこの順で並ぶ、(2) リンク「Photograph」の `href` が
  `/other/photograph`、(3) リンク「Movie」の `href` が `/other/movie`

### Implementation for User Story 3

- [X] T014 [US3] `src/app/other/page.tsx` のコメントアウトされた Movie の区分を削除し、写真の区分の
  直後に同じ構造(`h2`「Movie」と、`PillLink` で `href="/other/movie"`、文言「Movie」)で
  Movie の区分を追加する。T013 が通ること

**Checkpoint**: ヘッダーの OTHER から1操作で動画一覧へ行ける(008-other FR-004)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: CI と同じ検査と、画面での確認

- [X] T015 `pnpm lint`、`pnpm format:check`、`pnpm typecheck`、`pnpm test`、`pnpm build` をすべて通す
  (整形の差分は `pnpm format` で直す)
- [X] T016 quickstart.md「画面での確認」の手順 1〜6 を開発サーバーで行う。確認用に一時的に入れた
  データは、確認後に `movieVideos` から外して空配列に戻す(実データはオーナーが入れる)
- [X] T017 `/trpg/replay` を開き、リプレイの動画が従来どおり表示・再生できることを確かめる
  (T003 の退行確認)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup(Phase 1)**: 依存なし
- **Foundational(Phase 2)**: Setup の後。US1・US2 の前提
- **US1(Phase 3)**: Foundational の後
- **US2(Phase 4)**: US1 の後(`MovieCard` と `MovieList.test.tsx` に足すため)
- **US3(Phase 5)**: Setup の後ならいつでも。他のストーリーとファイルが重ならない
- **Polish(Phase 6)**: すべてのストーリーの後

### Within Each Story

- テストを先に書き、失敗することを確かめてから実装する。
- US1 は T007(並べ替え)→ T008(カード)→ T009(一覧)→ T010(ページ)の順。

### Parallel Opportunities

- T002 と T003(別ファイル)
- T004・T005・T006(別ファイルのテスト)
- US3 の T013・T014 は、US1・US2 と並行して進められる

### Parallel Example: User Story 1

```text
# テストを並行して書く
T004 src/utils/movie-utils.test.ts
T005 src/app/other/movie/MovieList.test.tsx
T006 src/data/youtube/movie/movie-videos.test.ts
```

---

## Implementation Strategy

### MVP First

1. Phase 1・2 を終える。
2. Phase 3(US1)を終え、`/other/movie` を直接開いて一覧と再生を確かめる。
3. ここで止めても、動画を並べて再生する画面として成り立つ。

### Incremental Delivery

1. US1 → 動画の一覧(MVP)
2. US2 → 撮影場所・撮影日・メモ
3. US3 → `/other` からの導線(公開前に必ず入れる。導線が無いと画面に辿り着けない)
4. Polish → CI と画面での確認
