"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * メディアクエリの一致状態を購読する。
 *
 * サーバ側では判定できないため、常に false を返す。CSSで出し分けている要素の
 * 見た目をこのフックで切り替えると、ハイドレーション後にちらつく点に注意。
 * 「表示されていない側のコンポーネントをマウントしない」といった、
 * レイアウトに影響しない用途に使うこと。
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);

      mediaQueryList.addEventListener("change", onStoreChange);

      return () => {
        mediaQueryList.removeEventListener("change", onStoreChange);
      };
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};
