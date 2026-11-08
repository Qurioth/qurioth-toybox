# Contract: 写真を配信する Worker

**Feature**: [../spec.md](../spec.md) | **ADR**: [ADR-0017](../../../docs/adr/0017-store-photos-in-r2.md)

`workers/photo/` に置き、`https://<Worker 名>.<アカウントのサブドメイン>.workers.dev` で公開する。
R2 のバケットをバインディング `PHOTOS` で読む。

## リクエスト

| メソッド | パス | 結果 |
| -- | -- | -- |
| GET / HEAD | `/<16文字の16進数>-640.webp` または `-1280.webp` | R2 にあれば 200、なければ 404 |
| GET / HEAD | 上記以外のパス | 404(R2 を読まない) |
| 上記以外のメソッド | すべて | 405(`Allow: GET, HEAD`) |

パスの形: `^/[0-9a-f]{16}-(640|1280)\.webp$`

## 200 のレスポンス

| ヘッダー | 値 |
| -- | -- |
| `Content-Type` | `image/webp` |
| `Cache-Control` | `public, max-age=31536000, immutable` |
| `ETag` | R2 のオブジェクトの ETag |

- HEAD は本文なしで同じヘッダーを返す。
- 404 / 405 には `Cache-Control` を付けない。

## 持たない機能

- 一覧の取得、アップロード、削除。
- 画像の変換(大きさは取り込み時に決まっている)。
- CORS のヘッダー(`<img>` で読むだけなので要らない)。

## 確かめ方

テストは書かない(20行ほどで分岐が少なく、Workers の実行環境をテストに持ち込むほどではない)。
デプロイ後に `curl -I` で次を確かめる([quickstart.md](../quickstart.md))。

- 上げた画像のパスで 200 と上の3つのヘッダーが返る。
- 形の違うパス(`/index.html` など)で 404 が返る。
- `POST` で 405 が返る。
