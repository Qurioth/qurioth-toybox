import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import ConnectionTablePage from "./page";

const renderPage = () =>
  render(
    <DarkModeProvider>
      <ConnectionTablePage />
    </DarkModeProvider>,
  );

/** 名前未入力の行は aria-label が重複するため、順番で取得する */
const nameInputs = () => screen.getAllByLabelText(/行の名前$/);

/** 「あなた」行の合計(ふしぎ列)を読む */
const rowTotals = () =>
  screen
    .getAllByRole("row")
    .slice(1, -1)
    .map((row) => {
      const cells = within(row).getAllByRole("cell");
      return cells[cells.length - 1].textContent;
    });

/** 最終行(想い)の列合計を読む */
const columnTotals = () => {
  const rows = screen.getAllByRole("row");
  const last = rows[rows.length - 1];
  return within(last)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("ConnectionTablePage", () => {
  it("初期表示は町＋5人分の行を持ち、合計はすべて0", () => {
    renderPage();

    // 町の行には名前入力がないため、入力欄は5つ
    expect(nameInputs()).toHaveLength(5);
    expect(rowTotals()).toEqual(["0", "0", "0", "0", "0", "0"]);
  });

  it("名前を入力すると見出しにも反映される", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(nameInputs()[0], "アリス");

    expect(screen.getByLabelText("アリス行の名前")).toHaveValue("アリス");
    // 列見出しにも出る
    expect(screen.getAllByText("アリス").length).toBeGreaterThan(0);
  });

  it("つながりの強さを入れると行合計と列合計に反映される", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(nameInputs()[0], "アリス");
    await user.type(nameInputs()[1], "ボブ");

    await user.type(
      screen.getByLabelText("アリスからボブへのつながりの強さ"),
      "3",
    );

    // アリスの行合計が3になる(町行を含めて2番目の行)
    expect(rowTotals()[1]).toBe("3");
    // ボブの列合計が3になる。列は 町/アリス/ボブ/... の順で、先頭セルは見出し
    expect(columnTotals()[2]).toBe("3");
  });

  it("1〜5以外の強さは入力できない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(nameInputs()[0], "アリス");
    await user.type(nameInputs()[1], "ボブ");

    const strength = screen.getByLabelText("アリスからボブへのつながりの強さ");
    await user.type(strength, "9");
    expect(strength).toHaveValue("");

    await user.type(strength, "4");
    expect(strength).toHaveValue("4");
  });

  it("町からのつながりは内容が受容で固定され、内容の入力欄を持たない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(nameInputs()[0], "アリス");

    expect(
      screen.queryByLabelText("町からアリスへのつながり内容"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("町からアリスへのつながりの強さ"),
    ).toBeInTheDocument();
    // 「受容」の固定表示がある
    expect(screen.getAllByText("受容").length).toBeGreaterThan(0);
  });

  it("行追加で人数が増える", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "行追加" }));

    expect(nameInputs()).toHaveLength(6);
  });

  it("削除ボタンで行が減る。町の行には削除ボタンがない", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(nameInputs()[0], "アリス");
    expect(nameInputs()).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: "アリスを削除" }));

    expect(nameInputs()).toHaveLength(4);
    expect(
      screen.queryByRole("button", { name: "アリスを削除" }),
    ).not.toBeInTheDocument();
    // 町を削除するボタンは存在しない
    expect(
      screen.queryByRole("button", { name: "町を削除" }),
    ).not.toBeInTheDocument();
  });

  it("入力内容がlocalStorageに保存され、再マウント時に復元される", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await user.type(nameInputs()[0], "アリス");
    await user.type(nameInputs()[1], "ボブ");
    await user.type(
      screen.getByLabelText("アリスからボブへのつながり内容"),
      "信頼",
    );
    await user.type(
      screen.getByLabelText("アリスからボブへのつながりの強さ"),
      "2",
    );

    unmount();
    renderPage();

    expect(await screen.findByLabelText("アリス行の名前")).toHaveValue(
      "アリス",
    );
    expect(screen.getByLabelText("アリスからボブへのつながり内容")).toHaveValue(
      "信頼",
    );
    expect(
      screen.getByLabelText("アリスからボブへのつながりの強さ"),
    ).toHaveValue("2");
  });

  it("壊れた保存データは無視して初期状態で始まる", () => {
    window.localStorage.setItem(
      "qurioth-toybox:trpg:connection-table",
      "{ this is not json",
    );

    renderPage();

    expect(nameInputs()).toHaveLength(5);
    expect(nameInputs()[0]).toHaveValue("");
  });
});
