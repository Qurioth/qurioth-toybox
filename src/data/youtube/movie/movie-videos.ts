/** 旅行などでオーナーが撮影し、YouTube に公開した動画 */
export type MovieVideo = {
  /** YouTube の動画ID(`https://youtu.be/<videoId>` の `<videoId>` 部分) */
  videoId: string;
  /** 画面に出すタイトル。YouTube 側のタイトルと揃えなくてよい */
  title: string;
  /** 撮影場所(例: 京都、台湾) */
  location?: string;
  /** 撮影日。`YYYY-MM-DD` で書く。一覧はこの日付の新しい順に並ぶ */
  shotAt?: string;
  /** メモ。改行を含めてよい */
  note?: string;
};

/** 並び順は画面側で撮影日から決めるため、どこに書き足してもよい */
export const movieVideos: MovieVideo[] = [
  {
    videoId: "_nJmrQDwcV8",
    title: "Memories of Okinawa",
    location: "沖縄",
    shotAt: "2026-02-10",
    note: "2026-02-10〜2026-02-11 の2日間で撮影",
  },
  {
    videoId: "ZixHD6OQ-hU",
    title: "Memories of Nagasaki",
    location: "長崎",
    shotAt: "2025-07-05",
    note: "2025-07-05〜2025-07-06 の2日間で撮影",
  },
  {
    videoId: "KpvfmztYaMA",
    title: "Drone - Nagasaki Shishigawa",
    location: "長崎",
    shotAt: "2025-03-29",
    note: "2025-03-29〜2025-03-30 の2日間で撮影",
  },
  {
    videoId: "mHkwmneqc7U",
    title: "Drone - Nagasaki Shishigawa",
    location: "長崎",
    shotAt: "2025-03-29",
    note: "2025-03-29〜2025-03-30 の2日間で撮影",
  },
  {
    videoId: "Te_U-TZ3Y2E",
    title: "Drone - Nagasaki Shishigawa",
    location: "長崎",
    shotAt: "2023-11-25",
    note: "2023-11-25〜2023-11-26 の2日間で撮影",
  },
  {
    videoId: "g_FWS6kQq90",
    title: "Touring - Nagasaki GOTO FUKUE ISLAND",
    location: "長崎",
    shotAt: "2020-08-01",
  },
  {
    videoId: "H_Kn68Muqco",
    title: "Touring - Fukuoka Thunder Mountain",
    location: "福岡",
    shotAt: "2021-06-06",
  },
  {
    videoId: "ql0Ok5ZGrWQ",
    title: "Drone - Fukuoka Katsuura Beach",
    location: "福岡",
    shotAt: "2021-05-09",
  },
  {
    videoId: "KGyGvJ_jr5U",
    title: "Drone - Nagasaki YUI's Beach",
    location: "長崎",
    shotAt: "2021-04-30",
  },
  {
    videoId: "zT2Y-3JIKpE",
    title: "Drone - KOZAKI Shrine And KODA",
    shotAt: "2021-03-27",
  },
  {
    videoId: "a_PhfSWMHTA",
    title: "Drone - Japan Nagasaki TSUGANE's Waterfall",
    location: "長崎",
    shotAt: "2021-02-23",
  },
  {
    videoId: "ZclLm7LiBc0",
    title: "Drone - Snow Nagasaki Citizen's Forest",
    location: "長崎",
    shotAt: "2021-01-11",
  },
  {
    videoId: "_JTfwtU_YRM",
    title: "Drone - Kawahara And Kabashima",
    shotAt: "2020-11-14",
  },
  {
    videoId: "riIIkimwADk",
    title: "Drone - Takahama And Takero beach",
    shotAt: "2020-09-22",
  },
  {
    videoId: "e-IlqLO4aE0",
    title: "Drone - Whale beach And Dragon's mouth",
    shotAt: "2020-10-24",
  },
  {
    videoId: "LV3pTX5U3zg",
    title: "Drone - Nagasaki Shishigawa",
    location: "長崎",
    shotAt: "2020-10-03",
  },
  {
    videoId: "I3nx2M7Qc2c",
    title: "Drone - Nagasaki KARAKO Coastal park",
    location: "長崎",
    shotAt: "2020-09-13",
  },
  {
    videoId: "zRgq22Pcs4k",
    title: "Drone - Nagasaki Island of God",
    location: "長崎",
    shotAt: "2020-08-29",
  },
];
