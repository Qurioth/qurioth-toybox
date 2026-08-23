import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CharacterCardData } from "@/types/CharacterCard";
import CharacterCard from "./CharacterCard";

vi.mock("@/components/recharts/CharacteristicsRadarChart", () => ({
  default: () => <div data-testid="radar-chart" />,
}));

/** matchMedia の一致結果を差し替える(既定のスタブは常に false = モバイル扱い) */
const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 7版のカード相当(タイル4つ)。版ごとの変換は character-card-utils の担当 */
const sampleData: CharacterCardData = {
  name: "テスト太郎",
  characteristics: [
    { subject: "STR", value: 50 },
    { subject: "CON", value: 50 },
    { subject: "POW", value: 50 },
    { subject: "DEX", value: 50 },
    { subject: "APP", value: 50 },
    { subject: "SIZ", value: 50 },
    { subject: "INT", value: 50 },
    { subject: "EDU", value: 50 },
  ],
  attributes: [
    { label: "HP", value: 12 },
    { label: "MP", value: 10 },
    { label: "SAN", value: 50 },
    { label: "幸運", value: 60 },
  ],
  skills: [{ name: "目星", value: 70 }],
  sections: [{ heading: "容姿の描写", kind: "list", blocks: ["黒髪"] }],
};

/**
 * md以上での表裏の出し分けは Tailwind の md:hidden で行うため、jsdom では
 * 可視/不可視を判定できない(テストにCSSが読み込まれない)。
 * ここでは「隠すクラスが正しい側に付いているか」で代用し、実際の見え方は
 * ブラウザで確認する。
 */
const panelOf = (text: string) =>
  screen.getByText(text).closest("[class*='md:col-start']");

const isHiddenOnDesktop = (text: string) =>
  panelOf(text)?.className.includes("md:hidden") ?? null;

