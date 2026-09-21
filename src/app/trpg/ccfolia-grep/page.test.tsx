import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import CcfoliaGrepPage from "./page";

const sampleLogHtml = `
  <p style="margin: 0px;"><span> [メイン]</span><span>キャラクター太郎</span> :<span>1d100&lt;=50 → 23 成功</span></p>
  <p style="margin: 0px;"><span> [メイン]</span><span>キャラクター花子</span> :<span>1d100&lt;=50 → 88 失敗</span></p>
`;

const sampleLogJson = JSON.stringify({
  messages: [
    {
      name: "呼子 星華",
      text: "CC<=30 【回避】",
      type: "text",
      channelName: "main",
      extend: {
        roll: {
          result:
            "(1D100<=30) ボーナス・ペナルティダイス[0] ＞ 88 ＞ 88 ＞ 失敗",
          success: false,
          failure: true,
          critical: false,
          fumble: false,
        },
      },
    },
    {
      name: "",
      text: "[ 呼子 星華 ] SAN : 60 → 59",
      type: "system",
      channelName: "main",
    },
    {
      name: "面高 佑",
      text: "こんにちは",
      type: "text",
      channelName: "other",
    },
  ],
  images: {},
});

/** 成長チェックの確認用。CC コマンドのロール行を JSON メッセージの形で組み立てる */
const rollMessage = (
  name: string,
  text: string,
  tail: string,
  channelName = "main",
) => ({
  name,
  text,
  type: "text",
  channelName,
  extend: {
    roll: {
      result: `(1D100<=50) ボーナス・ペナルティダイス[0] ＞ 10 ＞ ${tail}`,
    },
  },
});

const growthCheckLogJson = JSON.stringify({
  messages: [
    rollMessage("アリス", "CC<=50 【目星】", "10 ＞ レギュラー成功"),
    rollMessage("アリス", "CC<=50 【DEX】", "10 ＞ ハード成功"),
    rollMessage(
      "アリス",
      "CC1<=50 【聞き耳】",
      "10, 20 ＞ 10 ＞ レギュラー成功",
    ),
    rollMessage("アリス", "CC<=50 【図書館】", "70 ＞ 失敗"),
    rollMessage("アリス", "CC<=50 【クトゥルフ神話】", "5 ＞ ハード成功"),
    rollMessage(
      "アリス",
      "CC<=50 【応急手当】",
      "10 ＞ レギュラー成功",
      "other",
    ),
  ],
});

const renderPage = () =>
  render(
    <DarkModeProvider>
      <CcfoliaGrepPage />
    </DarkModeProvider>,
  );

