# 写真の公開手順

`/other/photograph` の写真は Cloudflare R2 に置き、Worker から配信している
([ADR-0017](../../../docs/adr/0017-store-photos-in-r2.md))。写真を公開するときは、手元の PC で
リストを書いて `pnpm photo:sync` を実行する。

## ファイルの置き場所

```
src/data/photograph/
  README.md            # この手順書
  album-template.txt   # リストの雛形
  album-types.ts       # アルバムデータの型
  albums/
    <slug>.txt         # 自分で書くリスト(git 管理外。元の写真のフォルダ名を公開しないため)
    <slug>.json        # pnpm photo:sync が生成する(コミットする)
    index.ts           # pnpm photo:sync が生成する(コミットする。手で編集しない)
```

## 初回だけ

- `.env.local` に `PHOTO_SOURCE_ROOT`・`R2_ACCOUNT_ID`・`R2_ACCESS_KEY_ID`・`R2_SECRET_ACCESS_KEY`・
  `R2_BUCKET` を書く。
- Worker をデプロイし、表示された URL を `src/constants/photograph.ts` の `PHOTO_BASE_URL` に書く
  (`pnpm dlx wrangler deploy --config workers/photo/wrangler.jsonc`)。

## アルバムを作る・写真を足す

1. **リストを作る**: `album-template.txt` を `albums/<slug>.txt` にコピーする。`<slug>` はアルバムの
   URL になる名前で、英小文字・数字・`-` だけ(例: `2025-04-nemophila`)。
2. **アルバムの情報を書く**: `# title:` にタイトル、`# date:` に撮影日(`YYYY-MM-DD`)を書く。
3. **写真を書く**: エクスプローラーで写真を選び、右クリック →「パスとしてコピー」で貼り付ける。
   1行に1枚。書いた順に並び、先頭の写真が表紙になる。
4. **確かめる**: 何もアップロードせずに、枚数・圧縮後の大きさ・似ている写真・書き間違いを表示する。

   ```bash
   pnpm photo:sync <slug> --dry-run
   ```

5. **公開する**: 圧縮して R2 に上げ、`albums/<slug>.json` と `albums/index.ts` を書き出す。
   貼り付けた絶対パスは、このとき相対パスに直る。

   ```bash
   pnpm photo:sync <slug>
   ```

6. **コミットする**: 生成された `albums/<slug>.json` と `albums/index.ts` をコミットする
   (txt は git 管理外なので出てこない)。

写真を足すときは、同じリストに行を足して 4〜6 をやり直す。上げ済みの写真は上げ直さない。

## 写真を外す・アルバムを消す

- **写真を外す**: リストから行を消して `pnpm photo:sync <slug>` を実行する。サイトからは消えるが、
  R2 には画像が残る。R2 からも消すには `--prune` を付ける(どのアルバムからも使われていない画像だけを
  消す)。
- **アルバムを消す**: `albums/<slug>.txt` と `albums/<slug>.json` を消してから、残っている
  どれかのアルバムで `pnpm photo:sync <slug> --prune`(または `pnpm photo:sync --all --prune`)を
  実行する。`index.ts` が作り直され、画像も R2 から消える。

## うまくいかないとき

- `.env.local に ... を書いてください`: その項目が空。
- `n行目: ファイルが見つかりません`: パスの打ち間違いか、元の写真のフォルダ名が変わった。
- `n行目: NX Studio で JPG に書き出してください`: NEF しかない。NX Studio で同じフォルダに JPG を
  書き出す。
- `pnpm` が「No version is set for shim」で動かない: `corepack pnpm photo:sync ...` で実行する。

詳しい仕様は [specs/009-photograph/contracts/photo-sync-cli.md](../../../specs/009-photograph/contracts/photo-sync-cli.md)。
