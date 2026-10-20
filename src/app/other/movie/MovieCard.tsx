import YouTubeEmbed from "@/components/YoutubeEmbed";
import type { MovieVideo } from "@/data/youtube/movie/movie-videos";

const hasText = (value?: string): value is string =>
  Boolean(value && value.trim().length > 0);

/** 動画1本分のプレーヤーとタイトル・撮影情報。未登録の項目は欄ごと出さない */
const MovieCard = ({ movie }: { movie: MovieVideo }) => {
  const details = [
    { label: "撮影場所", value: movie.location },
    { label: "撮影日", value: movie.shotAt },
    { label: "メモ", value: movie.note },
  ].filter((detail): detail is { label: string; value: string } =>
    hasText(detail.value),
  );

  return (
    <article className="w-full max-w-lg overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <YouTubeEmbed videoId={movie.videoId} />

      <div className="flex flex-col gap-4 p-4 text-sm text-zinc-800 dark:text-zinc-100">
        <h2 className="break-words text-lg font-bold">{movie.title}</h2>

        {details.length > 0 && (
          <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-2">
            {details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
                  {label}
                </dt>
                <dd className="min-w-0 whitespace-pre-line break-words">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
};

export default MovieCard;
