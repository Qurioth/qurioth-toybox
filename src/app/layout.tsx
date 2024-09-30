import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/dark-mode-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Qurioth's Toybox",
  description:
    "In [Qurioth's Toybox], Qurioth freely publishes and creates tools and scenarios related to Table Talk RPGs. If you have time to translate this English text, it would be more useful to study for one of the qualifications!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-100 dark:bg-slate-900`}
      >
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  );
}
