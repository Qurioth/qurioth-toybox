import type { MovieVideo } from "@/data/youtube/movie/movie-videos";

/**
 * 撮影日の新しい順に並べた新しい配列を返す。
 * 撮影日が同じものと撮影日の無いもの(末尾に回す)は、登録順を保つ(安定ソート)。
 */
export const sortMoviesByShotAt = (movies: MovieVideo[]): MovieVideo[] =>
  [...movies].sort((a, b) => {
    if (a.shotAt === b.shotAt) return 0;
    if (a.shotAt === undefined) return 1;
    if (b.shotAt === undefined) return -1;
    return a.shotAt < b.shotAt ? 1 : -1;
  });
