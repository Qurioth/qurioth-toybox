import Link from "next/link";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const siteTitle = "Qurioth's Toybox";

const navigation = [
  { name: "HOME", href: "/" },
  { name: "TRPG", href: "/trpg" },
  { name: "OTHER", href: "/other" },
];

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const themeIcon = isDarkMode ? <Sun size={20} /> : <Moon size={20} />;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-zinc-100/90 backdrop-blur dark:bg-slate-900/90">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex min-w-0 lg:flex-1">
          <h1 className="min-w-0 text-base font-bold leading-6 text-gray-900 dark:text-white lg:text-xl">
            <Link href="/" className="block truncate">
              {siteTitle}
            </Link>
          </h1>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <nav>
            <ul className="flex space-x-4">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:underline">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            aria-label="Toggle dark mode"
          >
            {themeIcon}
          </button>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-200 px-6 py-6 dark:bg-gray-700 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-1.5 min-w-0 p-1.5 text-lg font-bold leading-6 text-gray-900 dark:text-white"
            >
              <span className="block truncate">{siteTitle}</span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-600"
                aria-label="Toggle dark mode"
              >
                {themeIcon}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:underline"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
