/**
 * REST-API の GET メソッドを実行する
 *
 * @param {string} url REST-API のURL
 * @param {RequestInit} [option] オプション
 */
export const getFetch = async (url: string, option?: RequestInit) => {
  const json = await fetch(`${url}`, { ...option });
  const res = await json.json();
  return res;
};
