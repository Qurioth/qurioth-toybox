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
 * HTMLエスケープを元の文字に戻す。
 * &amp; を先に戻すと "&amp;lt;" が "<" まで二重に復元されてしまうため、最後に処理する。
 */
const decodeHtmlEntities = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * content の span の中身を1行のプレーンテキストに整える。
 *
 * CCFOLIA は改行を <br> で書き出すが、grep結果は Discord のコードブロックに貼るため
 * 1ログ=1行に収めたい。そこで <br> は " / " 区切りに置き換える。
 * 各断片の前後の空白(段落先頭の全角スペースや行末の余白)も落とす。
 *
 * 区切りの分割はエスケープを戻す前に行う。先に戻すと、利用者が本文に打った
 * "&lt;br&gt;" という文字列まで改行として扱ってしまうため。
 */
const toSingleLineContent = (text: string) =>
  joinLines(text.split(/<br\s*\/?>/).map(decodeHtmlEntities));

/** 断片の前後空白を落とし、空断片を捨てて " / " でつなぐ(HTML/JSON 共通) */
const joinLines = (parts: string[]) =>
  parts
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
          // tab は角括弧を外して保持する(JSON の channelName と揃えるため)。
          // 出力行では grep-utils 側で [tab] と付け直す。
          dicelog.tab = dicelogStr.replace(/<span> \[|\]<\/span>/g, "");
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

/** CCFOLIA の JSON 書き出しのうち、この画面が読む項目だけを表した型 */
type CcfoliaJsonMessage = {
  name?: unknown;
  text?: unknown;
  type?: unknown;
  channelName?: unknown;
  extend?: { roll?: { result?: unknown } };
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * CCFOLIA の JSON 書き出し(`{ messages: [...] }` を JSON.parse したもの)を DiceLog に変換する。
 *
 * ロール行はコマンド(text)と結果(extend.roll.result)が別項目に分かれているので、
 * HTML 書き出しと同じ「コマンド 結果」の1行にまとめる。以降の処理(成功度の絞り込み、
 * 成長チェック)は HTML/JSON を区別せず content の文字列だけを見る。
 * type が "system" の行(SAN 増減の通知など)は発言者を持たないので生成しない。
 */
const convertJsonDicelog = (json: unknown): DiceLog[] => {
  const messages = (json as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message): message is CcfoliaJsonMessage =>
        typeof message === "object" &&
        message !== null &&
        (message as CcfoliaJsonMessage).type !== "system",
    )
    .map((message) => {
      const text = joinLines(asString(message.text).split("\n"));
      const rollResult = asString(message.extend?.roll?.result);

      return {
        tab: asString(message.channelName),
        name: asString(message.name),
        content: rollResult === "" ? text : `${text} ${rollResult}`,
      };
    });
};

/**
 * ファイルの中身から書き出し形式(HTML / JSON)を判別して DiceLog に変換する。
 * 拡張子は見ない(既存の利用では .txt で HTML を渡している)。
 * "{" で始まるのに JSON として読めない・messages がない場合は「解釈できない」として空にする。
 */
const parseDicelog = (raw: string): DiceLog[] => {
  if (!raw.trim().startsWith("{")) {
    return convertDicelog(raw);
  }

  try {
    return convertJsonDicelog(JSON.parse(raw));
  } catch {
    return [];
  }
};

export { convertDicelog, convertJsonDicelog, parseDicelog };
