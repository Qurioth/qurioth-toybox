import Link from "next/link";
import type { Album } from "@/data/photograph/album-types";
import { albumCover, photoUrl, sortAlbums } from "@/utils/photograph-utils";

/** 撮影日の新しい順にアルバムのカードを並べる。1つも無いときはその旨を示す */
const AlbumList = ({ albums }: { albums: Record<string, Album> }) => {
  const sortedAlbums = sortAlbums(albums);

  if (sortedAlbums.length === 0) {
    return (
      <p className="mx-auto w-full max-w-[66rem] text-sm text-zinc-500 dark:text-zinc-400">
        まだアルバムがありません
      </p>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[66rem] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sortedAlbums.map((album) => {
        const { slug, title, date, photos } = album;
        const cover = albumCover(album);

        return (
          <Link
            key={slug}
            href={`/other/photograph/${slug}`}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            {/* biome-ignore lint/performance/noImgElement: Worker から配信する WebP を、取り込み時に決めた幅のまま出す(research R3) */}
            <img
              src={photoUrl(cover.key, 640)}
              width={cover.width}
              height={cover.height}
              alt={`${title}の表紙`}
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] w-full bg-zinc-100 object-cover dark:bg-slate-700"
            />
            <div className="flex flex-col gap-1 p-4 text-sm text-zinc-800 dark:text-zinc-100">
              <h2 className="break-words text-lg font-bold">{title}</h2>
              <p className="flex gap-3 text-zinc-500 dark:text-zinc-400">
                <span>{date}</span>
                <span>{photos.length}枚</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default AlbumList;
