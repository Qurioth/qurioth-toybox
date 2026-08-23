import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ScenarioListItem } from "@/utils/scenario-filter";
import ScenarioList from "./ScenarioList";

const scenarios: ScenarioListItem[] = [
  {
    id: "yomi",
    title: "黄泉比良坂",
    titleKana: "よもつひらさか",
    system: "クトゥルフ神話TRPG 7版",
    players: { min: 3, max: 4 },
    playTimeHours: { min: 4, max: 6 },
    summary: "江戸の裏長屋を巡るシナリオ。",
  },
  {
    id: "marebito",
    title: "まれびとの島",
    titleKana: "まれびとのしま",
    system: "クトゥルフ神話TRPG 6版",
    players: { min: 2, max: 2 },
    playTimeHours: { min: 3, max: 3 },
    summary: "南の島に招かれる。",
  },
  {
    id: "yuyake",
    title: "夏の日",
    titleKana: "なつのひ",
    system: "ふしぎもののけRPG ゆうやけこやけ",
    players: { min: 1, max: 5 },
    playTimeHours: { min: 2, max: 8 },
    summary: "もののけと過ごす一日。",
  },
];

const renderList = () => render(<ScenarioList scenarios={scenarios} />);

/** 「N件 / M件」の N */
const matchedCount = () =>
  Number(
    (screen.getByText(/\d+件 \/ \d+件/).textContent ?? "").match(
      /^(\d+)件/,
    )?.[1],
  );

const titles = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("ScenarioList", () => {
  it("初期表示は全件", () => {
    renderList();

    expect(matchedCount()).toBe(3);
    expect(titles()).toHaveLength(3);
  });

  it("タイトルで絞り込める", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("タイトル"), "まれびと");

    expect(titles()).toEqual(["まれびとの島"]);
  });

  it("ふりがなでも絞り込める", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("タイトル"), "よもつ");

    expect(titles()).toEqual(["黄泉比良坂"]);
  });

  it("空白区切りはAND条件", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("タイトル"), "の 島");

    expect(titles()).toEqual(["まれびとの島"]);
  });

  it("システムで絞り込める", async () => {
    const user = userEvent.setup();
    renderList();

    await user.selectOptions(
      screen.getByLabelText("システム"),
      "クトゥルフ神話TRPG 7版",
    );

    expect(titles()).toEqual(["黄泉比良坂"]);
  });

  it("人数は範囲に含まれるものを残す", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("人数"), "4");

    // 3〜4人 と 1〜5人 が該当。2人固定は外れる
    expect(titles()).toEqual(["黄泉比良坂", "夏の日"]);
  });

  it("時間は範囲に含まれるものを残す", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("時間"), "3");

    expect(titles()).toEqual(["まれびとの島", "夏の日"]);
  });

  it("数値欄は2桁までの数字だけ受け付け、0は空になる", async () => {
    const user = userEvent.setup();
    renderList();

    const players = screen.getByLabelText("人数");
    await user.type(players, "abc");
    expect(players).toHaveValue("");

    await user.type(players, "0");
    expect(players).toHaveValue("");

    await user.type(players, "123");
    expect(players).toHaveValue("12");
  });

  it("複数の条件を同時に適用できる", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("タイトル"), "の");
    await user.type(screen.getByLabelText("人数"), "2");

    // 「まれびとの島」(2人) と「夏の日」(1〜5人)。「夏の日」に「の」は含まれる
    expect(titles()).toEqual(["まれびとの島", "夏の日"]);
  });

  it("該当なしのときはメッセージを出す", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByLabelText("タイトル"), "存在しないタイトル");

    expect(matchedCount()).toBe(0);
    expect(
      screen.getByText("条件に一致するシナリオはありません。"),
    ).toBeInTheDocument();
  });

  it("条件を入れるとクリアボタンが出て、押すと全条件が消える", async () => {
    const user = userEvent.setup();
    renderList();

    expect(
      screen.queryByRole("button", { name: "クリア" }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("タイトル"), "の");
    await user.type(screen.getByLabelText("人数"), "2");

    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(screen.getByLabelText("タイトル")).toHaveValue("");
    expect(screen.getByLabelText("人数")).toHaveValue("");
    expect(matchedCount()).toBe(3);
  });

  it("カードは詳細ページへのリンクと基本情報を持つ", () => {
    renderList();

    const link = screen.getByRole("link", { name: /黄泉比良坂/ });
    expect(link).toHaveAttribute("href", "/trpg/scenario/yomi");
    expect(link).toHaveTextContent("3～4人");
    expect(link).toHaveTextContent("4～6時間程度");
    expect(link).toHaveTextContent("クトゥルフ神話TRPG 7版");
  });

  it("下限と上限が同じ時間は範囲表記にしない", () => {
    renderList();

    expect(
      screen.getByRole("link", { name: /まれびとの島/ }),
    ).toHaveTextContent("3時間程度");
  });
});
