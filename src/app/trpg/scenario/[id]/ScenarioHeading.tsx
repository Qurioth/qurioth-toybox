import { twMerge } from "tailwind-merge";
import type { Heading } from "@/utils/scenario-structure-utils";

const TAGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

const SIZES = {
  2: "text-2xl border-b border-zinc-300 pb-2 dark:border-slate-700",
  3: "text-xl",
  4: "text-lg",
} as const;

/** 目次から移動できる見出し。末尾の補足(読み仮名など)は小さく添える */
const ScenarioHeading = ({
  heading,
  className,
}: {
  heading: Heading;
  className?: string;
}) => {
  const depth = Math.min(Math.max(heading.depth, 2), 4) as 2 | 3 | 4;
  const Tag = TAGS[depth];

  return (
    <Tag
      id={heading.id}
      className={twMerge(
        "scroll-mt-24 font-bold text-zinc-950 dark:text-white",
        SIZES[depth],
        className,
      )}
    >
      {heading.text}
      {heading.kana && (
        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-slate-400">
          ({heading.kana})
        </span>
      )}
    </Tag>
  );
};

export default ScenarioHeading;
