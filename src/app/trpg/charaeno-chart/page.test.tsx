import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHARACTER_SHEET_FETCH_FAILED,
  CHARACTER_SHEET_UNEXPECTED_FORMAT,
  CHARACTER_SHEET_URL_INVALID,
  IACHARA_FILE_NOT_SELECTED,
  IACHARA_TEXT_UNEXPECTED_FORMAT,
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

  describe("いあきゃらのテキストファイル", () => {
    const iacharaText = `いあきゃらテキスト 7版 v2.0.1
【基本情報】
名前: 文字太郎 (もじたろう)

【能力値】
        現在値  能力値  増加分  一時的
STR         65      65       0       0
CON         50      50       0       0
POW         60      60       0       0
DEX         40      40       0       0
APP         55      55       0       0
SIZ         70      70       0       0
INT         80      80       0       0
EDU         80      80       0       0
HP          12      12       0       0
MP          13      13       0       0
正気度      60      60       0       0
幸運        85      85       0       0

正気度 64 / 88

【技能値】
技能名                  合計  初期値   職業P   興味P  成長分  その他
目星                      73      25      40       0       8       0

【メモ】
いあきゃらのメモ
`;

    const switchToFile = () =>
      userEvent.setup().click(screen.getByRole("button", { name: "File" }));

    const uploadText = async (text: string) => {
      const file = new File([text], "character.txt", { type: "text/plain" });
      await userEvent
        .setup()
        .upload(screen.getByLabelText("Iachara Text File (7th)"), file);
    };

    it("最初はURLの入力欄だけを出し、切り替えるとファイルの選択欄に入れ替わる", async () => {
      renderPage();

      expect(screen.getByLabelText("Character Sheet URL")).toBeInTheDocument();
      expect(
        screen.queryByLabelText("Iachara Text File (7th)"),
      ).not.toBeInTheDocument();

      await switchToFile();

      expect(
        screen.getByLabelText("Iachara Text File (7th)"),
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText("Character Sheet URL"),
      ).not.toBeInTheDocument();

      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "URL" }));

      expect(screen.getByLabelText("Character Sheet URL")).toBeInTheDocument();
    });

    it("ファイルを選ぶと、URLを入力せずにカードを表示する", async () => {
      const fetchMock = stubFetch(valid7thSummary);

      renderPage();
      await switchToFile();
      await uploadText(iacharaText);

      expect(await screen.findAllByText("文字太郎")).not.toHaveLength(0);
      expect(screen.getByText("64")).toBeInTheDocument();
      expect(screen.getByText("85")).toBeInTheDocument();
      expect(screen.getByText("目星")).toBeInTheDocument();
      expect(screen.getByText("いあきゃらのメモ")).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("ファイルを選ばずに Submit するとファイルを選ぶよう促す", async () => {
      renderPage();
      await switchToFile();
      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        IACHARA_FILE_NOT_SELECTED,
      );
    });

    it("切り替えても表示中のカードは残る", async () => {
      renderPage();
      await switchToFile();
      await uploadText(iacharaText);
      await screen.findAllByText("文字太郎");

      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "URL" }));

      expect(screen.getAllByText("文字太郎")).not.toHaveLength(0);
    });

    it("いあきゃらの7版のテキストでなければエラーを表示し、カードを消す", async () => {
      renderPage();
      await switchToFile();
      await uploadText(iacharaText);
      await screen.findAllByText("文字太郎");

      await uploadText("ただのテキスト");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        IACHARA_TEXT_UNEXPECTED_FORMAT,
      );
      expect(screen.queryByText("文字太郎")).not.toBeInTheDocument();
    });
  });
});
