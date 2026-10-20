# Data Model: 動画一覧

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-20

## MovieVideo(動画)

置き場所: `src/data/youtube/movie/movie-videos.ts`(型 `MovieVideo`、配列 `movieVideos`)

| フィールド | 型 | 必須 | 内容 |
| -- | -- | -- | -- |
| `videoId` | `string` | ✅ | YouTube の動画ID(`https://youtu.be/<videoId>` の `<videoId>` 部分) |
| `title` | `string` | ✅ | 画面に出すタイトル。YouTube 側のタイトルと揃える必要はない |
| `location` | `string` | — | 撮影場所(例: `京都`、`台湾`) |
| `shotAt` | `string` | — | 撮影日。`YYYY-MM-DD` |
| `note` | `string` | — | メモ。改行を含めてよい(画面でもそのまま改行する) |

### 検証ルール

データのテスト(`movie-videos.test.ts`)で次を確かめる。オーナーが手で書き足すため、書き間違いを
CI で止める。

- `videoId` が全件で重複しない(一覧の React の key にも使う)。
- `title` が空白だけでない。
- `shotAt` があれば `YYYY-MM-DD` の形で、実在する日付である。

### 表示上の扱い

- `location` / `shotAt` / `note` が未登録、または空白だけのときは、欄ごと出さない(FR-003)。
- 再生リストは扱わない(spec Assumptions)。`playlistId` は持たない。

## 並び順(FR-004)

`src/utils/movie-utils.ts` の `sortMoviesByShotAt(movies)` が、新しい配列を返す(元の配列は
変えない)。

1. `shotAt` のあるものを、新しい日付から順に並べる。
2. `shotAt` が同じものは、配列に登録した順のまま。
3. `shotAt` の無いものは、1・2 のすべての後ろに、登録した順で並べる。

## 状態遷移

なし。画面は登録データを並べるだけで、利用者の操作で変わる状態を持たない
(再生・停止は埋め込みプレーヤーの中で完結する)。
