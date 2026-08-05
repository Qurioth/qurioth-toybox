import { describe, expect, it } from "vitest";
import { convertDicelog } from "./convert-utils";

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
});
