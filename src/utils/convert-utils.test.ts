import { describe, expect, it } from "vitest";
import { convertDicelog } from "./convert-utils";

/** CCFOLIA のログ1行分のHTMLを組み立てる */
const logHtml = (tab: string, name: string, content: string) =>
  `<p style="margin: 0px;"><span> [${tab}]</span><span>${name}</span> :<span>${content}</span></p>`;

/**
 * CCFOLIA が実際に書き出す形。インデント付きで整形され、contentは独立した行に置かれる。
 * styleは色指定で、行末に空白が残ることがある。
 */
const exportedLogHtml = (tab: string, name: string, content: string) =>
  `<p style="color:#888888;">
  <span> [${tab}]</span>
  <span>${name}</span> :
  <span>
    ${content}
  </span>
</p>
`;

describe("convertDicelog", () => {
  it("CCFOLIAのダイスログHTMLをDiceLog配列に変換する", () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
      <p style="margin: 0px;"><span> [メイン]</span><span>アリス</span> :<span>1d100&lt;=50 → 23 成功</span></p>
      <p style="margin: 0px;"><span> [メイン]</span><span>ボブ</span> :<span>1d100&lt;=50 → 88 失敗</span></p>
    </body></html>`;

    const result = convertDicelog(html);

    // tab は "<span> " と "</span>" のみを除去する実装のため、"[ ]" は残る(既存の挙動)
    // content の "&lt;" はここで元の "<" に戻す
    expect(result).toEqual([
      { tab: "[メイン]", name: "アリス", content: "1d100<=50 → 23 成功" },
      { tab: "[メイン]", name: "ボブ", content: "1d100<=50 → 88 失敗" },
    ]);
  });

  it("同じ関数を続けて呼び出しても結果が変わらない", () => {
    const html = `<p style="margin: 0px;"><span> [メイン]</span><span>キャロル</span> :<span>1d100&lt;=50 → 5 成功</span></p>`;

    // tab/nameの判定に使う正規表現がモジュールスコープでgフラグ付きのため、
    // 複数回呼び出した際にlastIndexの状態が残って結果がぶれないことを確認する
    const first = convertDicelog(html);
    const second = convertDicelog(html);

    expect(second).toEqual(first);
    expect(second).toEqual([
      { tab: "[メイン]", name: "キャロル", content: "1d100<=50 → 5 成功" },
    ]);
  });

  it("空文字列を渡すと空のDiceLogを1件返す", () => {
    expect(convertDicelog("")).toEqual([{ tab: "", name: "", content: "" }]);
  });

  it("キャラクター名が1文字でもnameとcontentを取り違えない", () => {
    const html = [
      logHtml("メイン", "あ", "1d100&lt;=50 → 1 成功"),
      logHtml(
        "メイン",
        "とてもとても長いキャラクター名前です",
        "1d100&lt;=50 → 2 失敗",
      ),
      logHtml("メイン", "い", "1d100&lt;=50 → 3 成功"),
    ].join("");

    expect(convertDicelog(html)).toEqual([
      { tab: "[メイン]", name: "あ", content: "1d100<=50 → 1 成功" },
      {
        tab: "[メイン]",
        name: "とてもとても長いキャラクター名前です",
        content: "1d100<=50 → 2 失敗",
      },
      { tab: "[メイン]", name: "い", content: "1d100<=50 → 3 成功" },
    ]);
  });

  it("タブ名の長さが行ごとに違ってもタブを取り違えない", () => {
    const html = [
      logHtml("メイン", "アリス", "1d100&lt;=50 → 1 成功"),
      logHtml("とても長いタブ名です", "ボブ", "1d100&lt;=50 → 2 失敗"),
      logHtml("A", "キャロル", "1d100&lt;=50 → 3 成功"),
    ].join("");

    expect(convertDicelog(html).map((log) => log.tab)).toEqual([
      "[メイン]",
      "[とても長いタブ名です]",
      "[A]",
    ]);
  });

  it("spanがタブだけの行が混ざっても後続の行が壊れない", () => {
    const html = [
      logHtml("メイン", "アリス", "1d100&lt;=50 → 1 成功"),
      `<p style="margin: 0px;"><span> [メイン]</span></p>`,
      logHtml("メイン", "ボブ", "1d100&lt;=50 → 2 失敗"),
    ].join("");

    expect(convertDicelog(html)).toEqual([
      { tab: "[メイン]", name: "アリス", content: "1d100<=50 → 1 成功" },
      { tab: "[メイン]", name: "", content: "" },
      { tab: "[メイン]", name: "ボブ", content: "1d100<=50 → 2 失敗" },
    ]);
  });

  describe("CCFOLIAが書き出す整形済みHTML", () => {
    it("インデントを除去しつつ本文中の連続スペースは残す", () => {
      const html = exportedLogHtml("main", "喪造（モゾウ）", "1D6  (1D6) ＞ 4");

      expect(convertDicelog(html)).toEqual([
        { tab: "[main]", name: "喪造（モゾウ）", content: "1D6  (1D6) ＞ 4" },
      ]);
    });

    it("本文中の全角スペースを半角に潰さない", () => {
      const html = exportedLogHtml(
        "main",
        "恩田 恵",
        "CC&lt;=65　【CON】 (1D100&lt;=65) ＞ 36 ＞ レギュラー成功",
      );

      expect(convertDicelog(html)[0].content).toBe(
        "CC<=65　【CON】 (1D100<=65) ＞ 36 ＞ レギュラー成功",
      );
    });

    it("行末の空白を除去する", () => {
      const html = exportedLogHtml("main", "アリス", "1D6 (1D6) ＞ 4   ");

      expect(convertDicelog(html)[0].content).toBe("1D6 (1D6) ＞ 4");
    });

    it("<br>を ' / ' 区切りに変換して1行にまとめる", () => {
      const html = exportedLogHtml(
        "other",
        "川崎風右衛門鳴時",
        "アオイモン<br>ウツベシ<br>トクガワ ",
      );

      expect(convertDicelog(html)[0].content).toBe(
        "アオイモン / ウツベシ / トクガワ",
      );
    });

    it("先頭や連続した<br>で区切りが余分に増えない", () => {
      const html = exportedLogHtml(
        "main",
        "◆横井治からの手紙",
        "<br><br>前略　突然の手紙で驚いていることでしょう。<br>　これまで連絡もせず申し訳ございません。<br>",
      );

      expect(convertDicelog(html)[0].content).toBe(
        "前略　突然の手紙で驚いていることでしょう。 / これまで連絡もせず申し訳ございません。",
      );
    });

    it("HTMLエスケープを元の文字に戻す", () => {
      const html = exportedLogHtml(
        "main",
        "アリス",
        "CC&lt;=50 &quot;A&amp;B&quot; &gt;&gt; &#39;ok&#39;",
      );

      expect(convertDicelog(html)[0].content).toBe("CC<=50 \"A&B\" >> 'ok'");
    });

    it("本文に打たれた &lt;br&gt; は区切りではなく文字として扱う", () => {
      const html = exportedLogHtml(
        "other",
        "アリス",
        "改行は &lt;br&gt; と書く",
      );

      expect(convertDicelog(html)[0].content).toBe("改行は <br> と書く");
    });

    it("複数エントリを続けて変換できる", () => {
      const html = [
        exportedLogHtml(
          "main",
          "アリス",
          "CC&lt;=75 (1D100&lt;=75) ＞ 24 ＞ ハード成功",
        ),
        exportedLogHtml("秘匿(リアン)", "ボブ", "1D8+2  (1D8+2) ＞ 8"),
        exportedLogHtml("info", "KP", "・浅草裏長屋<br>・非人小屋"),
      ].join("\n");

      expect(convertDicelog(html)).toEqual([
        {
          tab: "[main]",
          name: "アリス",
          content: "CC<=75 (1D100<=75) ＞ 24 ＞ ハード成功",
        },
        { tab: "[秘匿(リアン)]", name: "ボブ", content: "1D8+2  (1D8+2) ＞ 8" },
        { tab: "[info]", name: "KP", content: "・浅草裏長屋 / ・非人小屋" },
      ]);
    });
  });
});
