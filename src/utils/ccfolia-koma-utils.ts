import type { ScenarioNpc, StatEntry } from "@/types/scenario-npc";

/**
 * CCFOLIA の Clipboard API (beta, v1.19.0) のキャラクターデータ。
 * https://docs.ccfolia.com/developer-api/clipboard-api
 * iconUrl には外部の画像を設定できないため含めない(specs/005-scenario/contracts/ccfolia-koma.md)
 */
export type CharacterClipboardData = {
  kind: "character";
  data: {
    name: string;
    memo?: string;
    initiative?: number;
    status?: { label: string; value: number; max: number }[];
    params?: { label: string; value: string }[];
    commands?: string;
  };
};

/** 副次ステータスのうち、コマのステータス(HP など)にするもの */
const STATUS_LABELS: Record<string, string> = {
  耐久力: "HP",
  "マジック・ポイント": "MP",
  正気度: "SAN",
};

/** 副次ステータスのうち、コマのパラメータにするもの */
const PARAM_LABELS: Record<string, string> = {
  "ダメージ・ボーナス": "DB",
  ビルド: "ビルド",
  移動率: "移動率",
};

const toInteger = (value: string) =>
  /^-?\d+$/.test(value.trim()) ? Number(value) : undefined;

const nonEmpty = <T>(items: T[]) => (items.length > 0 ? items : undefined);

const findValue = (entries: StatEntry[], label: string) =>
  entries.find((entry) => entry.label === label)?.value;

/** NPC データを CCFOLIA のコマ(クリップボードに書き込む JSON)にする */
export const toCcfoliaKoma = (npc: ScenarioNpc): CharacterClipboardData => {
  const [stats] = npc.stats ?? [];
  const abilities = stats?.abilities ?? [];
  const derived = stats?.derived ?? [];

  const status = derived.flatMap((entry) => {
    const label = STATUS_LABELS[entry.label];
    const value = toInteger(entry.value);
    return label && value !== undefined ? [{ label, value, max: value }] : [];
  });

  const params = [
    ...abilities.map(({ label, value }) => ({ label, value })),
    ...derived.flatMap((entry) => {
      const label = PARAM_LABELS[entry.label];
      return label ? [{ label, value: entry.value }] : [];
    }),
  ];

  const san = status.find((entry) => entry.label === "SAN");
  const commands = [
    ...(san ? ["CC<={SAN} 【正気度ロール】"] : []),
    ...abilities
      .filter((entry) => toInteger(entry.value) !== undefined)
      .map((entry) => `CC<={${entry.label}} 【${entry.label}】`),
    ...(npc.skills ?? []).map(
      (skill) => `CC<=${skill.value} 【${skill.name}】`,
    ),
  ];

  const memo = [npc.kana, npc.profile].filter(Boolean).join("\n");
  const dex = findValue(abilities, "DEX");
  const initiative = dex === undefined ? undefined : toInteger(dex);

  const data: CharacterClipboardData["data"] = { name: npc.name };
  if (memo) data.memo = memo;
  if (initiative !== undefined) data.initiative = initiative;
  if (nonEmpty(status)) data.status = status;
  if (nonEmpty(params)) data.params = params;
  if (nonEmpty(commands)) data.commands = commands.join("\n");
  return { kind: "character", data };
};
