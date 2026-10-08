import type { ReactNode } from "react";
import { ChevronRight, ZoomIn } from "lucide-react";
import type { NpcMagic, NpcPortrait, ScenarioNpc } from "@/types/scenario-npc";
import CopyKomaButton from "./CopyKomaButton";
import { decorate } from "./Notation";
import { cn } from "@/utils/class-utils";
import StatGrid from "./StatGrid";
import ZoomableImage from "./ZoomableImage";

const toHeadingId = (npc: ScenarioNpc) =>
  [npc.name, npc.kana && `(${npc.kana})`]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, "-");

/** 立ち絵の顔の辺りを丸く切り抜いたアイコン。選ぶと立ち絵の全体を開く */
const PortraitIcon = ({
  portrait,
  name,
}: {
  portrait: NpcPortrait;
  name: string;
}) => {
  const { face } = portrait;
  const alt = portrait.alt ?? name;
  return (
    <ZoomableImage
      src={portrait.src}
      alt={alt}
      fit
      buttonClassName="relative size-16 shrink-0 sm:size-[5.5rem]"
    >
      <span className="relative block size-full overflow-hidden rounded-full border-2 border-[--scenario-border] bg-white dark:border-[--scenario-border-dark]">
        {face ? (
          // 顔の中心(x, y)をアイコンの中心に合わせ、画像の width% がアイコンの幅に収まるよう広げる
          // biome-ignore lint/performance/noImgElement: image size is unknown at build time
          <img
            src={portrait.src}
            alt={alt}
            className="absolute left-1/2 top-1/2 h-auto max-w-none"
            style={{
              width: `${10000 / (face.width ?? 100)}%`,
              transform: `translate(-${face.x ?? 50}%, -${face.y ?? 20}%)`,
            }}
          />
        ) : (
          // 既定は画像の幅いっぱいを映し、上から少し下を見せる(全身の立ち絵なら頭から胸元)
          // biome-ignore lint/performance/noImgElement: image size is unknown at build time
          <img
            src={portrait.src}
            alt={alt}
            className="size-full object-cover object-[50%_4%]"
          />
        )}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full border border-[--scenario-border] bg-[--scenario-surface] text-zinc-500 dark:border-[--scenario-border-dark] dark:bg-slate-900 dark:text-slate-400">
        <ZoomIn className="size-3.5" aria-hidden="true" />
      </span>
    </ZoomableImage>
  );
};

/** 出典のバッジ。既刊の書名、なければ本シナリオ独自であることを示す */
const SourceBadge = ({ source }: { source?: string }) =>
  source ? (
    <span className="whitespace-nowrap rounded border border-[--scenario-border] px-1.5 text-xs text-zinc-500 dark:border-[--scenario-border-dark] dark:text-slate-400">
      {source}
    </span>
  ) : (
    <span className="whitespace-nowrap rounded bg-[--scenario-accent] px-1.5 text-xs font-bold text-white dark:bg-[--scenario-accent-dark] dark:text-zinc-900">
      本シナリオ独自
    </span>
  );

/** 呪文・アーティファクト 1 つ。説明があるものは名前の行を開くと出す */
const hasDetails = (item: NpcMagic) =>
  item.details !== undefined && item.details.length > 0;

const MagicItem = ({
  item,
  label,
  indent,
}: {
  item: NpcMagic;
  label: string;
  /** 同じ欄に開閉できる行があるとき、矢印の幅だけ字下げして名前の位置を揃える */
  indent: boolean;
}) => {
  const heading = (
    <>
      <span>{decorate(label)}</span>
      <SourceBadge source={item.source} />
    </>
  );
  if (!item.details || !hasDetails(item)) {
    return (
      <li
        className={cn("flex flex-wrap items-center gap-x-2", indent && "pl-6")}
      >
        {heading}
      </li>
    );
  }
  return (
    <li>
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-90 motion-reduce:transition-none dark:text-slate-400"
            aria-hidden="true"
          />
          {heading}
        </summary>
        <dl className="ml-6 mt-1 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5">
          {item.details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-zinc-500 dark:text-slate-400">
                {detail.label}
              </dt>
              <dd className="min-w-0">{decorate(detail.value)}</dd>
            </div>
          ))}
        </dl>
      </details>
    </li>
  );
};

