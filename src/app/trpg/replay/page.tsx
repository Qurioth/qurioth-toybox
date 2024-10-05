"use client";

import Template from "@/components/Template";
import YouTubeEmbed from "@/components/YoutubeEmbed";
import { videoIds } from "@/data/youtube/trpg/youtube-id";

export default function Home() {
  return (
    <Template>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {videoIds.map((videoId) => {
          return <YouTubeEmbed key={videoId} videoId={videoId} />;
        })}
      </div>
    </Template>
  );
}
