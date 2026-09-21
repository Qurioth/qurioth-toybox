export type DiceLog = {
  /** タブ名。角括弧なし(HTML の "[main]" も JSON の channelName も "main")。出力時に付け直す */
  tab: string;
  name: string;
  content: string;
};
