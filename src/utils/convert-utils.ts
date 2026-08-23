import type { DiceLog } from "@/types/DiceLog";

// 1行を span 単位に分割したあと、どの span なのかを形で判別する。
// gフラグは付けないこと。test() が lastIndex を持ち越し、直前に何を判定したかで
// 結果が変わってしまうため(キャラクター名が短い行で name と content が入れ替わる)。
// また前後をアンカーで固定しないと、nameReg が content の span (" :<span>...")にも
// マッチしてしまう。
const tabReg = /^<span> \[.*\]<\/span>$/;
const nameReg = /^<span>.*<\/span>$/;
const htmlTagReg =
  /<!DOCTYPE html>|<.*html.*>|<.*head.*>|<.*meta.*>|<title>.*<\/title>|<.*body.*>/g;

/**
 * content の span の中身を1行のテキストに整える。
 *
 * CCFOLIA は改行を <br> で書き出すが、grep結果は Discord のコードブロックに貼るため
 * 1ログ=1行に収めたい。そこで <br> は " / " 区切りに置き換える。
 * 各断片の前後の空白(段落先頭の全角スペースや行末の余白)も落とす。
 */
const toSingleLineContent = (text: string) =>
  text
    .split(/<br\s*\/?>/)
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join(" / ");

const convertDicelog = (htmlString: string) => {
  const result: DiceLog[] = [];
  const html: string[] = htmlString
    // 行頭のインデントだけを落とす。/ {2}/g で全体から2連続スペースを消すと
    // "1D6  (1D6)" のような本文中の空白まで壊れてしまう。
    .replace(/^[ \t]+/gm, "")
    .replace(htmlTagReg, "")
    .replace(/\n/g, "")
    .split(/(?<=<\/p>)/g);

  html.forEach((str) => {
    const dicelogList = str
      .replace(/<p style=".*">|<\/p>/g, "")
      .split(/(?<=<\/span>)/g);
    const dicelog: DiceLog = { tab: "", name: "", content: "" };

    dicelogList.forEach((dicelogStr) => {
      switch (true) {
        case tabReg.test(dicelogStr):
          dicelog.tab = dicelogStr.replace(/<span> |<\/span>/g, "");
          break;
        case nameReg.test(dicelogStr):
          dicelog.name = dicelogStr.replace(/<span>|<\/span>/g, "");
          break;
        default:
          dicelog.content = toSingleLineContent(
            dicelogStr.replace(/ :<span>|<\/span>/g, ""),
          );
          break;
      }
    });
    result.push(dicelog);
  });

  return result;
};

export { convertDicelog };
