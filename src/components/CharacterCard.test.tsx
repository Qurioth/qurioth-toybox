import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Investigator } from "@/types/Charaeno7th";
import CharacterCard from "./CharacterCard";

vi.mock("@/components/recharts/ReaderChart", () => ({
  default: () => null,
}));

const sampleData: Investigator = {
  name: "テスト太郎",
  occupation: "探偵",
  age: "30",
  sex: "男性",
  residence: "東京",
  birthplace: "東京",
  characteristics: {
    str: 50,
    con: 50,
    pow: 50,
    dex: 50,
    app: 50,
    siz: 50,
    int: 50,
    edu: 50,
  },
  attribute: {
    hp: 12,
    mp: 10,
    mov: 8,
    build: 0,
    db: "+0",
    san: { value: 50, max: 99 },
    luck: 60,
  },
  skills: [{ name: "目星", value: 70, edited: true }],
  weapons: [],
  possessions: [],
  credit: { spendingLevel: "", cash: "", assetsDetails: "" },
  backstory: [{ name: "容姿の描写", entries: [{ text: "黒髪" }] }],
  fellows: [],
  note: "",
  chatpalette: "",
};

describe("CharacterCard", () => {
  it("初期状態ではステータス面(表面)が表示され、技能表(裏面)は非表示になっている", () => {
    render(<CharacterCard data={sampleData} />);
    const card = within(screen.getByRole("button"));

    expect(card.getByText("HP")).toBeVisible();
    expect(card.getByText("12")).toBeVisible();
    expect(card.getByText("目星")).not.toBeVisible();
  });

  it("クリックすると裏面(技能表)に切り替わる", async () => {
    const user = userEvent.setup();
    render(<CharacterCard data={sampleData} />);
    const card = within(screen.getByRole("button"));

    await user.click(screen.getByRole("button"));

    await waitFor(() => expect(card.getByText("目星")).toBeVisible(), {
      timeout: 2000,
    });
    expect(card.getByText("HP")).not.toBeVisible();
  });

  it("キーボード操作(Enter)でも表裏が切り替わる", async () => {
    const user = userEvent.setup();
    render(<CharacterCard data={sampleData} />);
    const card = within(screen.getByRole("button"));

    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(card.getByText("目星")).toBeVisible(), {
      timeout: 2000,
    });
  });

  it("もう一度クリックすると表面に戻る", async () => {
    const user = userEvent.setup();
    render(<CharacterCard data={sampleData} />);
    const card = within(screen.getByRole("button"));

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(card.getByText("目星")).toBeVisible(), {
      timeout: 2000,
    });

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(card.getByText("HP")).toBeVisible(), {
      timeout: 2000,
    });
  });

  it("フリップ中にもう一度クリックしても、表示は一度分しか切り替わらない(既存の挙動)", async () => {
    render(<CharacterCard data={sampleData} />);
    const card = within(screen.getByRole("button"));

    fireEvent.click(screen.getByRole("button"));
    await new Promise((resolve) => setTimeout(resolve, 200)); // アニメーション中に再度クリック
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(card.getByText("目星")).toBeVisible(), {
      timeout: 2000,
    });
  });
});
