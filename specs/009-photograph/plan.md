# Implementation Plan: 写真一覧(アルバム単位)

**Branch**: `009-photograph` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-photograph/spec.md`(保管先と取り込み手順は
[ADR-0017](../../docs/adr/0017-store-photos-in-r2.md))

## Summary

`/other/photograph` をアルバムの一覧にし、`/other/photograph/<slug>` でアルバムの写真を並べる。
縦横が混ざっても列の下端がずれないようにし、画像は Dropbox から Cloudflare R2 に移して、表示幅に
合った軽い画像を出す。写真の公開は、手元のリストから `pnpm photo:sync` で行う。

**技術方針**

- **並べ方**: 行の高さを揃えて並べる純粋関数 `justifyRows`(行の高さの目安 420px。research R1)。
  表示幅を測るまでは写真を並べない(R2)。2026-11-08 に「最も短い列へ入れる」並べ方から変更した。
- **画像**: 幅 640px / 1280px の WebP を `<img srcset>` で出す(R3)。`sharp` で作り、撮影情報は
  書き出さない(R4)。
- **保管と配信**: キーは元の写真の SHA-256 の先頭16文字(R5)。`aws4fetch` で R2 に上げ(R6)、
  `workers/photo/` の Worker で `*.workers.dev` から配信する(R7)。
- **取り込み**: `scripts/photo-sync.ts` がリスト(txt)を読み、圧縮・アップロード・アルバムデータ
  (json と `index.ts`)の生成を行う(R8〜R10)。
- **画面**: アルバムの画面は `generateStaticParams` + `dynamicParams = false` で静的に作る(R11)。
  続きの読み込みは `IntersectionObserver` にする(R12)。

## Technical Context

**Language/Version**: TypeScript 5(strict)、Node.js 24(`mise.toml`)

**Primary Dependencies**:

- 既存: Next.js 16(App Router)、React 19、Tailwind CSS 3、`Template`
- 追加(devDependencies): `sharp`(画像の圧縮と、似た写真を比べる縮小。`next` 経由で既に入っているものを明示する)、
  `aws4fetch`(R2 の S3 互換 API への署名)
- 依存に入れない: `wrangler`(`pnpm dlx` で使う)、`@cloudflare/workers-types`(R7)
- 削除: なし(`dropbox-link.ts` は移行後に削除するデータで、依存ではない)

**Storage**:

- Cloudflare R2(画像)
- リポジトリ: `src/data/photograph/albums/*.json` と `index.ts`(コミット)、`*.txt`(git 管理外)

**Testing**: Vitest(jsdom)+ React Testing Library。

- ユニットテスト: `justifyRows`、アルバムの並び順、`parsePhotoList`、似た写真の比較とグループ分け
- 結合テスト: `AlbumList`、`PhotoGallery`(contracts/photograph-pages.md の1・2章)
- 手で確かめる: スクリプトの入出力、Worker、ルーティングの 404、ブラウザでの見た目
  ([quickstart.md](quickstart.md))

**Target Platform**:

- Web(デスクトップと幅 375px 以上のモバイルブラウザ。ダークモード対応)
- `photo:sync` はオーナーの Windows PC(元の写真がある環境)
- Worker は Cloudflare Workers(無料プラン)

**Project Type**: Next.js Web アプリ(単一プロジェクト)+ 手元で動かすスクリプト + Worker 1つ

**Performance Goals**:

- 幅 375px の端末で1枚あたりに読む画像が約190KB(移行前)より小さい(SC-006)。
- 最初の表示は20枚まで(FR-008)。

**Constraints**:

- 撮影情報を公開しない(FR-014 / SC-007)。
- 元の写真のパスとフォルダ名を公開リポジトリに入れない(ADR-0017)。
- Workers の無料プランは1日10万リクエストまで(ADR-0017)。
- ビルドと CI は R2 にも元の写真にも触らない。生成済みの json だけを読む。
- 生成したファイルは Biome の整形に通す(CI の `format:check`)。

**Scale/Scope**:

- アルバムは当面数個〜数十個、1アルバム数枚〜100枚超、合計で数百枚〜千枚程度。
- 作るもの: ページ2つ(1つは改修)、部品3つ、純粋関数のファイル2つ、スクリプト1つ、
  Worker 1つ、型のファイル1つ、定数1つ。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
| -- | -- | -- |
| 1. 過剰実装をしない | ✅ | 画像は2つの幅だけ(拡大表示がないので大きい版は作らない。R3)。Worker は読むだけで、変換も CORS も持たない(R7)。似た写真は知らせるだけで、画面でまとめる機能は作らない。キャプション・絞り込みは spec の範囲外 |
| 2. 既存の慣習に合わせる | ✅ | ページは `src/app/other/photograph/`。詳細は `[album]/page.tsx`(シナリオの `[id]` と同じ形)。純粋関数は `src/utils/<用途>-utils.ts`、定数は `src/constants/`。スクリプトは `scripts/` に置き、`scenario:draft` と同じく Node.js の型の除去でそのまま実行する。続きの読み込みはリプレイ一覧と同じ `IntersectionObserver`(R12)。`<img>` の抑止は既存と同じく理由を書く(R3) |
| 3. 仕様は「なぜ」を残す | ✅ | spec を先に更新済み(2026-11-08)。詳細画面は ADR-0013 に従い同じ spec に含めた |
| 4. 大きな判断は ADR に記録する | ✅ | 外部サービス(R2・Workers)の追加と、データ構造の作り直しは ADR-0017 に記録済み(Proposed)。画像の幅を ADR の目安から変えたので、ADR の該当行も直した(R3) |
| 5. 小さな変更に SDD を課さない | — | 画面の作り直しなので SDD の対象 |
| 6. テストは目的に見合う分だけ | ✅ | 規則のある純粋関数と、画面の振る舞いに絞る。スクリプトの入出力と Worker は手で確かめる(contracts/photo-worker.md に理由)。カバレッジ目標は設けない |

**Post-design re-check(Phase 1 後)**: ✅ 違反なし。

- 依存を2つ足す(`sharp`、`aws4fetch`)。どちらも devDependencies で、サイトの配信物には入らない。
  ADR-0017 の範囲内の判断なので、新しい ADR は書かない。
- 表示幅は `PhotoGallery` の中で `useLayoutEffect` と `ResizeObserver` で測る(R2)。既存の
  `useMediaQuery` はレイアウトに使わない前提なので使わない。

## Project Structure

### Documentation (this feature)

```text
specs/009-photograph/
├── spec.md              # 画面の現行仕様(2026-11-08 に更新)
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 並べ方、表示幅、画像の大きさ、sharp、キー、R2、Worker、リスト、似た写真、データの形、ルーティング、続きの読み込み
├── data-model.md        # Phase 1: リスト、Album / Photo、index.ts、導出する値、R2、状態、環境変数
├── quickstart.md        # Phase 1: 初回の準備、テスト、最初の1枚での確認、画面での確認、移行、日常の手順
├── contracts/
│   ├── photograph-pages.md   # 画面の振る舞い
│   ├── photo-sync-cli.md     # pnpm photo:sync の入出力
│   └── photo-worker.md       # Worker の HTTP の振る舞い
├── checklists/requirements.md
└── tasks.md             # Phase 2(/speckit-tasks で作る)
```

### Source Code (repository root)

```text
src/
├── app/other/photograph/
│   ├── page.tsx                  # 改修: PhotographPage。Template + 見出し + <AlbumList albums={albums} />。"use client" を外す
│   ├── AlbumList.tsx             # 新規: 並べ替え、カード、0件の表示
│   ├── AlbumList.test.tsx        # 新規: contracts/photograph-pages.md の1章
│   ├── PhotoGallery.tsx          # 新規("use client"): 表示幅の測定、行の組み方、20件ずつの表示、プレースホルダ、失敗表示
│   ├── PhotoGallery.test.tsx     # 新規: contracts/photograph-pages.md の2章
│   └── [album]/
│       └── page.tsx              # 新規: PhotographAlbumPage。generateStaticParams / dynamicParams = false / generateMetadata
├── constants/
│   └── photograph.ts             # 新規: PHOTO_BASE_URL と画像の幅(640 / 1280)
├── data/photograph/
│   ├── album-types.ts            # 新規: 型 Album / Photo(手で書く)
│   ├── albums/
│   │   ├── index.ts              # 生成: 全アルバムの import(photo:sync が書く)
│   │   ├── <slug>.json           # 生成: アルバムデータ
│   │   └── <slug>.txt            # 手で書く(git 管理外)
│   └── dropbox-link.ts           # 削除: 移行後
└── utils/
    ├── photograph-utils.ts       # 新規: justifyRows、sortAlbums、photoUrl / photoSrcSet
    ├── photograph-utils.test.ts  # 新規
    ├── photo-list-utils.ts       # 新規: parsePhotoList、似た写真の比較とグループ分け(スクリプトから .ts 付きで import する)
    └── photo-list-utils.test.ts  # 新規

scripts/
└── photo-sync.ts                 # 新規: ファイルの読み書き、sharp、R2 へのアップロード、生成、Biome の整形

workers/photo/
├── index.ts                      # 新規: GET / HEAD で R2 から返す(contracts/photo-worker.md)
└── wrangler.jsonc                # 新規: Worker 名、R2 バインディング PHOTOS

package.json                      # 改修: photo:sync のスクリプト、devDependencies に sharp / aws4fetch
.gitignore                        # 改修: src/data/photograph/albums/*.txt
CLAUDE.md                         # 改修: コマンド一覧に photo:sync、技術スタックに R2 / Worker、photograph の説明
```

**Structure Decision**: 既存の単一 Next.js プロジェクトのまま、`/other/photograph` の下に詳細画面を足す。
ページ専用の部品は動画一覧(`MovieList.tsx`)と同じくページのディレクトリに置く。Worker は Next.js と
別にデプロイするものなので、`src/` の外の `workers/photo/` に分ける。スクリプトと Worker は
`tsconfig.json` の対象(`**/*.ts`)に入ったまま型チェックを通す。

## Complexity Tracking

Constitution Check に違反は無いため、記載なし。