/** 呪文欄・アーティファクト欄 */
const MagicSection = ({
  title,
  items,
  toLabel,
  note,
}: {
  title: string;
  items?: NpcMagic[];
  toLabel: (name: string) => string;
  note?: string;
}) =>
  (items && items.length > 0) || note ? (
    <section className="border-t border-zinc-200 pt-3 dark:border-slate-700">
      <h4 className="mb-1 font-bold text-zinc-900 dark:text-white">{title}</h4>
      <ul className="flex flex-col gap-1 text-sm text-zinc-800 dark:text-slate-100">
        {items?.map((item) => (
          <MagicItem
            key={item.name}
            item={item}
            label={toLabel(item.name)}
            indent={items.some(hasDetails)}
          />
        ))}
      </ul>
      {note && (
        <p
          className={cn(
            "mt-1 text-sm text-zinc-500 dark:text-slate-400",
            items?.some(hasDetails) && "pl-6",
          )}
        >
          {note}
        </p>
      )}
    </section>
  ) : null;

/**
 * NPC・神話生物のカード(specs/005-scenario/contracts/mdx-page.md 3 章)。
 * 名前・立ち絵・能力値・技能はデータから、プロフィールやセリフ例などの自由な記述は子要素から出す。
 * 立ち絵は名前の左に丸いアイコンで出し、能力値の有無にかかわらずどの人物も同じ見え方にする
 */
const NpcCard = ({
  npc,
  children,
}: {
  npc: ScenarioNpc;
  children?: ReactNode;
}) => (
  <article
    aria-label={npc.name}
    className="not-prose my-6 flex flex-col gap-3 rounded-lg border border-[--scenario-border] bg-[--scenario-surface] p-4 shadow-sm dark:border-[--scenario-border-dark] dark:bg-[--scenario-surface-dark]"
  >
    <div className="flex items-center gap-4">
      {npc.portrait && <PortraitIcon portrait={npc.portrait} name={npc.name} />}
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h3
          id={toHeadingId(npc)}
          data-toc
          data-toc-label={npc.name}
          className="scroll-mt-24 text-xl font-bold text-zinc-950 dark:text-white"
        >
          {npc.name}
          {npc.kana && (
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-slate-400">
              ({npc.kana})
            </span>
          )}
        </h3>
        <CopyKomaButton npc={npc} />
      </div>
    </div>
    {npc.stats?.map((stats, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: stat blocks are static
      <StatGrid key={index} stats={stats} />
    ))}
    {npc.skills && npc.skills.length > 0 && (
      <section className="border-t border-zinc-200 pt-3 dark:border-slate-700">
        <h4 className="mb-1 font-bold text-zinc-900 dark:text-white">技能</h4>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-800 dark:text-slate-100">
          {npc.skills.map((skill) => (
            <li key={`${skill.name}-${skill.value}`}>
              {skill.name}: {skill.value}%
              {skill.note && (
                <span className="ml-1 text-zinc-500 dark:text-slate-400">
                  {skill.note}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    )}
    <MagicSection
      title="呪文"
      items={npc.spells}
      toLabel={(name) => `《${name}》`}
      note={npc.spellNote}
    />
    <MagicSection
      title="アーティファクト"
      items={npc.artifacts}
      toLabel={(name) => `『${name}』`}
    />
    {children && (
      // 外枠の not-prose で prose の余白・箇条書きの記号が消えるため、ここで付け直す
      <div className="prose dark:prose-dark max-w-none border-t border-zinc-200 pt-3 dark:border-slate-700 [&>*+*]:mt-3 [&_li+li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    )}
  </article>
);

export default NpcCard;
