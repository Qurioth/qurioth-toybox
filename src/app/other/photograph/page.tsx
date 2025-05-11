"use client";

import Template from "@/components/Template";
import { links } from "@/data/photograph/dropbox-link";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

function splitArray<T>(array: T[], parts: number): T[][] {
  const result: T[][] = Array.from({ length: parts }, () => []);
  array.forEach((item, idx) => {
    result[idx % parts].push(item);
  });
  return result;
}

function ImageWithSkeleton(props: React.ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full">
      {!loaded && !error && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ minHeight: 200 }}
        />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <span className="text-gray-500">画像の読み込みに失敗しました</span>
        </div>
      )}
      <Image
        {...props}
        loading="lazy"
        decoding="async"
        style={{
          ...(loaded ? {} : { visibility: "hidden" }),
          objectFit: "cover",
        }}
        onLoad={() => setLoaded(true)}
        width={props.width}
        height={props.height}
        alt={props.alt}
        onError={() => setError(true)}
        className="rounded-lg"
        unoptimized
      />
    </div>
  );
}

export default function Home() {
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [columnCount, setColumnCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  // 画面サイズに応じて列数を更新
  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(window.innerWidth >= 768 ? 4 : 2);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // スクロールが一番下に来たら次を表示
  const handleScroll = useCallback(() => {
    if (
      !isLoading &&
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
    ) {
      setIsLoading(true);
      setVisibleCount((prev) => {
        const newCount = Math.min(prev + BATCH_SIZE, links.length);
        // 読み込みが完了したらisLoadingをfalseに
        if (newCount === prev) {
          setIsLoading(false);
        }
        return newCount;
      });
    }
  }, [isLoading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 表示する分だけ分割
  const columns = splitArray(links.slice(0, visibleCount), columnCount);

  // 画像の読み込みが完了したらisLoadingをfalseに
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // 500ms後にisLoadingをfalseに
      return () => clearTimeout(timer);
    }
  }, [visibleCount, isLoading]);

  return (
    <Template>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((col, colIdx) => (
          <div className="grid gap-4" key={colIdx}>
            {col.map((img) => (
              <div key={img.name}>
                <ImageWithSkeleton
                  className="h-auto max-w-full rounded-lg"
                  src={`https://www.dropbox.com/scl/fi/${img.id}/${img.name}?rlkey=${img.rlkey}&st=${img.st}&raw=1`}
                  width={img.orientation === "landscape" ? 600 : 400}
                  height={img.orientation === "landscape" ? 400 : 600}
                  alt={img.name}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Template>
  );
}
