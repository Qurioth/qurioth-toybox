import { describe, expect, it } from "vitest";
import type { ReplayVideo } from "@/data/youtube/trpg/youtube-id";
import {
  createSearchTarget,
  filterReplays,
  getReplaySearchTargets,
  getSearchField,
  getSearchSuggestions,
  getSearchTargetKey,
  mergeSearchTargets,
  parseSearchQuery,
  replayMatchesSearch,
  replayMatchesSearchTarget,
} from "./replay-search";

const replays: ReplayVideo[] = [
  {
    videoId: "v1",
    trpgSystemName: "クトゥルフ神話TRPG 7版",
    scenarioName: "ワールドエンド",
    gmName: "リアン",
    characters: [
      { characterName: "玉利 響子", playerName: "pon" },
      { characterName: "井上 ゆかり", playerName: "Qurioth" },
    ],
  },
  {
    videoId: "v2",
    trpgSystemName: "ゆうやけこやけ",
    scenarioName: "夏の日",
    gmName: "Qurioth",
    characters: [{ characterName: "喪造", playerName: "pon" }],
  },
  {
    playlistId: "p1",
    scenarioName: "名もなき記録",
    // システム名・GM名・キャラクターなし
  },
];

describe("getSearchField", () => {
  it.each([
    ["gm", "gm"],
    ["GM", "gm"],
    ["ＧＭ", "gm"],
    ["pc", "character"],
    ["シナリオ", "scenario"],
    ["SYS", "system"],
    ["システム名", "system"],
    // エイリアス表のキーが大文字だと、小文字化した入力と一致せず引けなくなる
    ["GM名", "gm"],
    ["ＧＭ名", "gm"],
  ])("%s は %s として解釈する", (input, expected) => {
    expect(getSearchField(input)).toBe(expected);
  });

  it("ラベルとして表示している項目名はすべて指定に使える", () => {
    expect(getSearchField("シナリオタイトル")).toBe("scenario");
    expect(getSearchField("システム名")).toBe("system");
    expect(getSearchField("GM名")).toBe("gm");
    expect(getSearchField("プレイヤー名")).toBe("player");
    expect(getSearchField("キャラクター名")).toBe("character");
  });

  it("知らない項目名は undefined", () => {
    expect(getSearchField("ぬるぽ")).toBeUndefined();
  });
});

describe("getReplaySearchTargets", () => {
  it("入力されている項目だけを検索対象にする", () => {
    expect(getReplaySearchTargets(replays[0]).map((t) => t.field)).toEqual([
      "scenario",
      "system",
      "gm",
      "character",
      "player",
      "character",
      "player",
    ]);
  });

  it("空の項目は対象に含めない", () => {
    expect(getReplaySearchTargets(replays[2])).toEqual([
      createSearchTarget("scenario", "名もなき記録"),
    ]);
  });
});

describe("parseSearchQuery", () => {
  it("フィールド指定とフリーワードを切り分ける", () => {
    const parsed = parseSearchQuery("gm:リアン クトゥルフ pc:玉利 響子");

    expect(parsed.targets).toEqual([
      createSearchTarget("gm", "リアン"),
      createSearchTarget("character", "玉利"),
    ]);
    expect(parsed.freeQuery).toBe("クトゥルフ 響子");
  });

  it("全角コロンと読点区切りも扱える", () => {
    const parsed = parseSearchQuery("ＧＭ：リアン、夏");

    expect(parsed.targets).toEqual([createSearchTarget("gm", "リアン")]);
    expect(parsed.freeQuery).toBe("夏");
  });

  it("知らない項目名はフリーワードとして残す", () => {
    const parsed = parseSearchQuery("ぬるぽ:ガッ");

    expect(parsed.targets).toEqual([]);
    expect(parsed.freeQuery).toBe("ぬるぽ:ガッ");
  });

  it("空文字は何も生まない", () => {
    expect(parseSearchQuery("   ")).toEqual({ targets: [], freeQuery: "" });
  });
});

