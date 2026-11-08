/**
 * 写真を配信する Worker(workers/photo/)の URL。末尾に `/` は付けない。
 * 独自ドメインを付けたら、ここを差し替えるだけで移行できる(ADR-0017)。
 */
export const PHOTO_BASE_URL = "https://qurioth-photos.qurioth.workers.dev";

/** 写真1枚につき用意する画像の幅(px)。`pnpm photo:sync` と画面の両方が使う */
export const PHOTO_WIDTHS = [640, 1280] as const;

/** アルバムの画面の行の高さの目安(px)。比較用の画面で見比べて決めた(specs/009-photograph/research.md R1) */
export const PHOTO_ROW_HEIGHT = 420;
