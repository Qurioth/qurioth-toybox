# Quickstart: 写真一覧(アルバム単位)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

実装が仕様どおりに動くことを確かめる手順。詳しい振る舞いは [contracts/](contracts/) を参照。

## 0. 前提(初回だけ。オーナーが行う)

1. Cloudflare のアカウントで R2 のバケットを作る(例: `qurioth-photos`)。
2. R2 の API トークンを、そのバケットへの「オブジェクトの読み書き」だけを許可して発行する。
3. `.env.local` に書く(data-model.md 7章)。

   ```
   PHOTO_SOURCE_ROOT=F:\Pictures
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=qurioth-photos
   ```

4. Worker をデプロイする。`workers/photo/wrangler.jsonc` のバケット名を合わせてから実行する。

   ```bash
   pnpm dlx wrangler login
   ```

   ```bash
   pnpm dlx wrangler deploy --config workers/photo/wrangler.jsonc
   ```

5. 表示された `https://....workers.dev` の URL を `src/constants/photograph.ts` の
   `PHOTO_BASE_URL` に書く。

## 1. 自動テスト

```bash
pnpm test
```

- ユニットテスト: 行の組み方、アルバムの並び順、リストの読み方、似た写真のグループ分け。
- 結合テスト: アルバムの一覧とアルバムの画面(contracts/photograph-pages.md の1・2章)。

あわせて `pnpm lint` / `pnpm format:check` / `pnpm typecheck` / `pnpm build` が通ること。

## 2. 最初の1枚で確かめる(未確認の点)

ADR-0017 と research で「最初に確かめる」とした点を、1枚だけのアルバムで確かめる。

1. `src/data/photograph/albums/test.txt` に1枚だけ書いて、`pnpm photo:sync test` を実行する。
   → アップロードが通ること(research R6: `aws4fetch` の直接の PUT)。
2. 生成された json のキーで、Worker を確かめる(contracts/photo-worker.md)。

   ```bash
   curl -I https://<Worker の URL>/<キー>-640.webp
   ```

   → 200、`Content-Type: image/webp`、`Cache-Control: public, max-age=31536000, immutable`
   (research R7: `*.workers.dev` から R2 を読めること)。
3. ダウンロードした画像に撮影情報が残っていないことを確かめる(SC-007)。
4. 元の写真と色を見比べる(research R4 のリスク)。
5. 確かめ終えたら `test.txt` を消し、`pnpm photo:sync --all --prune` で R2 からも消す。

## 3. 似た写真と圧縮の確認

連写を含むアルバムのリストを書いて、`--dry-run` で確かめる。

```bash
pnpm photo:sync 2025-04-nemophila --dry-run
```

- 連写がグループになり、別の写真が混ざりすぎないこと。合わなければ`SIMILAR_WINDOW_SECONDS` / `SIMILAR_CORRELATION`(`src/utils/photo-list-utils.ts`)を調整する(research R9)。
- 「圧縮後の見込み」が1枚あたり、640px 版で約190KB(移行前の画像)より小さいこと(SC-006)。
- エラーの例(存在しないパス、NEF だけの行、`F:\` の外のパス)を1行ずつ足して、
  contracts/photo-sync-cli.md の表示が出ること。

## 4. 画面での確認

```bash
pnpm dev
```

1. `http://localhost:3000/other/photograph` にアルバムのカードが撮影日の新しい順に並ぶ。
2. 縦長と横長が混ざったアルバムを開き、最後の行を除く各行の右端が揃う(SC-005)。表示幅 945px で、
   横長だけの行の1枚が約 225×150px の2倍以上の面積になる(SC-008)。
3. 幅 375px(ブラウザの端末表示)で開き直し、1行に2枚前後で並ぶ。開いた直後に写真が並んでから組み
   直されることがない。横スクロールが出ない(SC-003)。
4. 21枚以上のアルバムで下までスクロールすると続きが出て、それまでの最後の行より前が動かない(FR-009)。
5. 開発者ツールのネットワークで、幅 375px では 640px 版が読まれている(FR-013)。
6. `http://localhost:3000/other/photograph/not-exist` が 404 になる(FR-015。`pnpm build` と
   `pnpm start` で確かめる)。

## 5. 既存の72枚の移行

1. `dropbox-link.ts` のファイル名と撮影日時を手がかりに、`F:\Pictures` から元の写真を探す。
2. アルバムに振り分けてリストを書き、`pnpm photo:sync --all` を実行する。
3. 画面で72枚がそろっていることを確かめてから、`src/data/photograph/dropbox-link.ts` を消す。

## 6. 写真を足すとき(日常の手順)

1. エクスプローラーで写真を選び、右クリック →「パスとしてコピー」。
2. `src/data/photograph/albums/<slug>.txt` に貼る(新しいアルバムなら `# title:` と `# date:` も書く)。
3. `pnpm photo:sync <slug> --dry-run` で確かめ、`pnpm photo:sync <slug>` で反映する。
4. 生成された `<slug>.json` と `index.ts` をコミットする。
