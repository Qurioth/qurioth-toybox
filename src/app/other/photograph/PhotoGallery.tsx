"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/data/photograph/album-types";
import {
  justifyRows,
  photoSrcSet,
  photoUrl,
  rowTargetHeight,
} from "@/utils/photograph-utils";

const LOAD_SIZE = 20;
/** 写真どうしの隙間(px)。Tailwind の gap-4 と揃える */
const GAP = 16;

/** 写真1枚。読み込みが終わるまでは同じ大きさのプレースホルダで場所を確保する */
const GalleryPhoto = ({
  photo,
  alt,
  width,
  height,
}: {
  photo: Photo;
  alt: string;
  width: number;
  height: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative flex-none overflow-hidden rounded-lg"
      style={{ width, height }}
    >
      {!loaded && !failed && (
        <div
          data-testid="photo-placeholder"
          className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-slate-700"
        />
      )}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 p-2 text-center text-sm text-zinc-500 dark:bg-slate-800 dark:text-zinc-400">
          画像の読み込みに失敗しました
        </div>
      ) : (
        // biome-ignore lint/performance/noImgElement: Worker から配信する WebP を srcset で出し分ける(research R3)
        <img
          src={photoUrl(photo.key, 640)}
          srcSet={photoSrcSet(photo)}
          sizes={`${Math.ceil(width)}px`}
          width={photo.width}
          height={photo.height}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="h-full w-full"
        />
      )}
    </div>
  );
};

/**
 * アルバムの写真を、行ごとに高さを揃えて並べる(research R1)。
 * 表示幅を測るまでは並べず、場所だけ確保する(research R2)。
 * 20枚ずつ表示し、一覧の下の目印が画面に近づいたら続きを足す(research R12)。
 */
const PhotoGallery = ({
  photos,
  title,
}: {
  photos: Photo[];
  title: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(LOAD_SIZE);
  const hasMore = visibleCount < photos.length;
  const ready = width !== null;

  // 描画の前に表示幅を読み、以後は大きさの変化に合わせて組み直す
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = (nextWidth: number) =>
      setWidth(nextWidth > 0 ? nextWidth : null);
    update(container.clientWidth);

    const observer = new ResizeObserver(([entry]) =>
      update(entry.contentRect.width),
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    // 目印は表示幅が分かってから描かれるため、ready になった時点で見張りを付ける
    if (!ready || !loadMoreElement || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) =>
            Math.min(currentCount + LOAD_SIZE, photos.length),
          );
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
  }, [photos.length, hasMore, ready]);

  const numbers = new Map(photos.map((photo, index) => [photo.key, index + 1]));
  const rows =
    width === null
      ? []
      : justifyRows(
          photos.slice(0, visibleCount),
          width,
          rowTargetHeight(width),
          GAP,
        );

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[66rem]">
      {width === null ? (
        <div data-testid="gallery-pending" className="min-h-[60vh]" />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {rows.map((row) => (
              <div
                key={row.photos[0].key}
                data-testid="photo-row"
                className="flex gap-4"
              >
                {row.photos.map((photo) => (
                  <GalleryPhoto
                    key={photo.key}
                    photo={photo}
                    alt={`${title} ${numbers.get(photo.key)}枚目`}
                    width={(photo.width / photo.height) * row.height}
                    height={row.height}
                  />
                ))}
              </div>
            ))}
          </div>

          {hasMore && <div ref={loadMoreRef} data-testid="load-more" />}
        </>
      )}
    </div>
  );
};

export default PhotoGallery;
