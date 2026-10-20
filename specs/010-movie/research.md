# Research: 動画一覧

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-20

## R1. プレーヤーを少しずつ読み込む方法(FR-006 / FR-007)

- **Decision**: 動画の埋め込み(iframe)にブラウザ標準の遅延読み込み `loading="lazy"` を付ける。
  枠は `aspect-video`(16:9)で先に大きさを確保する。件数を区切って続きを足す仕組みは作らない。
- **Rationale**:
  - 表示範囲から離れた iframe は、ブラウザが近づくまで読み込まない。JavaScript を書かずに
    FR-006 を満たせる。
  - 枠の大きさは CSS で決まるので、読み込み前後で位置がずれない(FR-007)。
  - 主要ブラウザ(Chrome / Edge / Firefox 121+ / Safari 16.4+)が対応済み。
  - 旅行の動画は多くても数十本の見込みで、DOM に全件を並べても重くならない。
- **Alternatives considered**:
  - リプレイ一覧と同じ、IntersectionObserver で10件ずつ足す方式。本数が少ない画面には仕組みが
    大きすぎる(原則1)。「すべて表示しました」の表示などの付随物も増える。
  - サムネイル画像を並べ、選んだときに iframe に差し替える方式(いわゆる facade)。最も軽いが、
    再生に2回のタップが要り、差し替えの状態管理が増える。数十本の規模では効果に見合わない。

## R2. 埋め込み部品の再利用

- **Decision**: 既存の `src/components/YoutubeEmbed.tsx` を使い、その iframe に
  `loading="lazy"` を加える。
- **Rationale**: 同じ埋め込みを2か所に持たない(原則2)。リプレイ一覧の iframe も遅延読み込みに
  なるが、リプレイ一覧の spec(006-replay SC-002「本数が増えても待たされない」)の向きに沿う変更で、
  仕様との食い違いは生まない。
- **Alternatives considered**: 動画一覧専用の iframe を書く。部品が2つになり、許可属性などの
  変更を2か所で揃える必要が出る。

## R3. 並び順の決め方(FR-004)

- **Decision**: 撮影日は `YYYY-MM-DD` の文字列で持ち、並べ替えは `src/utils/movie-utils.ts` の
  純粋関数で行う。撮影日の降順、同じ日は登録順、撮影日なしは末尾に登録順。
- **Rationale**:
  - `YYYY-MM-DD` は文字列の比較で日付順になる。日付ライブラリは要らない。
  - `Array.prototype.sort` は安定ソート(ES2019 以降)なので、同じ日の登録順はそのまま残る。
  - 規則が3つあるので、ユニットテストで固める(ADR-0008)。
  - リプレイ一覧の実施日(`playedAt`)と同じ書式で、データを書くときに迷わない。
- **Alternatives considered**:
  - データを最初から新しい順に書いてもらい、並べ替えない。書き足す位置を間違えると順序が崩れ、
    FR-004 を保証できない。
  - `Date` 型で持つ。データを手で書くときに冗長で、時刻やタイムゾーンを扱わない spec に対して
    過剰。

## R4. データの置き場所と形

- **Decision**: `src/data/youtube/movie/movie-videos.ts` に、型 `MovieVideo` と配列
  `movieVideos` を置く。
- **Rationale**: リプレイのデータ(`src/data/youtube/trpg/youtube-id.ts`)と同じく、YouTube の
  データを `src/data/youtube/<区分>/` に並べる。型をデータと同じファイルに置くのもリプレイに合わせる。
  spec の前提どおり、リプレイとはデータを共有しない。
- **Alternatives considered**: `src/data/movie/` に置く。`data/youtube/` という既存の区分から
  外れる。

## R5. 画面の組み立てとテストの仕方

- **Decision**:
  - ページ(`page.tsx`)はデータを読んで一覧の部品 `MovieList` に渡すだけにする。
  - `MovieList` が並べ替えと空の表示を受け持ち、動画1本の表示は `MovieCard` に分ける。
  - 結合テストは `MovieList` に任意のデータを渡して行う。
  - ページも状態を持たないので `"use client"` を付けない。
- **Rationale**:
  - データを引数で渡せば、0件・項目欠け・並び順の場面をモジュールのモックなしで作れる
    (ScenarioList と同じ考え方)。
  - サーバーコンポーネントからクライアントコンポーネントの `Template` を描画するのは問題ない。
- **Alternatives considered**: ページ1ファイルにすべて書き、テストで `vi.mock` してデータを
  差し替える。テストごとにモックを書き分けることになり、読みにくい。

## R6. 区分の追加(`/other`、FR-008)

- **Decision**: `src/app/other/page.tsx` のコメントアウトされている Movie の区分を、写真の区分と
  同じ `PillLink` を使う形で有効にする。入口の文言は「Movie」とする。
- **Rationale**: 写真の区分と同じ形式にする(008-other FR-001)。コメントアウトしてある旧案は
  `PillLink` 導入前の書き方なので、写真の区分に合わせて書き直す。

## R7. ADR の要否

- **Decision**: ADR は書かない。
- **Rationale**: 依存の追加、データ構造の破壊的変更、外部サービス連携の追加のいずれにも当たらない
  (原則4)。YouTube の埋め込みはリプレイ一覧で既に使っている。
