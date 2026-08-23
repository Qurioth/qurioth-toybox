import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";

/**
 * matchMedia の差し替え。change を任意のタイミングで発火できるようにする。
 * (jsdom も、プレビューのビューポート変更も change を発火しないため)
 */
const stubMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<() => void>();
  let matches = initialMatches;

  vi.stubGlobal("matchMedia", (media: string) => ({
    get matches() {
      return matches;
    },
    media,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));

  return {
    setMatches: (next: boolean) => {
      matches = next;
      for (const listener of listeners) {
        listener();
      }
    },
    listenerCount: () => listeners.size,
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("初期状態の一致結果を返す", () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("changeが発火すると再描画される", () => {
    const mql = stubMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      mql.setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("アンマウントで購読を解除する", () => {
    const mql = stubMatchMedia(false);

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(mql.listenerCount()).toBe(1);

    unmount();

    expect(mql.listenerCount()).toBe(0);
  });
});
