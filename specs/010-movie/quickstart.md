# Quickstart: 動画一覧

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## 自動テスト

```bash
pnpm test
```

主に確かめること:

- `src/utils/movie-utils.test.ts`: 並び順の3つの規則(data-model.md「並び順」)
- `src/app/other/movie/MovieList.test.tsx`: 項目の出し分け、並び順、0件の表示、`loading="lazy"`
- `src/data/youtube/movie/movie-videos.test.ts`: 登録データの検証ルール
- `src/app/other/page.test.tsx`: Movie の入口が `/other/movie` を指す

あわせて、CI と同じ検査を通す。

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm build
```

## 画面での確認

1. `pnpm dev` を起動し、`http://localhost:3000/other` を開く。
   - 写真の下に Movie の区分があり、入口から `/other/movie` に移れる(US3)。
2. `movieVideos` が空の状態で `/other/movie` を開く。
   - 「公開している動画はまだありません。」と表示される(spec US1-4)。
3. `src/data/youtube/movie/movie-videos.ts` に、撮影日の異なる動画を3本以上と、撮影場所・撮影日・
   メモの一部を省いた動画を登録して開き直す。
   - 撮影日の新しい順に並び、撮影日の無い動画が末尾に来る(US1-3)。
   - 省いた項目は欄ごと消えている(US2-2)。
   - プレーヤーで再生すると、画面を移動せずに再生される(US1-2)。
4. 開発者ツールの Network で `youtube.com/embed` への要求を見ながら下へスクロールする。
   - 最初は表示範囲付近の動画の分だけ要求され、スクロールに応じて増える(FR-006)。
   - 本数が少なく全件が画面に収まる場合はすべて読み込まれる(想定どおり)。
5. 開発者ツールで幅 375px にして見る。
   - 1列で並び、横スクロールが出ない(SC-004)。
6. ダークモードに切り替え、文字と背景が読める配色であることを見る。

## 動画を追加するとき(オーナー向け)

`src/data/youtube/movie/movie-videos.ts` の `movieVideos` に1件書き足す。並び順は画面側で
決まるので、どこに書き足してもよい。

```ts
{
  videoId: "XXXXXXXXXXX",   // https://youtu.be/XXXXXXXXXXX の部分
  title: "嵐山の竹林",
  location: "京都",          // 任意
  shotAt: "2026-04-05",      // 任意。YYYY-MM-DD
  note: "朝7時ごろ。",       // 任意
},
```

YouTube 側で「埋め込みを許可」がオフの動画は、プレーヤー内で再生できない旨が出る。
