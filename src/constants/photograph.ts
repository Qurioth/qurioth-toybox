/**
 * 写真を配信する Worker(workers/photo/)の URL。末尾に `/` は付けない。
 * 独自ドメインを付けたら、ここを差し替えるだけで移行できる(ADR-0017)。
 */
export const PHOTO_BASE_URL = "https://qurioth-photos.qurioth.workers.dev";

/** 写真1枚につき用意する画像の幅(px)。`pnpm photo:sync` と画面の両方が使う */
export const PHOTO_WIDTHS = [640, 1280] as const;

/** アルバムの画面の行の高さの目安(px)。比較用の画面で見比べて決めた(specs/009-photograph/research.md R1) */
export const PHOTO_ROW_HEIGHT = 420;

/**
 * `/other` の Photograph のカードに表紙を使うアルバムの slug(src/data/photograph/albums/<slug>.json)。
 * 無い slug を書いたときは、撮影日の最も新しいアルバムの表紙を使う(specs/008-other/spec.md FR-005)。
 */
export const OTHER_COVER_ALBUM = "2026-10-25-penguin-aquarium";
