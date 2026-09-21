import type { DiceLog } from "@/types/DiceLog";

/** Discord のコードブロックに貼る1行。tab は括弧なしで保持しているのでここで付け直す */
const toOutputLine = (log: DiceLog) =>
  log.tab === ""
    ? `${log.name} ${log.content}`
    : `[${log.tab}] ${log.name} ${log.content}`;

/**
 * 指定キャラクターのログを、選択された成功度で絞り込んで取り出す。
 * 成功度が未選択のときは絞り込まず、そのキャラクターの全行を返す。
 * selectTab が空文字のときはタブで絞り込まない(「すべて」)。
 */
const grepDicelog = (
  dicelog: DiceLog[],
  selectName: string,
  checkLevelList: string[],
  selectTab = "",
) => {
  const matchedLogs = dicelog.filter((log) => {
    if (!log.name.includes(selectName)) {
      return false;
    }
    if (selectTab !== "" && log.tab !== selectTab) {
      return false;
    }

    // some() で判定する。level ごとに push すると、1つのログが複数の成功度に
    // 当てはまったときに同じ行が重複して出力されてしまう。
    return (
      checkLevelList.length === 0 ||
      checkLevelList.some((level) => log.content.includes(level))
    );
  });

  return [`**${selectName}**`, "```", ...matchedLogs.map(toOutputLine), "```"];
};

/** ログに登場する名前を重複なくソートして返す */
const grepCharactername = (dicelog: DiceLog[]) => {
  const names = dicelog.map((log) => log.name).filter((name) => name !== "");

  return Array.from(new Set(names)).sort();
};

/** ログに登場するタブ名を重複なくソートして返す */
const grepTabnames = (dicelog: DiceLog[]) => {
  const tabs = dicelog.map((log) => log.tab).filter((tab) => tab !== "");

  return Array.from(new Set(tabs)).sort();
};

export { grepDicelog, grepCharactername, grepTabnames };
