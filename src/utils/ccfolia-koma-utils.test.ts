import { describe, expect, it } from "vitest";
import type { ScenarioNpc } from "@/types/scenario-npc";
import { toCcfoliaKoma } from "./ccfolia-koma-utils";

const mitsuki: ScenarioNpc = {
  name: "沖嶋 深月",
  kana: "オキシマ ミツキ",
  portrait: { src: "/images/sample/mitsuki.png" },
  profile: "女性。写真家。",
  stats: [
    {
      abilities: [
        { label: "STR", value: "55" },
        { label: "CON", value: "75" },
        { label: "DEX", value: "60" },
      ],
      derived: [
        { label: "耐久力", value: "13" },
        { label: "マジック・ポイント", value: "9" },
        { label: "正気度", value: "42" },
        { label: "幸運", value: "35" },
        { label: "ダメージ・ボーナス", value: "+0" },
        { label: "ビルド", value: "0" },
        { label: "移動率", value: "8" },
      ],
    },
  ],
  skills: [
    { name: "芸術／製作（写真術）", value: 65 },
    { name: "目星", value: 45 },
  ],
};

describe("toCcfoliaKoma", () => {
  it("CCFOLIA の Clipboard API の形式でコマを作る(contracts/ccfolia-koma.md)", () => {
    expect(toCcfoliaKoma(mitsuki)).toEqual({
      kind: "character",
      data: {
        name: "沖嶋 深月",
        memo: "オキシマ ミツキ\n女性。写真家。",
        initiative: 60,
        status: [
          { label: "HP", value: 13, max: 13 },
          { label: "MP", value: 9, max: 9 },
          { label: "SAN", value: 42, max: 42 },
        ],
        params: [
          { label: "STR", value: "55" },
          { label: "CON", value: "75" },
          { label: "DEX", value: "60" },
          { label: "DB", value: "+0" },
          { label: "ビルド", value: "0" },
          { label: "移動率", value: "8" },
        ],
        commands: [
          "CC<={SAN} 【正気度ロール】",
          "CC<={STR} 【STR】",
          "CC<={CON} 【CON】",
          "CC<={DEX} 【DEX】",
          "CC<=65 【芸術／製作（写真術）】",
          "CC<=45 【目星】",
        ].join("\n"),
      },
    });
  });

  it("立ち絵があっても画像は含めない", () => {
    expect(toCcfoliaKoma(mitsuki).data).not.toHaveProperty("iconUrl");
  });

  it("能力値・技能のない人物は持っている項目だけにする", () => {
    expect(toCcfoliaKoma({ name: "案内人", profile: "町の案内人。" })).toEqual({
      kind: "character",
      data: { name: "案内人", memo: "町の案内人。" },
    });
    expect(toCcfoliaKoma({ name: "名無し" })).toEqual({
      kind: "character",
      data: { name: "名無し" },
    });
  });

  it("副次ステータスだけの存在は status だけを持つ", () => {
    expect(
      toCcfoliaKoma({
        name: "サーバーコア",
        stats: [{ abilities: [], derived: [{ label: "耐久力", value: "60" }] }],
      }).data,
    ).toEqual({
      name: "サーバーコア",
      status: [{ label: "HP", value: 60, max: 60 }],
    });
  });

  it("整数として読めない値は status とコマンドから外し、params には文字列で残す", () => {
    const { data } = toCcfoliaKoma({
      name: "ティンダロスの交雑種",
      stats: [
        {
          abilities: [
            { label: "STR", value: "105 - 10" },
            { label: "POW", value: "105" },
          ],
          derived: [{ label: "耐久力", value: "19 - 1" }],
        },
      ],
    });

    expect(data.status).toBeUndefined();
    expect(data.params).toEqual([
      { label: "STR", value: "105 - 10" },
      { label: "POW", value: "105" },
    ]);
    expect(data.commands).toBe("CC<={POW} 【POW】");
  });

  it("複数の姿を持つときは 1 つ目のステータスを使う", () => {
    const { data } = toCcfoliaKoma({
      name: "膨らんだ女",
      stats: [
        { abilities: [{ label: "POW", value: "50" }], derived: [] },
        {
          label: "怪物の姿",
          abilities: [{ label: "POW", value: "500" }],
          derived: [],
        },
      ],
    });

    expect(data.params).toEqual([{ label: "POW", value: "50" }]);
  });
});
