import { DiceLog } from "@/types/DiceLog";

// const reg = /<p>.*?<\/p>/g;
const tabReg = /<span> \[.*\]<\/span>/g;
const nameReg = /<span>.*<\/span>/g;
// const contentReg = / :<span>.*<\/span>/g;
const htmlTagReg =
  /<!DOCTYPE html>|<.*html.*>|<.*head.*>|<.*meta.*>|<title>.*<\/title>|<.*body.*>/g;

const convertDicelog = (htmlString: string) => {
  const result: DiceLog[] = [];
  const html: string[] = htmlString
    .replace(/  /g, "")
    .replace(htmlTagReg, "")
    .replace(/\n/g, "")
    .split(/(?<=<\/p>)/g);

  html.forEach((str) => {
    const dicelogList = str
      .replace(/<p style=\".*">|<\/p>/g, "")
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
        // case contentReg.test(dicelogStr):
        //   dicelog.content = dicelogStr.replace(/ :<span>|<\/span>/g, "");
        //   break;
        default:
          dicelog.content = dicelogStr.replace(/ :<span>|<\/span>/g, "");
          break;
      }
    });
    result.push(dicelog);
  });

  console.log(result);
  return result;
};

export { convertDicelog };
