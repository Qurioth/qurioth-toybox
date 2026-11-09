/** 公開している写真1枚。画像は R2 に置き、Worker から配信する(ADR-0017) */
export type Photo = {
  /** 元の写真ファイルの SHA-256 の先頭16文字(16進数、小文字)。R2 上の画像の名前になる */
  key: string;
  /** 幅 1280px 版の実際の幅。元の幅が 1280px 未満なら元の幅 */
  width: number;
  /** 幅 1280px 版の実際の高さ */
  height: number;
};

/**
 * 写真のまとまり。`pnpm photo:sync` が `src/data/photograph/albums/<slug>.json` として生成する。
 * slug はファイル名から取り、ここには持たない。
 */
export type Album = {
  title: string;
  /** 撮影日。`YYYY-MM-DD`。一覧はこの日付の新しい順に並ぶ */
  date: string;
  /** 表紙にする写真の key(リストの `# cover:`)。無ければ先頭の写真が表紙になる */
  cover?: string;
  /** 並び順のとおり */
  photos: Photo[];
};
