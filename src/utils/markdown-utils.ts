export const escapeMarkdownText = (markdown: string) => {
  return markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
