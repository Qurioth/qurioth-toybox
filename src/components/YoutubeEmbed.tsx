import React from "react";

const YouTubeEmbed = ({
  videoId,
  playlistId,
}: {
  videoId?: string;
  playlistId?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* YouTube動画・配信 */}
      {videoId && (
        <div className="w-full max-w-lg">
          <iframe
            className="w-full aspect-video"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* YouTube再生リスト */}
      {playlistId && (
        <div className="w-full max-w-lg">
          <iframe
            className="w-full aspect-video"
            src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
            title="YouTube playlist"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default YouTubeEmbed;
