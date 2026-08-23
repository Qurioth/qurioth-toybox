import { cn } from "@/utils/class-utils";
import type { ComponentProps } from "react";

/**
 * フォームの実行ボタン。
 * 幅など呼び出し側で変えたいものは className で渡す(tailwind-merge で後勝ちになる)。
 */
const SubmitButton = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    type="submit"
    className={cn(
      "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
      className,
    )}
    {...props}
  />
);

export default SubmitButton;
