import { describe, expect, it } from "vitest";
import {
  type ConnectionMap,
  type Participant,
  TOWN_ID,
  connectionKey,
  createInitialConnections,
  getColumnTotal,
  getConnection,
  getRowTotal,
  isTownConnection,
  parseStrengthInput,
  restoreConnectionTable,
  toParticipantLabel,
  toTotalStrength,
} from "./connection-table-utils";

const participants: Participant[] = [
  { id: TOWN_ID, name: "町" },
  { id: "p1", name: "アリス" },
  { id: "p2", name: "ボブ" },
];

describe("parseStrengthInput", () => {
  it.each([
    ["", ""],
    ["1", 1],
    ["5", 5],
  ])("%s は %s として受け付ける", (input, expected) => {
    expect(parseStrengthInput(input)).toBe(expected);
  });

  it.each(["0", "6", "12", "a", "１", "-1", " "])(
    "%s は null を返して入力を無視させる",
    (input) => {
      expect(parseStrengthInput(input)).toBeNull();
    },
  );
});

describe("toTotalStrength", () => {
  it("空欄は0として数える", () => {
    expect(toTotalStrength("")).toBe(0);
    expect(toTotalStrength(3)).toBe(3);
  });
});

describe("toParticipantLabel", () => {
  it("名前があればそれを使う", () => {
    expect(toParticipantLabel({ id: "p1", name: "アリス" }, 1)).toBe("アリス");
    expect(toParticipantLabel({ id: TOWN_ID, name: "町" }, 0)).toBe("町");
  });

  it("名前が空なら行番号(1始まり)で区別する", () => {
    expect(toParticipantLabel({ id: "p1", name: "" }, 1)).toBe("2行目");
    expect(toParticipantLabel({ id: "p5", name: "" }, 5)).toBe("6行目");
  });
});

describe("isTownConnection", () => {
  it("町から人へのつながりだけ true", () => {
    expect(isTownConnection(TOWN_ID, "p1")).toBe(true);
    expect(isTownConnection("p1", TOWN_ID)).toBe(false);
    expect(isTownConnection("p1", "p2")).toBe(false);
    expect(isTownConnection(TOWN_ID, TOWN_ID)).toBe(false);
  });
});

describe("createInitialConnections", () => {
  it("自分自身以外の全組み合わせを作る", () => {
    const connections = createInitialConnections(participants);

    // 3人なら 3 * 2 = 6 通り
    expect(Object.keys(connections)).toHaveLength(6);
    expect(connections[connectionKey("p1", "p2")]).toEqual({
      content: "",
      strength: "",
    });
    expect(connections[connectionKey("p1", "p1")]).toBeUndefined();
  });
});

describe("getConnection", () => {
  it("町から人へのつながりは内容が受容で固定される", () => {
    const connections: ConnectionMap = {
      [connectionKey(TOWN_ID, "p1")]: { content: "好意", strength: 2 },
    };

    expect(getConnection(connections, TOWN_ID, "p1")).toEqual({
      content: "受容",
      strength: 2,
    });
  });

  it("保存されていない組み合わせは既定値を返す", () => {
    expect(getConnection({}, "p1", "p2")).toEqual({
      content: "",
      strength: "",
    });
  });
});

describe("合計の計算", () => {
  const connections: ConnectionMap = {
    [connectionKey("p1", "p2")]: { content: "信頼", strength: 3 },
    [connectionKey("p1", TOWN_ID)]: { content: "家族", strength: 1 },
    [connectionKey("p2", "p1")]: { content: "対抗", strength: 5 },
    [connectionKey(TOWN_ID, "p1")]: { content: "受容", strength: 2 },
  };

  it("行合計はその人が向けている強さの総和", () => {
    expect(getRowTotal(participants, connections, "p1")).toBe(4);
    expect(getRowTotal(participants, connections, "p2")).toBe(5);
  });

  it("列合計はその人が向けられている強さの総和", () => {
    expect(getColumnTotal(participants, connections, "p1")).toBe(7);
    expect(getColumnTotal(participants, connections, "p2")).toBe(3);
  });

  it("空欄しかなければ0", () => {
    expect(getRowTotal(participants, {}, "p1")).toBe(0);
    expect(getColumnTotal(participants, {}, "p1")).toBe(0);
  });
});

describe("restoreConnectionTable", () => {
  const valid = JSON.stringify({
    participants: [
      { id: TOWN_ID, name: "町" },
      { id: "p1", name: "アリス" },
    ],
    connections: { "p1:town": { content: "信頼", strength: 3 } },
  });

  it("保存された内容を復元する", () => {
    expect(restoreConnectionTable(valid)).toEqual({
      participants: [
        { id: TOWN_ID, name: "町" },
        { id: "p1", name: "アリス" },
      ],
      connections: { "p1:town": { content: "信頼", strength: 3 } },
    });
  });

  it("町の名前は保存値によらず「町」に戻す", () => {
    const renamedTown = JSON.stringify({
      participants: [{ id: TOWN_ID, name: "改名された町" }],
      connections: {},
    });

    expect(restoreConnectionTable(renamedTown)?.participants).toEqual([
      { id: TOWN_ID, name: "町" },
    ]);
  });

  it.each([
    ["JSONとして壊れている", "{ not json"],
    ["participantsが配列でない", '{"participants":"x"}'],
    ["participantsが空", '{"participants":[]}'],
    ["先頭が町でない", '{"participants":[{"id":"p1","name":"アリス"}]}'],
  ])("%s 場合は null", (_label, stored) => {
    expect(restoreConnectionTable(stored)).toBeNull();
  });

  it("形式の合わないつながりは捨てる", () => {
    const stored = JSON.stringify({
      participants: [{ id: TOWN_ID, name: "町" }],
      connections: {
        "p1:p2": { content: "信頼", strength: 3 },
        "p1:p3": { content: "信頼", strength: 9 },
        "p1:p4": { content: 1, strength: "" },
        "p1:p5": null,
      },
    });

    expect(restoreConnectionTable(stored)?.connections).toEqual({
      "p1:p2": { content: "信頼", strength: 3 },
    });
  });
});