describe("ccfolia-grep page", () => {
  it("ログファイルをアップロード→選択→実行で、フィルタされた結果が表示される", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File([sampleLogHtml], "log.txt", { type: "text/plain" });
    const fileInput = screen.getByLabelText("CCFOLIA LOG FILE");
    await user.upload(fileInput, file);

    const select = await screen.findByRole("combobox", {
      name: "キャラクター名",
    });
    await waitFor(() => expect(select).toHaveTextContent("キャラクター太郎"));

    await user.selectOptions(select, "キャラクター太郎");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("[メイン] キャラクター太郎 1d100<=50 → 23 成功"),
    ).toBeInTheDocument();
    // 花子は選択肢としては残るが、結果テキストには含まれない(太郎でフィルタしたため)
    expect(
      screen.queryByText("[メイン] キャラクター花子 1d100<=50 → 88 失敗"),
    ).not.toBeInTheDocument();
  });

  it("ファイル未選択のままSubmitすると、空の見出し付き結果が表示される(既存の挙動)", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    // dicelog.current・selectName.currentが初期値(空)のままgrepDicelogが実行され、
    // "**" + "**" = "****" という見出しが、ログ抽出結果と成長チェック一覧の両方に表示される
    expect(await screen.findAllByText("****")).toHaveLength(2);
  });

  it("成功度のチェックを外すと、対応する行が結果から除外される", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File([sampleLogHtml], "log.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);
    const select = await screen.findByRole("combobox", {
      name: "キャラクター名",
    });
    await waitFor(() => expect(select).toHaveTextContent("キャラクター太郎"));
    await user.selectOptions(select, "キャラクター太郎");

    // デフォルトでチェック済みの「成功」を外す
    await user.click(screen.getByRole("checkbox", { name: "成功" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // 「成功」を外したので、太郎の行(成功)が結果から除外される
    await waitFor(() =>
      expect(screen.getAllByText("**キャラクター太郎**")).toHaveLength(2),
    );
    expect(
      screen.queryByText("[メイン] キャラクター太郎 1d100<=50 → 23 成功"),
    ).not.toBeInTheDocument();
  });

  it("JSON形式のログをアップロードすると、HTMLと同じ操作でロール行が1行にまとまって表示される", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File([sampleLogJson], "log.json", {
      type: "application/json",
    });
    await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);

    const select = await screen.findByRole("combobox", {
      name: "キャラクター名",
    });
    await waitFor(() => expect(select).toHaveTextContent("呼子 星華"));
    // system 行(名前なし)は選択肢に混ざらない
    expect(select).toHaveTextContent("面高 佑");
    expect(select.querySelectorAll("option")).toHaveLength(3); // placeholder + 2名

    await user.selectOptions(select, "呼子 星華");
    // 初期状態の成功度(クリティカル・成功)では失敗行が出ないので、失敗を追加で選ぶ
    await user.click(screen.getByRole("checkbox", { name: "失敗" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText(
        "[main] 呼子 星華 CC<=30 【回避】 (1D100<=30) ボーナス・ペナルティダイス[0] ＞ 88 ＞ 88 ＞ 失敗",
      ),
    ).toBeInTheDocument();
  });

  it("壊れたJSONをアップロードしても例外にならず、選択肢は空のまま", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File(['{ "messages": ['], "broken.json", {
      type: "application/json",
    });
    await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);

    const select = screen.getByRole("combobox", { name: "キャラクター名" });
    // FileReader は非同期なので、読み込み完了後も option が増えないことを待って確認する
    await waitFor(() =>
      expect(select.querySelectorAll("option")).toHaveLength(1),
    );
  });

  describe("成長チェック", () => {
    const uploadAndSelectAlice = async (
      user: ReturnType<typeof userEvent.setup>,
    ) => {
      const file = new File([growthCheckLogJson], "log.json", {
        type: "application/json",
      });
      await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);
      const select = await screen.findByRole("combobox", {
        name: "キャラクター名",
      });
      await waitFor(() => expect(select).toHaveTextContent("アリス"));
      await user.selectOptions(select, "アリス");
    };

    // 技能名はコピー用の一覧(<p>)と根拠行(<span>)の両方に出るため、一覧側は <p> に絞って確認する
    it("Submitで成長チェック対象の技能だけが一覧に出て、根拠の判定行も表示される", async () => {
      const user = userEvent.setup();
      renderPage();
      await uploadAndSelectAlice(user);

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByText("- 成長技能一覧")).toBeInTheDocument();
      expect(
        screen.getByText("- `【目星】`", { selector: "p" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("- `【応急手当】`", { selector: "p" }),
      ).toBeInTheDocument();
      // 特性値 / ボーナスダイス付き / 失敗のみ / クトゥルフ神話(初期状態は除外)は載らない
      expect(
        screen.queryByText("- `【DEX】`", { selector: "p" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("- `【聞き耳】`", { selector: "p" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("- `【図書館】`", { selector: "p" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("- `【クトゥルフ神話】`", { selector: "p" }),
      ).not.toBeInTheDocument();

      // 根拠行
      expect(screen.getByText("根拠")).toBeInTheDocument();
      expect(
        screen.getByText(
          (_, element) =>
            element?.tagName === "LI" &&
            (element.textContent ?? "").includes(
              "【目星】 — [main] アリス CC<=50 【目星】 (1D100<=50)",
            ),
        ),
      ).toBeInTheDocument();
    });

    it("除外チェックを外すとクトゥルフ神話が一覧に載る", async () => {
      const user = userEvent.setup();
      renderPage();
      await uploadAndSelectAlice(user);

      await user.click(
        screen.getByRole("checkbox", {
          name: "クトゥルフ神話・信用を除外する",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByText("- 成長技能一覧")).toBeInTheDocument();
      expect(
        screen.getByText("- `【クトゥルフ神話】`", { selector: "p" }),
      ).toBeInTheDocument();
    });

    it("成功度のチェックを外しても成長チェック一覧は変わらない", async () => {
      const user = userEvent.setup();
      renderPage();
      await uploadAndSelectAlice(user);

      await user.click(screen.getByRole("checkbox", { name: "成功" }));
      await user.click(screen.getByRole("checkbox", { name: "クリティカル" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(await screen.findByText("- 成長技能一覧")).toBeInTheDocument();
      expect(
        screen.getByText("- `【目星】`", { selector: "p" }),
      ).toBeInTheDocument();
    });
  });

  describe("タブ絞り込み", () => {
    const uploadGrowthCheckLog = async (
      user: ReturnType<typeof userEvent.setup>,
    ) => {
      const file = new File([growthCheckLogJson], "log.json", {
        type: "application/json",
      });
      await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);
      const nameSelect = await screen.findByRole("combobox", {
        name: "キャラクター名",
      });
      await waitFor(() => expect(nameSelect).toHaveTextContent("アリス"));
      return nameSelect;
    };

    it("読み込むとタブの選択肢が並び、初期状態は「すべて」", async () => {
      const user = userEvent.setup();
      renderPage();
      await uploadGrowthCheckLog(user);

      const tabSelect = screen.getByRole("combobox", { name: "タブ" });
      await waitFor(() => expect(tabSelect).toHaveTextContent("other"));
      expect(
        Array.from(tabSelect.querySelectorAll("option")).map((o) => o.value),
      ).toEqual(["すべて", "main", "other"]);
      expect(tabSelect).toHaveValue("すべて");
    });

    it("タブを選ぶと結果と成長チェックの両方がそのタブの行だけになり、名前の選択肢は変わらない", async () => {
      const user = userEvent.setup();
      renderPage();
      const nameSelect = await uploadGrowthCheckLog(user);
      await user.selectOptions(nameSelect, "アリス");

      const tabSelect = screen.getByRole("combobox", { name: "タブ" });
      await waitFor(() => expect(tabSelect).toHaveTextContent("other"));
      await user.selectOptions(tabSelect, "other");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      // 結果: other タブの行だけ
      expect(
        await screen.findByText(
          "[other] アリス CC<=50 【応急手当】 (1D100<=50) ボーナス・ペナルティダイス[0] ＞ 10 ＞ 10 ＞ レギュラー成功",
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "[main] アリス CC<=50 【目星】 (1D100<=50) ボーナス・ペナルティダイス[0] ＞ 10 ＞ 10 ＞ レギュラー成功",
        ),
      ).not.toBeInTheDocument();
      // 成長チェック: other タブの技能だけ
      expect(
        screen.getByText("- `【応急手当】`", { selector: "p" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("- `【目星】`", { selector: "p" }),
      ).not.toBeInTheDocument();
      // 名前の選択肢はタブによらずログ全体(placeholder + アリス)
      expect(nameSelect.querySelectorAll("option")).toHaveLength(2);
    });

    it("別のファイルを読み込み直すとタブの選択が「すべて」に戻る", async () => {
      const user = userEvent.setup();
      renderPage();
      await uploadGrowthCheckLog(user);

      const tabSelect = screen.getByRole("combobox", { name: "タブ" });
      await waitFor(() => expect(tabSelect).toHaveTextContent("other"));
      await user.selectOptions(tabSelect, "other");
      expect(tabSelect).toHaveValue("other");

      const htmlFile = new File([sampleLogHtml], "log.txt", {
        type: "text/plain",
      });
      await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), htmlFile);

      // Select は再マウントされるので取り直す
      await waitFor(() =>
        expect(screen.getByRole("combobox", { name: "タブ" })).toHaveValue(
          "すべて",
        ),
      );
      // HTML の "[メイン]" も括弧なしのタブ名として選択肢に出る
      expect(
        Array.from(
          screen
            .getByRole("combobox", { name: "タブ" })
            .querySelectorAll("option"),
        ).map((o) => o.value),
      ).toEqual(["すべて", "メイン"]);
    });
  });
});
