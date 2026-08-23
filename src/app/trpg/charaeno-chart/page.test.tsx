import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHARACTER_SHEET_FETCH_FAILED,
  CHARACTER_SHEET_UNEXPECTED_FORMAT,
  CHARACTER_SHEET_URL_INVALID,
} from "@/constants/message";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import CharaenoChartPage from "./page";

vi.mock("@/components/recharts/CharacteristicsRadarChart", () => ({
  default: () => null,
}));

const SHEET_URL_7TH = "https://charaeno.com/7th/abc123";
const SHEET_URL_6TH = "https://charaeno.com/6th/xyz789";

const valid7thSummary = {
  name: "テスト太郎（てすとたろう）",
  note: "",
  skills: [],
  backstory: [],
  portraitURL: "",
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
  attribute: { hp: 10, mp: 10, luck: 50, san: { value: 50, max: 99 } },
};

/** 6版のレスポンス。バックストーリーと幸運が無く、代わりに3つの自由記述を持つ */
const valid6thSummary = {
  name: "六版太郎（ろくはんたろう）",
  note: "",
  skills: [],
  portraitURL: "",
  mentalDisorder: "",
  mythosTomes: "『無名祭祀書』",
  artifactsAndSpells: "",
  characteristics: {
    str: 15,
    con: 10,
    pow: 10,
    dex: 10,
    app: 17,
    siz: 14,
    int: 15,
    edu: 15,
  },
  attribute: { hp: 12, mp: 10, db: "+1D4", san: { value: 52, max: 76 } },
};

const renderPage = () =>
  render(
    <DarkModeProvider>
      <CharaenoChartPage />
    </DarkModeProvider>,
  );

const submitUrl = async (url = SHEET_URL_7TH) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Character Sheet URL"), url);
  await user.click(screen.getByRole("button", { name: "Submit" }));
};

const stubFetch = (summary: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => summary,
  });
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CharaenoChartPage", () => {
  it("取得に成功すると括弧書きを除いた名前でカードを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => valid7thSummary,
      }),
    );

    renderPage();
    await submitUrl();

    expect(await screen.findAllByText("テスト太郎")).not.toHaveLength(0);
  });

  it("APIがエラーステータスを返しても画面が壊れずエラーを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "not found" }),
      }),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderPage();
    await submitUrl();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHARACTER_SHEET_FETCH_FAILED,
    );
    consoleError.mockRestore();
  });

  it("通信そのものが失敗してもエラーを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderPage();
    await submitUrl();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHARACTER_SHEET_FETCH_FAILED,
    );
    consoleError.mockRestore();
  });

  it("想定と違う形のJSONが返ってきてもエラーを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ name: "名前だけある" }),
      }),
    );

    renderPage();
    await submitUrl();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHARACTER_SHEET_UNEXPECTED_FORMAT,
    );
  });

  describe("版の判定", () => {
    it("7版のURLなら7版の取得先を叩く", async () => {
      const fetchMock = stubFetch(valid7thSummary);

      renderPage();
      await submitUrl(SHEET_URL_7TH);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://charaeno.com/api/v1/7th/abc123/summary",
        undefined,
      );
    });

    it("6版のURLなら6版の取得先を叩く", async () => {
      const fetchMock = stubFetch(valid6thSummary);

      renderPage();
      await submitUrl(SHEET_URL_6TH);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://charaeno.com/api/v1/6th/xyz789/summary",
        undefined,
      );
    });

    it("6版のレスポンスでもカードを表示する", async () => {
      stubFetch(valid6thSummary);

      renderPage();
      await submitUrl(SHEET_URL_6TH);

      expect(await screen.findAllByText("六版太郎")).not.toHaveLength(0);
      expect(screen.getByText("『無名祭祀書』")).toBeInTheDocument();
    });

    it("6版のカードには幸運の代わりにダメージ・ボーナスを出す", async () => {
      stubFetch(valid6thSummary);

      renderPage();
      await submitUrl(SHEET_URL_6TH);

      await screen.findAllByText("六版太郎");
      expect(screen.getByText("SAN")).toBeInTheDocument();
      expect(screen.getByText("DB")).toBeInTheDocument();
      expect(screen.getByText("+1D4")).toBeInTheDocument();
      expect(screen.queryByText("幸運")).not.toBeInTheDocument();
    });

    it("対応していない版のURLは取得せず、形式が不正であることを示す", async () => {
      const fetchMock = stubFetch(valid7thSummary);

      renderPage();
      await submitUrl("https://charaeno.com/8th/abc123");

      expect(
        await screen.findByText(CHARACTER_SHEET_URL_INVALID),
      ).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("6版のURLに7版の形のJSONが返ってきたら形式エラーにする", async () => {
      stubFetch(valid7thSummary);

      renderPage();
      await submitUrl(SHEET_URL_6TH);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        CHARACTER_SHEET_UNEXPECTED_FORMAT,
      );
    });
  });

  it("失敗のあとに成功すればエラー表示が消える", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => valid7thSummary,
      });
    vi.stubGlobal("fetch", fetchMock);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderPage();
    await submitUrl();
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    consoleError.mockRestore();
  });
});
