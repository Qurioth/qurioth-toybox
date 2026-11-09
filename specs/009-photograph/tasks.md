---

description: "写真一覧(アルバム単位)の作業一覧"
---

# Tasks: 写真一覧(アルバム単位)

**Input**: Design documents from `/specs/009-photograph/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/](./contracts/) / [quickstart.md](./quickstart.md) /
[ADR-0017](../../docs/adr/0017-store-photos-in-r2.md)

**Tests**: 含める(テスティングトロフィー、ADR-0008)。

- 列の割り当て・アルバムの並び順・リストの読み方・似た写真のグループ分けは、純粋関数のユニットテストで
  確かめる。
- 画面は `AlbumList` / `PhotoGallery` にテスト内で作ったデータを渡す結合テストで確かめる。
- スクリプトの入出力と Worker は、quickstart.md の手順で手で確かめる(contracts/photo-worker.md)。

**Organization**:

- US1(アルバムを選ぶ)と US2(アルバムの写真を眺める)が P1。US1 を MVP の入口とし、US2 で写真が
  見られるようになる。
- US3(待たされない)は US2 の `PhotoGallery` に続きの読み込みを足す。
- 取り込みと配信(Phase 6)は画面と別のファイルで、画面の作業と並行して進められる。実際の写真を
  出すには、画面と Phase 6 の両方が要る。
- **(オーナー)** の付いた作業は、Cloudflare の管理画面やログインが要るため、オーナーが行う。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US1〜US3)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ + 手元で動かすスクリプト + Worker。

- 画面: `src/app/other/photograph/`(ページ専用の部品も同じディレクトリに置く)
- テスト: 対象と同じディレクトリに `*.test.ts(x)` として置く。`describe` / `it` / `expect` は
  `vitest` から明示 import する。
- スクリプトから import する `src/utils/` のファイルは、相対 import を `.ts` 付きで書き、型は
  `import type` にする。`@/` のエイリアスは使わない(`scripts/create-scenario-draft.ts` と同じ)。
- `tsconfig.json` の `target` は ES2017 のため、BigInt のリテラル(`0n`)は使わない。
- 整形は Biome に任せる(2スペース / ダブルクォート / LF)。

---

## Phase 1: Setup

**Purpose**: 着手前の確認と、依存・除外設定の追加

- [X] T001 `pnpm test` と `pnpm typecheck` を実行し、着手前にすべて通ることを確かめる(失敗があれば
  本件と無関係かを切り分けてから進める)
- [X] T002 `package.json` の devDependencies に `sharp` と `aws4fetch` を追加する(`pnpm add -D sharp
  aws4fetch`)。`sharp` の版は `next` が入れている版(`node_modules/.pnpm` の `sharp@0.35.x`)に合わせる。
  `scripts` に `"photo:sync": "node --env-file-if-exists=.env.local --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/photo-sync.ts"`
  を追加する(research R4・R6、contracts/photo-sync-cli.md)
- [X] T003 [P] `.gitignore` に `src/data/photograph/albums/*.txt` を追加し、コメントで理由(元の写真の
  フォルダ名を公開しないため。ADR-0017)を書く

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: どの画面も使う型・定数・空のアルバム一覧・画像の URL の組み立て

**⚠️ CRITICAL**: US1〜US3 はこのフェーズの完了後に着手する

- [X] T004 [P] `src/data/photograph/album-types.ts` を新規作成する。data-model.md 2章の
  `Photo`(`key: string` / `width: number` / `height: number`)と `Album`(`title: string` /
  `date: string` / `photos: Photo[]`)を export し、各フィールドの意味と書式を JSDoc で書く
- [X] T005 [P] `src/constants/photograph.ts` を新規作成する。`PHOTO_BASE_URL`(Worker の URL。T036 で
  オーナーが本物に差し替えるまでは `"https://photos.example.workers.dev"` とし、その旨をコメントに書く)
  と `PHOTO_WIDTHS = [640, 1280] as const` を export する
- [X] T006 `src/data/photograph/albums/index.ts` を新規作成する。先頭に「このファイルは pnpm photo:sync
  が生成する。手で編集しない。」のコメントを置き、`import type { Album } from "../album-types";` と
  `export const albums: Record<string, Album> = {};` だけを書く(data-model.md 3章。T034 が同じ形で
  生成する)
- [X] T007 [P] `src/utils/photograph-utils.test.ts` を新規作成する。`photoUrl(key, width)` が
  `${PHOTO_BASE_URL}/${key}-${width}.webp` を返すこと、`photoSrcSet(photo)` が
  (1) 幅 1280 の写真で `"<640の URL> 640w, <1280の URL> 1280w"`、(2) 幅 900 の写真で
  `"<640の URL> 640w, <1280の URL> 900w"`、(3) 幅 500 の写真で `"<640の URL> 500w, <1280の URL> 500w"`
  を返すことを確かめる(data-model.md 2章、research R3)
- [X] T008 `src/utils/photograph-utils.ts` を新規作成し、`photoUrl` と `photoSrcSet` を実装する。
  T007 が通ること

**Checkpoint**: 型・定数・空のアルバム一覧があり、画面から import できる

---

## Phase 3: User Story 1 - アルバムを選ぶ (Priority: P1) 🎯 MVP

**Goal**: `/other/photograph` にアルバムのカードが撮影日の新しい順に並び、選ぶとアルバムの画面へ移る。
0件ならその旨を示す。

**Independent Test**: `AlbumList` に撮影日の異なるアルバムを渡すと、新しい順にカードが並び、各カードに
表紙の画像・タイトル・撮影日・「n枚」があり、`/other/photograph/<slug>` へのリンクになっている。
空のオブジェクトを渡すと「まだアルバムがありません」が出る。

### Tests for User Story 1

- [X] T009 [P] [US1] `src/utils/photograph-utils.test.ts` に `sortAlbums(albums)` のテストを追加する:
  (1) `date` の新しい順に並ぶ、(2) 同じ `date` は slug の昇順、(3) 戻り値の各要素に `slug` が付く、
  (4) 入力を変更しない
- [X] T010 [P] [US1] `src/app/other/photograph/AlbumList.test.tsx` を新規作成する。テスト内で作った
  `Record<string, Album>` を `AlbumList` に渡し、contracts/photograph-pages.md 1章の1〜5を確かめる:
  (1) アルバムごとにリンクが1つあり、`href` が `/other/photograph/<slug>`、(2) リンクの中にタイトル・
  撮影日・「n枚」が出る、(3) リンクの並びが撮影日の新しい順、(4) 表紙の `img` の `src` が先頭の写真の
  `photoUrl(key, 640)` で、`width` / `height` 属性を持つ、(5) 空のとき「まだアルバムがありません」が出て
  リンクが無い

### Implementation for User Story 1

- [X] T011 [US1] `src/utils/photograph-utils.ts` に
  `sortAlbums(albums: Record<string, Album>): (Album & { slug: string })[]` を実装する。T009 が通ること
- [X] T012 [US1] `src/app/other/photograph/AlbumList.tsx` を新規作成する。`{ albums: Record<string, Album> }`
  を受け、`sortAlbums` の順に `next/link` のカードを並べる(`grid grid-cols-1 sm:grid-cols-2
  lg:grid-cols-3`)。カードには表紙(`photos[0]` の 640px 版を `<img>` で、`width` / `height` 属性付き、
  `loading="lazy"`、`object-cover` で枠の縦横比を 3:2 に揃える)、タイトル、撮影日(`YYYY-MM-DD` のまま)、
  「n枚」を置く。`<img>` には既存と同じく
  `// biome-ignore lint/performance/noImgElement: <理由>` を付ける(research R3)。見た目(枠線・角丸・
  ダークモード)は `src/app/other/movie/MovieCard.tsx` に合わせる。0件のときは
  「まだアルバムがありません」を表示する。`"use client"` は付けない。T010 が通ること
- [X] T013 [US1] `src/app/other/photograph/page.tsx` を書き換える。default export は `PhotographPage`
  のまま、`"use client"` と既存の `ImageWithSkeleton` / `splitArray` / スクロール処理を削除し、
  `Template` の中に見出し `h1`「Photograph」と説明文、`<AlbumList albums={albums} />` を置く。
  見出しと説明文の見た目は `src/app/other/movie/page.tsx` に合わせる。`dropbox-link.ts` の import は
  外す(ファイル自体は移行が済むまで残す。T041)

**Checkpoint**: `/other/photograph` がアルバムの一覧になる(アルバムが0件なら、その旨が出る)

---

## Phase 4: User Story 2 - アルバムの写真を眺める (Priority: P1)

**Goal**: `/other/photograph/<slug>` でアルバムのタイトル・撮影日と写真が並び、縦横が混ざっても列の
下端の差が最も縦長の1枚分以内に収まる。開いた直後に列数が切り替わって組み直されない。

**Independent Test**: `PhotoGallery` に縦長と横長が混ざった写真を渡すと、`assignColumns` の結果どおりの
列に並ぶ。サーバー側の描画では写真を並べず、場所だけ確保した枠を出す。

### Tests for User Story 2

- [X] T014 [P] [US2] `src/utils/photograph-utils.test.ts` に `assignColumns(photos, columnCount)` の
  テストを追加する(research R1): (1) 同じ縦横比の写真は左から順に1枚ずつ配られる、(2) 縦長が入った
  列を避けて次の写真が入る、(3) 高さが同じ列が複数あれば左の列に入る、(4) 先頭 n 枚の割り当ては、
  後ろに写真を足しても変わらない、(5) 縦長(2:3)と横長(3:2)を無作為に混ぜた100枚で、各列の
  「高さ ÷ 幅」の合計の差が 1.5 以下、(6) 0枚なら空の列が columnCount 個
- [X] T015 [P] [US2] `src/hooks/use-column-count.test.ts` を新規作成する。`window.matchMedia` を
  テスト内で差し替え、`useColumnCount()` が `(min-width: 768px)` に一致するとき 4、しないとき 2 を
  返すことを `renderHook` で確かめる。`react-dom/server` の `renderToString` で描画したときは `null` に
  なることも確かめる(research R2)
- [X] T016 [P] [US2] `src/app/other/photograph/PhotoGallery.test.tsx` を新規作成する。
  contracts/photograph-pages.md 2章の3〜6・11・12を確かめる: (1) `renderToString` の結果に写真の
  `img` が無く、枠だけがある、(2) `matchMedia` が一致するとき列が4つ、しないとき2つ、(3) 各列の
  `img` の並びが `assignColumns` の結果と一致する、(4) 各 `img` が `width` / `height` / `srcset`
  (`photoSrcSet` の値)/ `sizes` / `loading="lazy"` を持つ、(5) `img` に `error` を発火すると、その枠に
  「画像の読み込みに失敗しました」が出て、他の `img` は残る、(6) `load` の前はプレースホルダが写真と
  同じ縦横比(`aspect-ratio` のスタイル)で出ている。写真は20枚以下で用意する(続きの読み込みは US3)

### Implementation for User Story 2

- [X] T017 [US2] `src/utils/photograph-utils.ts` に
  `assignColumns(photos: Photo[], columnCount: number): Photo[][]` を実装する。先頭から順に、
  `height / width` の合計が最も小さい列(同じなら左)へ入れる。T014 が通ること
- [X] T018 [US2] `src/hooks/use-column-count.ts` を新規作成する。`"use client"`。
  `useSyncExternalStore` で、サーバー側の値を `null`、ブラウザ側の値を
  `matchMedia("(min-width: 768px)").matches ? 4 : 2` にし、`change` を購読する。JSDoc に、既存の
  `useMediaQuery` と違って「まだ分からない」を返すこと、レイアウトの決定に使ってよいことを書く。
  T015 が通ること
- [X] T019 [US2] `src/app/other/photograph/PhotoGallery.tsx` を新規作成する。`"use client"`。
  `{ photos: Photo[] }` を受け、`useColumnCount()` が `null` の間は、写真の代わりに一覧の高さを
  確保した枠(`min-h-[60vh]` 程度)を出す。値が決まったら `assignColumns` で列に分け、
  `grid grid-cols-2 md:grid-cols-4 gap-4` の中に列ごとの縦並びを描く。写真1枚は
  `aspect-ratio: width / height` の枠に、`<img>`(`src` は 640px 版、`srcset` は `photoSrcSet`、
  `sizes="(min-width: 768px) 25vw, 50vw"`、`width` / `height`、`loading="lazy"`、`decoding="async"`、
  `alt` はアルバムのタイトルと番号)を置く。`load` まではプレースホルダ(`animate-pulse` の背景)を
  重ね、`error` のときは「画像の読み込みに失敗しました」を出す。列の key は列番号、写真の key は
  `photo.key`。`<img>` には `biome-ignore`(research R3)を付ける。T016 が通ること
- [X] T020 [US2] `src/app/other/photograph/[album]/page.tsx` を新規作成する。default export は
  `PhotographAlbumPage`(サーバーコンポーネント)。`params` は `Promise<{ album: string }>` として
  `await` する。`generateStaticParams` は `Object.keys(albums)` から作り、`export const dynamicParams
  = false` を置く。`generateMetadata` でタブのタイトルをアルバムのタイトルにする。`Template` の中に、
  アルバムの一覧へ戻る `next/link`(文言「アルバム一覧へ戻る」)、`h1` のタイトル、撮影日、
  `<PhotoGallery photos={album.photos} />` を置く(contracts/photograph-pages.md 2章の1・2、3章、
  research R11)。アルバムが見つからない場合に備え `notFound()` も呼ぶ

**Checkpoint**: アルバムの画面で、縦横が混ざった写真がずれずに並ぶ(20枚まで)

---

## Phase 5: User Story 3 - 枚数が多くても待たされない (Priority: P2)

**Goal**: 21枚以上のアルバムは20枚ずつ表示し、下までスクロールすると続きが出る。表示済みの写真は動かない。

**Independent Test**: 45枚のアルバムを `PhotoGallery` に渡すと最初は20枚だけが出て、目印の交差を
起こすたびに40枚・45枚と増え、45枚で目印が消える。増える前に出ていた写真の列と順番は変わらない。

### Tests for User Story 3

- [X] T021 [US3] `src/app/other/photograph/PhotoGallery.test.tsx` にテストを追加する。テスト内で
  `globalThis.IntersectionObserver` を、渡されたコールバックを保持して任意に交差を起こせるモックに
  差し替え(テスト後に戻す)、contracts/photograph-pages.md 2章の7〜10を確かめる: (1) 45枚で最初は
  20枚、(2) 交差を起こすと40枚、もう一度で45枚、(3) 45枚で目印が無くなる、(4) 増える前の20枚の各列の
  `img` の並びが、増えた後の各列の先頭と一致する、(5) 15枚のアルバムでは最初から15枚出て目印が無い

### Implementation for User Story 3

- [X] T022 [US3] `src/app/other/photograph/PhotoGallery.tsx` に続きの読み込みを足す。表示件数の
  初期値と増分を20とし、`assignColumns` には先頭から表示件数分だけを渡す。一覧の下に目印の要素を
  置き、`IntersectionObserver`(`rootMargin: "320px 0px"`)で交差したら表示件数を増やす。すべて
  出したら目印を描かない。書き方は `src/app/trpg/replay/page.tsx` の続きの読み込みに合わせる
  (research R12)。T021 が通ること

**Checkpoint**: 100枚を超えるアルバムでも、最初は20枚だけを読み込む

---

## Phase 6: 写真の取り込みと配信(ADR-0017)

**Purpose**: 実際の写真を R2 に置き、Worker から配信し、アルバムデータを生成する。画面の作業
(Phase 3〜5)と並行して進められる

### Worker と Cloudflare の準備

- [X] T023 [P] `workers/photo/index.ts` を新規作成する。contracts/photo-worker.md のとおり、GET / HEAD
  でパスが `^/[0-9a-f]{16}-(640|1280)\.webp$` のときだけ `env.PHOTOS.get(key)` を返し、`Content-Type:
  image/webp`、`Cache-Control: public, max-age=31536000, immutable`、`ETag`(`object.httpEtag`)を付ける。
  見つからなければ 404、形が違えば R2 を読まずに 404、他のメソッドは 405(`Allow: GET, HEAD`)。
  HEAD は本文なし。`Env` の型は、使う部分(`get` と戻り値の `body` / `httpEtag`)だけをファイル内に
  書く(research R7)。冒頭に、この Worker の役割と ADR-0017 へのリンクをコメントで書く
- [X] T024 [P] `workers/photo/wrangler.jsonc` を新規作成する。`name`(例: `qurioth-photos`)、
  `main: "index.ts"`、`compatibility_date`(作成日)、`workers_dev: true`、
  `r2_buckets: [{ "binding": "PHOTOS", "bucket_name": "qurioth-photos" }]` を書く。バケット名は T026 で
  作るものと揃える旨をコメントで書く
- [X] T025 `pnpm typecheck` と `pnpm lint` を実行し、`workers/photo/index.ts` が今の `tsconfig.json` と
  Biome の設定のまま通ることを確かめる(通らなければ `tsconfig.json` の `exclude` に足すのではなく、
  ファイル内の型を直す)
- [X] T026 **(オーナー)** Cloudflare の管理画面で R2 のバケット `qurioth-photos` を作り、そのバケットの
  「オブジェクトの読み書き」だけを許可した API トークンを発行する。`.env.local` に
  `PHOTO_SOURCE_ROOT` / `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` を
  書く(data-model.md 7章、quickstart.md 0章)
- [X] T027 **(オーナー)** `pnpm dlx wrangler login` のあと
  `pnpm dlx wrangler deploy --config workers/photo/wrangler.jsonc` で Worker をデプロイし、表示された
  `*.workers.dev` の URL を控える

### 取り込みスクリプト

- [X] T028 [P] `src/utils/photo-list-utils.test.ts` を新規作成し、`parsePhotoList(text, sourceRoot)` の
  テストを書く(data-model.md 1章、research R8): (1) `# title:` / `# date:` を読む、(2) 空行と他の
  `#` 行を無視する、(3) 前後の空白と `"` を取り除く、(4) `/` 区切りを `\` に揃える、(5)
  `sourceRoot` の下の絶対パス(ドライブ文字の大小を問わない)を相対パスに直し、書き換えがあったことを
  返す、(6) `sourceRoot` の外の絶対パスを行番号つきのエラーにする、(7) タイトル・撮影日の欠落や不正な
  日付(`2025-02-30`)をエラーにする、(8) 写真の行が0のときエラーにする。あわせて `isValidSlug` の
  テスト(`2025-04-nemophila` は可、大文字・日本語・先頭末尾の `-` は不可)を書く
- [X] T029 [P] `src/utils/photo-list-utils.test.ts` に似た写真のテストを追加する(research R9):
  (実装時に dHash から相関に変えた。research R9。以下は当初の記述) (1) `dHashFromPixels(pixels)`(9×8 の明るさの配列 → 16文字の16進数)が、右に向かって明るくなる
  画像と暗くなる画像で `"0000000000000000"` と `"ffffffffffffffff"` を返す、(2) `hammingDistance` が
  16進数どうしの異なるビット数を返す、(3) `groupSimilar(hashes, threshold)` が閾値以下の組をまとめ、
  A〜B・B〜C が近ければ A・B・C を1グループにし、1枚だけのグループは返さない
- [X] T030 `src/utils/photo-list-utils.ts` を新規作成し、`parsePhotoList`・`isValidSlug`・
  `dHashFromPixels`・`hammingDistance`・`groupSimilar` を実装する。Node の API と `sharp` は使わない
  (純粋関数)。BigInt は使わず、16進数の文字列で扱う。冒頭に、スクリプトから `.ts` 付きで import される
  ため `@/` を使わないことをコメントで書く。T028・T029 が通ること
- [X] T031 `scripts/photo-sync.ts` を新規作成し、引数と事前の確認を実装する(contracts/photo-sync-cli.md
  の「呼び出し方」「処理の順番」1〜4「表示する内容」「エラーにするもの」): `<slug>` / `--all` /
  `--dry-run` / `--prune` を読む。環境変数を確かめる(`--dry-run` は `PHOTO_SOURCE_ROOT` だけ)。
  リストを `parsePhotoList` で読み、ファイルの有無と拡張子を確かめ、NEF は同じフォルダの同じ名前の
  JPG(`.JPG` / `.jpg`)に読み替える。`node:crypto` の SHA-256 の先頭16文字をキーにし、同じキーの
  2回目を無視して知らせる。`sharp` で 9×8 の白黒(`.rotate().resize(9, 8, { fit: "fill" }).greyscale().raw()`)
  を作って dHash を求め、`groupSimilar`(閾値 10)で似た写真を表示する。既存の json と比べて新規・既存・
  外した写真の枚数を出す。エラーがあれば終了コード 1 で止める。冒頭のコメントは
  `scripts/create-scenario-draft.ts` に倣い、使い方と ADR-0017 へのリンクを書く
- [X] T032 `scripts/photo-sync.ts` に圧縮を実装する(research R4): 写真ごとに
  `sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 })` を幅 640 と
  1280 で作る(メモリ上のみ。`withMetadata` / `keepMetadata` は呼ばない)。1280 版の実際の幅・高さを
  記録する。`--dry-run` では圧縮だけ行い、合計サイズの見込みを表示して終了する
- [X] T033 `scripts/photo-sync.ts` に R2 へのアップロードを実装する(research R6): `aws4fetch` の
  `AwsClient`(`service: "s3"`、`region: "auto"`)で、アルバムデータにまだないキーの2つの WebP を
  `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com/<R2_BUCKET>/<key>-<幅>.webp` に PUT する
  (`Content-Type: image/webp`)。失敗したらその場で止め、json は書き出さない。その前に、リストの
  絶対パスの行を相対パスに書き換えて、書き換えた行数を表示する
- [X] T034 `scripts/photo-sync.ts` に生成を実装する(research R10、data-model.md 2・3章):
  `src/data/photograph/albums/<slug>.json`(`title` / `date` / `photos`)を書き、
  `src/data/photograph/albums/` の全 json から `index.ts`(slug の昇順、T006 と同じ見出しのコメントと
  `import type { Album }`)を作り直す。書いたファイルに `pnpm exec biome format --write` をかける
- [X] T035 `scripts/photo-sync.ts` に `--prune` を実装する(data-model.md 6章): R2 の
  `?list-type=2` で全キーを取得し(続きがあれば `continuation-token` で繰り返す)、全アルバムの json に
  無いキーの WebP を DELETE する。消した件数を表示する
- [X] T036 **(オーナー)** T005 の `PHOTO_BASE_URL` を T027 で控えた Worker の URL に差し替える
- [X] T037 quickstart.md 2章「最初の1枚で確かめる」を行う: 1枚だけの `test.txt` で `pnpm photo:sync test`
  が通る(`aws4fetch` の PUT。通らなければ T033 を `@aws-sdk/client-s3` に替え、research R6 を更新する)、
  `curl -I` で Worker が 200 と3つのヘッダーを返し、形の違うパスで 404、`POST` で 405 を返す、
  ダウンロードした画像に撮影情報が無い、元の写真と色が大きく変わらない。終わったら `test.txt` を消し、
  `pnpm photo:sync --all --prune` で R2 と json から消えることを確かめる
- [X] T038 quickstart.md 3章を行う: 連写を含むアルバムで `--dry-run` し、似た写真のグループが妥当か
  確かめて閾値を決める(変えたら research R9 の初期値を更新する)。640px 版の1枚あたりの見込みが
  約190KB より小さいこと(SC-006)。エラーの例を1行ずつ足して、contracts/photo-sync-cli.md の表示が
  出ること

**Checkpoint**: リストを書いて `pnpm photo:sync` すると、写真が R2 に上がり、アルバムデータが生成される

---

## Phase 7: 既存の写真の移行

**Purpose**: Dropbox の72枚をアルバムに移し、Dropbox の参照をなくす

- [X] T039 `src/data/photograph/dropbox-link.ts` の72枚について、`F:\Pictures` から元の写真を探す
  (ファイル名と、Dropbox の画像の撮影日時の Exif を手がかりにする)。探すための一時的なスクリプトは
  作業用の一時フォルダに置き、リポジトリに入れない。見つかった写真の一覧をオーナーに示す
- [ ] T040 **(オーナー)** T039 の一覧をもとにアルバムの分け方を決め、
  `src/data/photograph/albums/<slug>.txt` を書いて `pnpm photo:sync --all` を実行する
- [ ] T041 72枚がアルバムの画面にそろっていることを確かめたら、`src/data/photograph/dropbox-link.ts` を
  削除する。`grep` で `dropbox` の参照が残っていないことを確かめる

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: CI と同じ検査、画面での確認、文書の更新

- [X] T042 `pnpm lint`、`pnpm format:check`、`pnpm typecheck`、`pnpm test`、`pnpm build` をすべて通す
  (整形の差分は `pnpm format` で直す)
- [X] T043 quickstart.md 4章「画面での確認」の手順 1〜6 を開発サーバーとビルド後のサーバーで行う
  (幅 375px での表示、開いた直後に組み直されないこと、ネットワークで 640px 版が読まれること、
  存在しないアルバムの 404 を含む)
- [X] T044 [P] `CLAUDE.md` を更新する: 開発コマンドに `pnpm photo:sync`、技術スタックに Cloudflare R2 /
  Workers と `sharp` / `aws4fetch`(ADR-0017)、ディレクトリ構成に `workers/photo/` と
  `src/data/photograph/albums/`(txt は git 管理外)、`src/app/other` の説明にアルバム単位の写真一覧
- [X] T045 [P] T037・T038 の確認が済んだら、`docs/adr/0017-store-photos-in-r2.md` のステータスを
  Accepted にし、「未確認の点」を確かめた結果に書き換える。`docs/adr/README.md` の一覧の
  ステータスも Accepted にする
- [X] T046 [P] `specs/009-photograph/checklists/requirements.md` の Notes に、実装で spec の数値
  (20件・2/4列・画像の幅)を変えたかどうかを1行で書く(変えていれば spec を先に更新する)

---

## Phase 9: 並べ方の変更(行の高さを揃える)

**Purpose**: 横長の写真が小さく見える問題に対し、列の幅を揃える並べ方から、行の高さを揃える並べ方に
変える(2026-11-08 のオーナーの要望。spec FR-004・FR-005・FR-007・FR-009、research R1・R2)

- [X] T047 [US2] `src/utils/photograph-utils.test.ts` の `assignColumns` のテストを、`justifyRows(photos, width, targetHeight, gap)`
  のテストに置き換える: (1) 目安の高さで並べた幅が表示幅に達したところで行を区切る、(2) 区切った行は
  写真の幅と隙間の合計が表示幅にちょうど等しい、(3) 最後の行は目安の高さのまま、(4) 1枚だけで
  表示幅を超える写真はその1枚の行になり、表示幅に収まる、(5) 先頭 n 枚の行のうち最後の行より前は、
  後ろに写真を足しても変わらない、(6) 0枚なら空の配列。あわせて `rowTargetHeight(width)` が
  420 と表示幅の半分の小さいほうを返すことを確かめる
- [X] T048 [US2] `src/utils/photograph-utils.ts` の `assignColumns` を削除し、`justifyRows` と
  `rowTargetHeight` を実装する。T047 が通ること
- [X] T049 [US2] `src/app/other/photograph/PhotoGallery.tsx` を行の並べ方に作り替える。写真を並べる
  領域の幅を `useLayoutEffect`(最初の `clientWidth`)と `ResizeObserver` で測り、幅が分かるまでは
  場所だけ確保した枠を出す。幅が分かったら、表示中の写真を `justifyRows` で行に分け、写真ごとに
  計算した幅と高さで並べる(`sizes` は写真の表示幅)。続きの読み込み・プレースホルダ・失敗表示は
  今のまま
- [X] T050 [US2] `src/app/other/photograph/PhotoGallery.test.tsx` を行の並べ方に合わせて書き直す
  (contracts/photograph-pages.md 2章の3〜12)。表示幅は `HTMLElement.prototype.clientWidth` を
  テスト内で差し替えて与える
- [X] T051 [P] `src/hooks/use-column-count.ts` と `src/hooks/use-column-count.test.ts` を削除する
  (列で並べなくなり不要。research R2)
- [X] T052 比較用の一時ページ `src/app/zz-layout-preview/` を削除する
- [X] T053 `pnpm lint`、`pnpm format:check`、`pnpm typecheck`、`pnpm test`、`pnpm build` を通し、
  quickstart.md 4章の 2〜5 をブラウザで確かめる

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup(Phase 1)**: 依存なし
- **Foundational(Phase 2)**: Setup の後。US1〜US3 の前提
- **US1(Phase 3)**: Foundational の後
- **US2(Phase 4)**: Foundational の後。US1 とは別ファイルだが、`photograph-utils` の実装とテストに
  書き足すため、T011 → T017 の順にする
- **US3(Phase 5)**: US2 の後(`PhotoGallery` に書き足すため)
- **取り込みと配信(Phase 6)**: Setup の後ならいつでも(T023〜T035 は画面と別ファイル)。T036〜T038 は
  オーナーの準備(T026・T027)の後
- **移行(Phase 7)**: Phase 3〜6 の後
- **Polish(Phase 8)**: すべての後

### Within Each Story

- テストを先に書き、失敗することを確かめてから実装する。
- US2 は T017(割り当て)→ T018(列数)→ T019(部品)→ T020(ページ)の順。
- Phase 6 のスクリプトは T031 → T032 → T033 → T034 → T035 の順(同じファイルに書き足す)。

### Parallel Opportunities

- T003 と T002(別ファイル)
- T004・T005・T007(別ファイル)
- US1 のテスト T009・T010、US2 のテスト T014・T015・T016
- Phase 6 の T023・T024・T028・T029 は、画面の作業(Phase 3〜5)と並行して進められる
- T044・T045・T046(別ファイル)

### Parallel Example: Phase 6 と画面

```text
# 画面の作業と並行して、Worker とリストの読み方を進める
T023 workers/photo/index.ts
T024 workers/photo/wrangler.jsonc
T028 src/utils/photo-list-utils.test.ts
```

---

## Implementation Strategy

### MVP First

1. Phase 1・2 を終える。
2. Phase 3(US1)と Phase 4(US2)を終え、テスト用のアルバムデータを一時的に置いて、一覧から
   アルバムを開き、写真がずれずに並ぶことを確かめる(写真の URL は R2 の準備ができるまで表示されない
   ので、確認は枠と並びで行う)。
3. Phase 6 で実際の写真を1アルバム上げ、画面に出ることを確かめる。

### Incremental Delivery

1. US1 + US2 → アルバム単位の写真一覧(並びのずれを解消)
2. US3 → 20枚ずつの読み込み(100枚を超えるアルバムを入れる前に必ず入れる)
3. Phase 6 → 取り込みと配信
4. Phase 7 → 既存の72枚を移し、Dropbox の参照をなくす(移行が済むまで公開しない。済むまでは
   `/other/photograph` に写真が無くなるため、Phase 3 以降は master に入れずにブランチで進める)
5. Polish → CI・画面の確認・文書
