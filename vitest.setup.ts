import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    fill: _fill,
    loader: _loader,
    ...props
  }: Record<string, unknown>) => React.createElement("img", props),
}));

// globals: false のため、Testing Libraryの自動クリーンアップが効かない。
// レンダリング結果がテスト間で残留しないよう明示的にクリーンアップする。
afterEach(() => {
  cleanup();
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// biome-ignore lint/suspicious/noExplicitAny: jsdom has no ResizeObserver implementation
(globalThis as any).ResizeObserver = ResizeObserverStub;

// jsdomはwindow.matchMediaを実装していない(DarkModeContextが依存する)
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
