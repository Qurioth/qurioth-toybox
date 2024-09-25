import { DiceLog } from "@/types/DiceLog";

const grepDicelog = (
  dicelog: DiceLog[],
  selectName: string,
  checkLevelList: string[]
) => {
  const writeTextList = [];
  writeTextList.push(`**${selectName}**`);
  writeTextList.push("```");
  dicelog.forEach((log) => {
    if (log.name.indexOf(selectName) > -1) {
      if (checkLevelList.length > 0) {
        checkLevelList.forEach((level) => {
          if (log.content.indexOf(level) > -1) {
            writeTextList.push(
              `${log.tab} ${log.name} ${log.content.replace(/&lt;/g, "<")}`
            );
          }
        });
      } else {
        writeTextList.push(
          `${log.tab} ${log.name} ${log.content.replace(/&lt;/g, "<")}`
        );
      }
    }
  });
  writeTextList.push("```");

  return writeTextList;
};

const grepCharactername = (dicelog: DiceLog[]) => {
  const nameList: string[] = [];
  dicelog.forEach((log) => {
    if (log.name && log.name) {
      nameList.push(log.name);
    }
  });

  const nameMap = Array.from(new Set(nameList)).sort();

  return nameMap;
};

export { grepDicelog, grepCharactername };
