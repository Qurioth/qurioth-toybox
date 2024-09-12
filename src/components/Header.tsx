import Link from "next/link";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { Moon, Sun } from "lucide-react";

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/">{`Qurioth's Toybox`}</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                HOME
              </Link>
            </li>
            <li>
              <Link href="/trpg" className="hover:underline">
                TRPG
              </Link>
            </li>
            <li>
              <Link href="/other" className="hover:underline">
                OTHER
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          aria-label="ダークモード切り替え"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
