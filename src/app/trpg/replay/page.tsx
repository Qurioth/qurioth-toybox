"use client";

import Template from "@/components/Template";
import YouTubeEmbed from "@/components/YoutubeEmbed";
import {
  ReplayCharacter,
  ReplayVideo,
  replayVideos,
} from "@/data/youtube/trpg/youtube-id";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const loadSize = 10;
const emptyText = "未設定";

const displayText = (value?: string) => {
  return value && value.trim().length > 0 ? value : emptyText;
};

const hasText = (value?: string) => {
  return Boolean(value && value.trim().length > 0);
};

const normalizePassword = (value: string) => {
  return value.trim().toLocaleLowerCase();
};

const hasPasswords = (passwords?: string[]) => {
  return Boolean(passwords && passwords.length > 0);
};

const displayCharacters = (characters?: ReplayCharacter[]) => {
  if (!characters || characters.length === 0) {
    return emptyText;
  }

  return characters
    .map(({ characterName, playerName }) => {
      if (!playerName) {
        return characterName;
      }

      return `${characterName}（${playerName}）`;
    })
    .join(" / ");
};

const ReplayCard = ({ replay }: { replay: ReplayVideo }) => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!hasPasswords(replay.passwords));
  const [errorMessage, setErrorMessage] = useState("");
  const shouldShowProtectedContent =
    !hasPasswords(replay.passwords) || isUnlocked;

  const onSubmitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPassword = normalizePassword(password);
    const canUnlock = replay.passwords?.some((validPassword) => {
      return normalizePassword(validPassword) === normalizedPassword;
    });

    if (canUnlock) {
      setIsUnlocked(true);
      setErrorMessage("");
      return;
    }

    setErrorMessage("パスワードが一致しません。");
  };

  return (
    <article className="w-full max-w-lg overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {shouldShowProtectedContent ? (
        <YouTubeEmbed videoId={replay.videoId} />
      ) : (
        <div className="flex aspect-video w-full flex-col justify-center gap-4 bg-zinc-100 p-6 text-zinc-800 dark:bg-slate-900 dark:text-zinc-100">
          <div>
            <p className="text-base font-bold">限定公開リプレイ</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              この動画を表示するには、シナリオ内に出現した神話生物の名前を入力してください。
            </p>
          </div>
          <form className="flex flex-col gap-3" onSubmit={onSubmitPassword}>
            <label className="text-sm font-semibold" htmlFor={replay.videoId}>
              パスワード
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={replay.videoId}
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                表示
              </button>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-300">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 text-sm text-zinc-800 dark:text-zinc-100">
        <div>
          <h2 className="text-lg font-bold">
            {displayText(replay.scenarioName)}
          </h2>
        </div>

        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2">
          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            TRPGシステム
          </dt>
          <dd>{displayText(replay.trpgSystemName)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            キャラクター
          </dt>
          <dd>{displayCharacters(replay.characters)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">GM</dt>
          <dd>{displayText(replay.gmName)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            実施日
          </dt>
          <dd>{displayText(replay.playedAt)}</dd>

          {hasText(replay.note) && (
            <>
              <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
                備考
              </dt>
              <dd>{replay.note}</dd>
            </>
          )}
        </dl>
      </div>
    </article>
  );
};

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(loadSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < replayVideos.length;
  const visibleReplayVideos = useMemo(() => {
    return replayVideos.slice(0, visibleCount);
  }, [visibleCount]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) => {
            return Math.min(currentCount + loadSize, replayVideos.length);
          });
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  return (
    <Template>
      <div className="mx-auto grid w-full max-w-[66rem] grid-cols-1 justify-items-center gap-8 lg:grid-cols-2">
        {visibleReplayVideos.map((replay) => {
          return <ReplayCard key={replay.videoId} replay={replay} />;
        })}
      </div>
      <div
        ref={loadMoreRef}
        className="mt-8 h-8 text-sm text-zinc-500 dark:text-zinc-400"
        aria-live="polite"
      >
        {hasMore ? "読み込み中..." : "すべて表示しました"}
      </div>
    </Template>
  );
}
