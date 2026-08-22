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

const convertDicelog = (htmlString: string) => {
  const result: DiceLog[] = [];
  const html: string[] = htmlString
    .replace(/ {2}/g, "")
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
          dicelog.content = dicelogStr.replace(/ :<span>|<\/span>/g, "");
          break;
      }
    });
    result.push(dicelog);
  });

  return result;
};

export { convertDicelog };
