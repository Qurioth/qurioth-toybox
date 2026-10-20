import Template from "@/components/Template";
import { movieVideos } from "@/data/youtube/movie/movie-videos";
import MovieList from "./MovieList";

export default function MoviePage() {
  return (
    <Template>
      <div className="w-full min-h-[calc(100vh-16rem)]">
        <div className="mx-auto mb-8 w-full max-w-[66rem]">
          <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">
            Movie
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            旅行などで撮った動画です。
          </p>
        </div>

        <MovieList movies={movieVideos} />
      </div>
    </Template>
  );
}
