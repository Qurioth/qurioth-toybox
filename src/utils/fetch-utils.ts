/**
 * REST-API の GET メソッドを実行する。
 *
 * 戻り値を `unknown` にしているのは、外部APIのレスポンスは形が保証されないため。
 * 呼び出し側で型ガードを通してから使うこと。
 *
 * @param {string} url REST-API のURL
 * @param {RequestInit} [option] オプション
 * @throws レスポンスがエラーステータスのとき
 */
export const getFetch = async (
  url: string,
  option?: RequestInit,
): Promise<unknown> => {
  const response = await fetch(url, option);

  if (!response.ok) {
    throw new Error(`GET ${url} に失敗しました (HTTP ${response.status})`);
  }

  return await response.json();
};