describe("CharacterCard", () => {
  describe("デスクトップ(md以上)", () => {
    it("初期は表面。レーダー・能力値・立ち絵を出し、裏面は隠す", async () => {
      stubMatchMedia(true);
      render(<CharacterCard data={sampleData} />);

      expect(isHiddenOnDesktop("HP")).toBe(false);
      expect(isHiddenOnDesktop("目星")).toBe(true);
      expect(isHiddenOnDesktop("容姿の描写")).toBe(true);
      // チャートは dynamic import なので1ティック待つ
      expect(await screen.findAllByTestId("radar-chart")).toHaveLength(1);
    });

    it("カード全体がボタンとして扱われる", () => {
      stubMatchMedia(true);
      render(<CharacterCard data={sampleData} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("クリックすると裏面に切り替わる", async () => {
      stubMatchMedia(true);
      const user = userEvent.setup();
      render(<CharacterCard data={sampleData} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => expect(isHiddenOnDesktop("目星")).toBe(false), {
        timeout: 2000,
      });
      expect(isHiddenOnDesktop("HP")).toBe(true);
    });

    it("キーボード操作(Enter)でも切り替わる", async () => {
      stubMatchMedia(true);
      const user = userEvent.setup();
      render(<CharacterCard data={sampleData} />);

      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");

      await waitFor(() => expect(isHiddenOnDesktop("目星")).toBe(false), {
        timeout: 2000,
      });
    });

    it("もう一度クリックすると表面に戻る", async () => {
      stubMatchMedia(true);
      const user = userEvent.setup();
      render(<CharacterCard data={sampleData} />);

      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(isHiddenOnDesktop("目星")).toBe(false), {
        timeout: 2000,
      });

      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(isHiddenOnDesktop("HP")).toBe(false), {
        timeout: 2000,
      });
    });

    it("フリップ中にもう一度クリックしても、表示は一度分しか切り替わらない(既存の挙動)", async () => {
      stubMatchMedia(true);
      render(<CharacterCard data={sampleData} />);

      fireEvent.click(screen.getByRole("button"));
      await new Promise((resolve) => setTimeout(resolve, 200)); // アニメーション中に再度クリック
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => expect(isHiddenOnDesktop("目星")).toBe(false), {
        timeout: 2000,
      });
    });

    it("裏返すとチャートを外し、戻すと復帰する", async () => {
      stubMatchMedia(true);
      const user = userEvent.setup();
      render(<CharacterCard data={sampleData} />);
      expect(await screen.findAllByTestId("radar-chart")).toHaveLength(1);

      // アニメーション中は中身ごとアンマウントされるため、
      // 「チャートが消えたか」ではなく反転が終わったかで待つ
      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(isHiddenOnDesktop("目星")).toBe(false), {
        timeout: 2000,
      });
      expect(screen.queryByTestId("radar-chart")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(isHiddenOnDesktop("HP")).toBe(false), {
        timeout: 2000,
      });
      expect(await screen.findAllByTestId("radar-chart")).toHaveLength(1);
    });
  });

  describe("モバイル(md未満)", () => {
    it("表裏の区別なく6要素すべてを出す", async () => {
      stubMatchMedia(false);
      render(<CharacterCard data={sampleData} />);

      // 名前・立ち絵・レーダー・能力値・技能表・バックストーリー
      expect(screen.getByText("テスト太郎")).toBeInTheDocument();
      expect(screen.getByAltText("portrait")).toBeInTheDocument();
      expect(await screen.findAllByTestId("radar-chart")).toHaveLength(1);
      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("目星")).toBeInTheDocument();
      expect(screen.getByText("容姿の描写")).toBeInTheDocument();
    });

    it("md未満で無条件に隠すクラスは付けない(隠すのは md:hidden だけ)", () => {
      stubMatchMedia(false);
      render(<CharacterCard data={sampleData} />);

      // md:hidden は md 以上でしか効かないので、モバイルでは全パネルが並ぶ。
      // 逆に無条件の hidden が付いていると、モバイルで消えてしまう
      for (const text of ["HP", "目星", "容姿の描写"]) {
        const className = panelOf(text)?.className ?? "";
        expect(className.split(/\s+/)).not.toContain("hidden");
      }
    });

    it("反転しないので、ボタンとしては扱わない", () => {
      stubMatchMedia(false);
      render(<CharacterCard data={sampleData} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  // カードは版を知らない。渡されたタイルとセクションの kind に素直に従う
  describe("版によって中身が変わる部分", () => {
    it("渡されたタイルをそのまま並べる", () => {
      stubMatchMedia(true);
      render(<CharacterCard data={sampleData} />);

      expect(screen.getByText("幸運")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
    });

    it("数値でないタイルの値(6版のダメージ・ボーナス)もそのまま出す", () => {
      stubMatchMedia(true);
      render(
        <CharacterCard
          data={{
            ...sampleData,
            attributes: [
              ...sampleData.attributes.slice(0, 3),
              { label: "DB", value: "+1D4" },
            ],
          }}
        />,
      );

      expect(screen.getByText("DB")).toBeInTheDocument();
      expect(screen.getByText("+1D4")).toBeInTheDocument();
      expect(screen.queryByText("幸運")).not.toBeInTheDocument();
    });

    it("kind が list のセクションは箇条書きにする", () => {
      stubMatchMedia(true);
      render(<CharacterCard data={sampleData} />);

      expect(screen.getByText("黒髪").closest("li")).toBeInTheDocument();
    });

    it("kind が text のセクションは段落にする", () => {
      stubMatchMedia(true);
      render(
        <CharacterCard
          data={{
            ...sampleData,
            sections: [
              {
                heading: "読んだクトゥルフ神話の魔導書",
                kind: "text",
                blocks: ["一段落目", "二段落目"],
              },
            ],
          }}
        />,
      );

      expect(
        screen.getByText("読んだクトゥルフ神話の魔導書"),
      ).toBeInTheDocument();
      expect(screen.getByText("一段落目").tagName).toBe("P");
      expect(screen.getByText("二段落目").tagName).toBe("P");
    });
  });

  it("カードは1枚だけ描画する(デスクトップ用とモバイル用を二重に持たない)", () => {
    stubMatchMedia(true);
    const { container } = render(<CharacterCard data={sampleData} />);

    expect(container.querySelectorAll("section")).toHaveLength(2); // カード + バックストーリーの見出し
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelectorAll("img[alt=portrait]")).toHaveLength(1);
    expect(container.querySelectorAll("div.h-72")).toHaveLength(1);
  });
});
