"use client";

import Template from "@/components/Template";
import { links } from "@/data/photograph/dropbox-link";
import React, { useState, useEffect, useCallback } from "react";

function splitArray<T>(array: T[], parts: number): T[][] {
  const result: T[][] = Array.from({ length: parts }, () => []);
  array.forEach((item, idx) => {
    result[idx % parts].push(item);
  });
  return result;
}

function ImageWithSkeleton(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full">
      {!loaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ minHeight: 200 }}
        />
      )}
      <img
        {...props}
        style={loaded ? {} : { visibility: "hidden" }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function Home() {
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  // スクロールが一番下に来たら次を表示
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100 // 100px手前で発火
    ) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, links.length));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 表示する分だけ分割
  const columns = splitArray(links.slice(0, visibleCount), 4);

  return (
    <Template>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col, colIdx) => (
          <div className="grid gap-4" key={colIdx}>
            {col.map((img) => (
              <div key={img.name}>
                <ImageWithSkeleton
                  className="h-auto max-w-full rounded-lg"
                  src={`https://www.dropbox.com/scl/fi/${img.id}/${img.name}?rlkey=${img.rlkey}&st=${img.st}&raw=1`}
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
