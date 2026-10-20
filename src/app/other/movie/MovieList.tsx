import type { MovieVideo } from "@/data/youtube/movie/movie-videos";
import { sortMoviesByShotAt } from "@/utils/movie-utils";
import MovieCard from "./MovieCard";

/** 撮影日の新しい順に動画を並べる。1本も無いときはその旨を示す */
const MovieList = ({ movies }: { movies: MovieVideo[] }) => {
  if (movies.length === 0) {
    return (
      <p className="mx-auto w-full max-w-[66rem] text-sm text-zinc-500 dark:text-zinc-400">
        公開している動画はまだありません。
      </p>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[66rem] grid-cols-1 justify-items-center gap-8 lg:grid-cols-2">
      {sortMoviesByShotAt(movies).map((movie) => (
        <MovieCard key={movie.videoId} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;
