# Implementation Plan: 動画一覧

**Branch**: `010-movie` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-movie/spec.md`(あわせて
[008-other](../008-other/spec.md) の FR-004)

## Summary

旅行などでオーナーが撮った YouTube 動画を、`/other/movie` に新しい順で並べて再生できるようにする。
`/other` には Movie の区分を加える。

**技術方針**

- **データ**: `src/data/youtube/movie/movie-videos.ts` に動画ID・タイトル・撮影場所・撮影日・
  メモを持つ(research R4)。
- **並び順**: 撮影日(`YYYY-MM-DD`)の降順に並べる純粋関数を `src/utils/movie-utils.ts` に置く(R3)。
- **遅延読み込み**: 既存の `YoutubeEmbed` の iframe に `loading="lazy"` を付け、ブラウザ標準の
  遅延読み込みに任せる。件数で区切る仕組みは作らない(R1・R2)。
- **画面**: ページはデータを渡すだけにし、一覧(`MovieList`)と1本分(`MovieCard`)に分ける(R5)。

## Technical Context

**Language/Version**: TypeScript 5(strict)、Node.js 24(`mise.toml`)

**Primary Dependencies**: 既存のみ。

- Next.js 16(App Router)、React 19、Tailwind CSS 3
- 既存部品: `Template`、`PillLink`、`YoutubeEmbed`
- 依存の追加なし

**Storage**: リポジトリ内のファイル(`src/data/youtube/movie/movie-videos.ts`)

**Testing**: Vitest(jsdom)+ React Testing Library。

- ユニットテスト: 並び順
- 結合テスト: 一覧の表示(項目の出し分け・並び順・0件・遅延読み込みの属性)、`/other` の入口
- データのテスト: 登録データの検証ルール

**Target Platform**: Web(デスクトップと幅 375px 以上のモバイルブラウザ。ダークモード対応)

**Project Type**: Next.js Web アプリ(単一プロジェクト)

**Performance Goals**: 本数が増えても、最初の動画が見えるまでの待ち時間が変わらない(SC-003)。
表示範囲から離れたプレーヤーは読み込まない。

**Constraints**:

- 幅 375px でページの横スクロールなし(SC-004)。
- 未登録の項目は欄ごと出さない(FR-003)。
- 読み込み前後でプレーヤーの位置がずれない(FR-007)。
- リプレイ一覧の見た目・振る舞いを変えない(`YoutubeEmbed` の変更は遅延読み込みの属性だけ)。

**Scale/Scope**:

- 動画は当面数本〜数十本。
- 作るもの: ページ1つ、部品2つ、純粋関数1つ、データ1ファイル、`/other` の区分の追加。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
| -- | -- | -- |
| 1. 過剰実装をしない | ✅ | 遅延読み込みはブラウザ標準の属性で済ませ、件数区切り・サムネイル差し替えは作らない(R1)。検索・絞り込み、再生リスト、限定公開は spec の範囲外 |
| 2. 既存の慣習に合わせる | ✅ | ページは `src/app/other/movie/page.tsx`(`MoviePage`)。埋め込みは既存の `YoutubeEmbed` を再利用(R2)。データは `src/data/youtube/<区分>/`、純粋関数は `src/utils/movie-utils.ts`。`/other` から `PillLink` で辿れる。UI 文言は日本語 |
| 3. 仕様は「なぜ」を残す | ✅ | `/other` に区分を加える変更は、008-other の spec を先に更新済み。新しい画面なので `specs/010-movie/` を新設(ADR-0013) |
| 4. 大きな判断は ADR に記録する | ✅ | 依存の追加・データ構造の破壊的変更・外部サービス連携の追加なし。ADR 不要(R7) |
| 5. 小さな変更に SDD を課さない | — | 新しい画面の追加なので SDD の対象 |
| 6. テストは目的に見合う分だけ | ✅ | 並び順の規則、項目の出し分け、手で書くデータの書き間違いに絞る。カバレッジ目標は設けない |

**Post-design re-check(Phase 1 後)**: ✅ 違反なし。

- `YoutubeEmbed` の変更でリプレイ一覧の iframe も遅延読み込みになる。006-replay の spec と
  食い違わない(R2)ため、006-replay の spec は更新しない。
- ページを `"use client"` にしないのは既存の `/other` 配下と異なるが、状態を持たない画面に
  付ける理由が無いため(CLAUDE.md の規約は「クライアントコンポーネントには明示」であり、
  付けないことと矛盾しない)。

## Project Structure

### Documentation (this feature)

```text
specs/010-movie/
├── spec.md              # 画面の現行仕様
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 遅延読み込み、部品の再利用、並び順、データの置き場所、画面の分け方
├── data-model.md        # Phase 1: MovieVideo、並び順
├── quickstart.md        # Phase 1: テストと画面での確認手順、動画の追加方法
├── contracts/
│   └── movie-page.md    # 画面の振る舞い(/other/movie と /other の区分)
├── checklists/requirements.md
└── tasks.md             # Phase 2(/speckit-tasks で作る)
```

### Source Code (repository root)

```text
src/
├── app/other/
│   ├── page.tsx                      # 改修: Movie の区分(見出し + PillLink)を写真の下に追加。旧案のコメントを削除
│   ├── page.test.tsx                 # 新規: 写真・Movie の入口がそれぞれの画面を指す
│   └── movie/
│       ├── page.tsx                  # 新規: MoviePage。Template + 見出し + <MovieList movies={movieVideos} />
│       ├── MovieList.tsx             # 新規: 並べ替え、1列/2列の並び、0件の表示
│       ├── MovieCard.tsx             # 新規: YoutubeEmbed + タイトル + 撮影場所・撮影日・メモ
│       └── MovieList.test.tsx        # 新規: contracts/movie-page.md の 1 章
├── components/
│   └── YoutubeEmbed.tsx              # 改修: iframe に loading="lazy"
├── data/youtube/movie/
│   ├── movie-videos.ts               # 新規: 型 MovieVideo と movieVideos
│   └── movie-videos.test.ts          # 新規: 検証ルール(data-model.md)
└── utils/
    ├── movie-utils.ts                # 新規: sortMoviesByShotAt
    └── movie-utils.test.ts           # 新規: 並び順の3つの規則
```

**Structure Decision**: 既存の単一 Next.js プロジェクトに、`/other/photograph` と同じ階層で
`/other/movie` を加える。ページ専用の部品はリプレイ一覧(`ReplayCard.tsx`)と同じくページの
ディレクトリに置き、複数画面で使う `YoutubeEmbed` だけを `src/components/` で共有する。

## Complexity Tracking

Constitution Check に違反は無いため、記載なし。