describe("replayMatchesSearch", () => {
  it("空のクエリは全件通す", () => {
    expect(replayMatchesSearch(replays[0], "")).toBe(true);
  });

  it("複数語はAND条件", () => {
    expect(replayMatchesSearch(replays[0], "リアン 玉利")).toBe(true);
    expect(replayMatchesSearch(replays[0], "リアン 喪造")).toBe(false);
  });

  it("大文字小文字と全角半角を区別しない", () => {
    expect(replayMatchesSearch(replays[0], "qurioth")).toBe(true);
    expect(replayMatchesSearch(replays[0], "ＱＵＲＩＯＴＨ")).toBe(true);
  });
});

describe("replayMatchesSearchTarget", () => {
  it("項目と値が一致するときだけ true", () => {
    expect(
      replayMatchesSearchTarget(replays[0], createSearchTarget("gm", "リアン")),
    ).toBe(true);
    // 同じ値でも項目が違えば一致しない
    expect(
      replayMatchesSearchTarget(
        replays[1],
        createSearchTarget("gm", "Qurioth"),
      ),
    ).toBe(true);
    expect(
      replayMatchesSearchTarget(
        replays[1],
        createSearchTarget("player", "Qurioth"),
      ),
    ).toBe(false);
  });

  it("部分一致では通さない", () => {
    expect(
      replayMatchesSearchTarget(replays[0], createSearchTarget("gm", "リア")),
    ).toBe(false);
  });
});

describe("mergeSearchTargets", () => {
  it("キーが重複するものはまとめる", () => {
    const merged = mergeSearchTargets(
      [createSearchTarget("gm", "リアン")],
      [createSearchTarget("gm", "りあん"), createSearchTarget("gm", "リアン")],
    );

    expect(merged.map(getSearchTargetKey)).toEqual(["gm:リアン", "gm:りあん"]);
  });
});

describe("filterReplays", () => {
  it("フィールド指定はAND、フリーワードも同時に効く", () => {
    const result = filterReplays(
      replays,
      [createSearchTarget("player", "pon")],
      "クトゥルフ",
    );

    expect(result.map((r) => r.videoId)).toEqual(["v1"]);
  });

  it("条件が無ければ全件返す", () => {
    expect(filterReplays(replays, [], "")).toHaveLength(3);
  });

  it("両立しない条件なら0件", () => {
    const result = filterReplays(
      replays,
      [createSearchTarget("gm", "リアン"), createSearchTarget("gm", "Qurioth")],
      "",
    );

    expect(result).toEqual([]);
  });
});

describe("getSearchSuggestions", () => {
  it("入力中の語に部分一致する候補を項目付きで返す", () => {
    const suggestions = getSearchSuggestions(replays, "リア", []);

    expect(suggestions).toEqual([createSearchTarget("gm", "リアン")]);
  });

  it("項目を指定するとその項目だけに絞る", () => {
    expect(getSearchSuggestions(replays, "pl:pon", [])).toEqual([
      createSearchTarget("player", "pon"),
    ]);
    expect(getSearchSuggestions(replays, "gm:pon", [])).toEqual([]);
  });

  it("選択済みの候補は出さない", () => {
    expect(
      getSearchSuggestions(replays, "リア", [
        createSearchTarget("gm", "リアン"),
      ]),
    ).toEqual([]);
  });

  it("空の入力では候補を出さない", () => {
    expect(getSearchSuggestions(replays, "", [])).toEqual([]);
    expect(getSearchSuggestions(replays, "gm:", [])).toEqual([]);
  });

  it("末尾の語だけを手がかりにする", () => {
    expect(getSearchSuggestions(replays, "クトゥルフ pon", [])).toEqual([
      createSearchTarget("player", "pon"),
    ]);
  });

  it("上限を超えたら打ち切る", () => {
    expect(getSearchSuggestions(replays, "o", [], 2)).toHaveLength(2);
  });

  it("同じ値が複数のリプレイに出ても1件にまとめる", () => {
    // pon は v1 と v2 の両方に出る
    expect(getSearchSuggestions(replays, "pon", [])).toEqual([
      createSearchTarget("player", "pon"),
    ]);
  });
});
