/** mermaid を必要になったときだけ読み込む(テストではこのモジュールを差し替える) */
export const loadMermaid = async () => (await import("mermaid")).default;
