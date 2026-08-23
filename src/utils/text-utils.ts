/** 全角半角や大文字小文字の違いを吸収して比較できる形にする */
export const normalizeSearchText = (value: string) =>
  value.normalize("NFKC").trim().toLocaleLowerCase();

/**
 * 空白区切りの語がすべて対象文字列に含まれるか(AND検索)。
 * クエリが空なら絞り込まない扱いで true を返す。
 */
export const matchesAllWords = (targetText: string, query: string) => {
  const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return true;
  }

  const normalizedTarget = normalizeSearchText(targetText);

  return words.every((word) => normalizedTarget.includes(word));
};
