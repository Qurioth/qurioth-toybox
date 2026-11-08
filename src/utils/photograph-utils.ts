import {
  PHOTO_BASE_URL,
  PHOTO_ROW_HEIGHT,
  PHOTO_WIDTHS,
} from "@/constants/photograph";
import type { Album, Photo } from "@/data/photograph/album-types";

/** 写真の、指定した幅の画像の URL */
export const photoUrl = (key: string, width: number): string =>
  `${PHOTO_BASE_URL}/${key}-${width}.webp`;

/**
 * `<img srcset>` に渡す値。元が小さい写真は拡大せずに作っているため、
 * `w` には実際の幅(`width` と各幅の小さいほう)を書く。
 */
export const photoSrcSet = ({ key, width }: Photo): string =>
  PHOTO_WIDTHS.map(
    (size) => `${photoUrl(key, size)} ${Math.min(size, width)}w`,
  ).join(", ");

/** 撮影日の新しい順(同じ日は slug の昇順)に並べ、slug を付けた新しい配列を返す */
export const sortAlbums = (
  albums: Record<string, Album>,
): (Album & { slug: string })[] =>
  Object.entries(albums)
    .map(([slug, album]) => ({ ...album, slug }))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.slug < b.slug ? -1 : 1;
    });

/** 行の高さの目安(px)。表示幅の半分を超えないようにする(spec FR-005) */
export const rowTargetHeight = (width: number): number =>
  Math.min(PHOTO_ROW_HEIGHT, width / 2);

/** 行の組み方の結果。行ごとの写真と、揃えた高さ(px) */
export type PhotoRow = { photos: Photo[]; height: number };

/**
 * 行の高さを揃えて並べる(specs/009-photograph/research.md R1)。写真を先頭から順に目安の高さで
 * 並べ、幅(写真の幅の合計 + 隙間)が表示幅に達したところで行を区切り、その行がちょうど表示幅に
 * 収まる高さに揃える。最後の行は目安の高さのまま。先頭から順に決まるため、後ろに写真を足しても
 * それまでの最後の行より前の行は変わらない。
 */
export const justifyRows = (
  photos: Photo[],
  width: number,
  targetHeight: number,
  gap: number,
): PhotoRow[] => {
  const rows: PhotoRow[] = [];
  let current: Photo[] = [];
  let ratioSum = 0;

  for (const photo of photos) {
    current.push(photo);
    ratioSum += photo.width / photo.height;
    const gaps = gap * (current.length - 1);

    if (ratioSum * targetHeight + gaps >= width) {
      rows.push({ photos: current, height: (width - gaps) / ratioSum });
      current = [];
      ratioSum = 0;
    }
  }
  if (current.length > 0) {
    rows.push({ photos: current, height: targetHeight });
  }

  return rows;
};
