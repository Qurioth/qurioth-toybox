# Data Model: 写真一覧(アルバム単位)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-08

## 1. リスト(手で書く。git 管理外)

`src/data/photograph/albums/<slug>.txt`

```
# title: ネモフィラ
# date: 2025-04-05
2025年\2025-04-05 ネモフィラ\DSC_0001.JPG
2025年\2025-04-05 ネモフィラ\DSC_0008.JPG
```

| 要素 | 内容 | 検証ルール |
| -- | -- | -- |
| ファイル名 `<slug>` | アルバムの URL に使う識別子 | 英小文字・数字・`-` だけ。先頭と末尾は `-` 以外 |
| `# title:` | アルバムのタイトル | 必須。空でない |
| `# date:` | 撮影日 | 必須。`YYYY-MM-DD` で、実在する日付 |
| パスの行 | 公開する写真1枚 | `PHOTO_SOURCE_ROOT` からの相対パス(絶対パスは相対に直す。research R8)。ファイルが存在する。拡張子は `.jpg` / `.jpeg`(大文字小文字は問わない)。`.nef` は同じ名前の JPG に読み替え、なければエラー |

- 行の順番が、アルバム内の写真の並び順になる。先頭の写真が表紙になる(spec FR-003)。
- 同じ写真(中身が同じ)が2回書かれていたら、2回目を無視して知らせる。
- 写真が1枚もないリストはエラーにする。

## 2. アルバムデータ(スクリプトが生成する。コミットする)

`src/data/photograph/albums/<slug>.json`

```json
{
  "title": "ネモフィラ",
  "date": "2025-04-05",
  "photos": [
    { "key": "3f9a0c2d7b1e4a56", "width": 1280, "height": 853 },
    { "key": "a01b2c3d4e5f6789", "width": 1280, "height": 1920 }
  ]
}
```

### Album

| フィールド | 型 | 内容 |
| -- | -- | -- |
| `title` | string | リストの `# title:` |
| `date` | string | リストの `# date:`(`YYYY-MM-DD`) |
| `photos` | Photo[] | リストの行の順。1枚以上 |

アルバムの `slug` はファイル名から取り、json の中には持たない(二重に持って食い違わないため)。

### Photo

| フィールド | 型 | 内容 |
| -- | -- | -- |
| `key` | string | 元の写真ファイルの SHA-256 の先頭16文字(16進数、小文字)。research R5 |
| `width` | number | 幅 1280px 版の実際の幅。元の幅が 1280px 未満なら元の幅 |
| `height` | number | 同じく実際の高さ |

- 元の写真のパス・ファイル名・撮影情報は持たない(ADR-0017)。
- 幅 640px 版の幅は `min(640, width)`、高さは縦横比から求める。保存しない。

## 3. アルバムの一覧(スクリプトが生成する。コミットする)

`src/data/photograph/albums/index.ts`

```ts
// このファイルは pnpm photo:sync が生成する。手で編集しない。
import album0 from "./2025-04-nemophila.json";
import album1 from "./2026-01-fukuoka.json";

export const albums: Record<string, Album> = {
  "2025-04-nemophila": album0,
  "2026-01-fukuoka": album1,
};
```

- 型 `Album` / `Photo` は手で書く `src/data/photograph/album-types.ts` に置き、生成ファイルはそれを
  import する。
- キーの順番は slug の昇順(生成の結果を毎回同じにするため)。

## 4. 画面での並べ方(導出する値。保存しない)

| 値 | 求め方 | 根拠 |
| -- | -- | -- |
| アルバムの並び順 | `date` の降順。同じ日は `slug` の昇順 | spec FR-002 |
| 表紙 | `photos[0]` | spec FR-003 |
| 枚数 | `photos.length` | spec FR-001 |
| 行の組み方 | 表示中の写真を先頭から順に、目安の高さ(420px と表示幅の半分の小さいほう)で並べた幅が表示幅に達したら行を区切り、その行が表示幅に収まる高さに揃える。最後の行は目安の高さ | spec FR-005・FR-007、research R1 |
| 画像の URL | `${PHOTO_BASE_URL}/${key}-640.webp`、`${PHOTO_BASE_URL}/${key}-1280.webp` | research R3・R5 |

## 5. R2 のオブジェクト

| キー | 中身 |
| -- | -- |
| `<key>-640.webp` | 幅 640px(元が小さければ元の幅)の WebP。撮影情報なし |
| `<key>-1280.webp` | 幅 1280px(同上)の WebP。撮影情報なし |

- アップロード時に `Content-Type: image/webp` を付ける。
- どのアルバムデータからも参照されていないキーが、`--prune` で消す対象になる。

## 6. 状態の移り変わり(写真1枚)

```
リストに書く ──photo:sync──▶ 公開中(R2 にあり、json にあり)
     ▲                              │
     │                              │ リストから消して photo:sync
     │                              ▼
     └──── リストに戻す ──── 非公開・R2 に残る(json になし)
                                    │
                                    │ photo:sync --prune
                                    ▼
                               削除済み(R2 になし)
```

- 写真をリストから外したことは、外した回の実行で、前の json と比べて知らせる。以後の実行では
  覚えていない。
- 「非公開・R2 に残る」写真をリストに戻すと、アップロードし直して公開に戻る(中身が同じなので
  キーも同じで、上書きになるだけ)。
- `--prune` のときだけ R2 にあるキーの一覧を取得し、どのアルバムデータからも参照されていないものを
  消す(research R6 の例外)。

## 7. 環境変数(`.env.local`。git 管理外)

| 名前 | 内容 |
| -- | -- |
| `PHOTO_SOURCE_ROOT` | 元の写真の置き場所(例: `F:\Pictures`) |
| `R2_ACCOUNT_ID` | Cloudflare のアカウント ID |
| `R2_ACCESS_KEY_ID` | R2 の API トークンのアクセスキー |
| `R2_SECRET_ACCESS_KEY` | 同じくシークレット |
| `R2_BUCKET` | バケット名 |

`--dry-run` は R2 に触らないので、`PHOTO_SOURCE_ROOT` だけあれば動く。
