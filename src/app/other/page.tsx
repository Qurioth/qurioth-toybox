import { ArrowRight } from "lucide-react";
import Template from "@/components/Template";
import { OTHER_COVER_MOVIE } from "@/constants/movie";
import { OTHER_COVER_ALBUM } from "@/constants/photograph";
import { albums } from "@/data/photograph/albums";
import { movieVideos } from "@/data/youtube/movie/movie-videos";
import { pickMovie } from "@/utils/movie-utils";
import { albumCover, photoUrl, pickAlbum } from "@/utils/photograph-utils";

type SectionCard = {
  title: string;
  href: string;
  description: string;
  /** 件数(写真はアルバムの数、動画は本数) */
  meta: string;
  /** 代表の画像。中身が無いときは無い */
  image?: string;
};

const coverAlbum = pickAlbum(albums, OTHER_COVER_ALBUM);
const coverMovie = pickMovie(movieVideos, OTHER_COVER_MOVIE);

const cards: SectionCard[] = [
  {
    title: "Photograph",
    href: "/other/photograph",
    description: "旅行や日常で撮った写真を、アルバムごとにまとめています。",
    meta: `${Object.keys(albums).length}アルバム`,
    image: coverAlbum && photoUrl(albumCover(coverAlbum).key, 1280),
  },
  {
    title: "Movie",
    href: "/other/movie",
    description: "旅行などで撮って YouTube に公開した動画です。",
    meta: `${movieVideos.length}本`,
    // hqdefault(4:3)は上下に黒い帯があるが、16:9 の枠に object-cover で収めると帯が切れる
    image:
      coverMovie &&
      `https://i.ytimg.com/vi/${coverMovie.videoId}/hqdefault.jpg`,
  },
];

const CardLink = ({ title, href, description, meta, image }: SectionCard) => (
  <a
    href={href}
    className="group overflow-hidden rounded-lg border border-black/[.08] bg-white shadow-sm transition-shadow hover:border-sky-500 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 dark:border-white/[.145] dark:bg-slate-950 dark:hover:border-sky-400 dark:focus:ring-sky-950"
  >
    <div className="aspect-video overflow-hidden bg-zinc-200 dark:bg-slate-800">
      {image && (
        // biome-ignore lint/performance/noImgElement: Worker や YouTube が配信する画像を、そのままの大きさで出す
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </div>
    <div className="flex flex-col gap-2 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
          {title}
        </h2>
        <ArrowRight
          aria-hidden="true"
          className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-600 dark:text-gray-500 dark:group-hover:text-sky-300"
          size={20}
        />
      </div>
      <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
      <p className="text-xs font-bold tracking-wide text-sky-700 dark:text-sky-300">
        {meta}
      </p>
    </div>
  </a>
);

export default function OtherPage() {
  return (
    <Template>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <CardLink key={card.href} {...card} />
        ))}
      </div>
    </Template>
  );
}
