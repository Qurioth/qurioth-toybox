import { cn } from "@/utils/class-utils";
import type { ComponentProps } from "react";

/**
 * 別ページへ誘導する丸いリンクボタン。
 * hover の色は Tailwind のパレットに無い値なので、ここ1箇所に閉じ込めている。
 */
const PillLink = ({ className, ...props }: ComponentProps<"a">) => (
  <a
    className={cn(
      "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300",
      className,
    )}
    {...props}
  />
);

export default PillLink;
