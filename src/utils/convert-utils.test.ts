import { describe, expect, it } from "vitest";
import { convertDicelog } from "./convert-utils";

/** CCFOLIA のログ1行分のHTMLを組み立てる */
const logHtml = (tab: string, name: string, content: string) =>
  `<p style="margin: 0px;"><span> [${tab}]</span><span>${name}</span> :<span>${content}</span></p>`;

describe("convertDicelog", () => {
  it("CCFOLIAのダイスログHTMLをDiceLog配列に変換する", () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
      <p style="margin: 0px;"><span> [メイン]</span><span>アリス</span> :<span>1d100&lt;=50 → 23 成功</span></p>
      <p style="margin: 0px;"><span> [メイン]</span><span>ボブ</span> :<span>1d100&lt;=50 → 88 失敗</span></p>
    </body></html>`;

    const result = convertDicelog(html);

    // tab は "<span> " と "</span>" のみを除去する実装のため、"[ ]" は残る(既存の挙動)
    expect(result).toEqual([
      { tab: "[メイン]", name: "アリス", content: "1d100&lt;=50 → 23 成功" },
      { tab: "[メイン]", name: "ボブ", content: "1d100&lt;=50 → 88 失敗" },
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
      { tab: "[メイン]", name: "キャロル", content: "1d100&lt;=50 → 5 成功" },
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
      { tab: "[メイン]", name: "あ", content: "1d100&lt;=50 → 1 成功" },
      {
        tab: "[メイン]",
        name: "とてもとても長いキャラクター名前です",
        content: "1d100&lt;=50 → 2 失敗",
      },
      { tab: "[メイン]", name: "い", content: "1d100&lt;=50 → 3 成功" },
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
      { tab: "[メイン]", name: "アリス", content: "1d100&lt;=50 → 1 成功" },
      { tab: "[メイン]", name: "", content: "" },
      { tab: "[メイン]", name: "ボブ", content: "1d100&lt;=50 → 2 失敗" },
    ]);
  });
});
