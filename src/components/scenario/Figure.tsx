import ZoomableImage from "./ZoomableImage";

/** キャプション付きの図。地図などを崩さずに載せ、選ぶと原寸で開く(FR-025) */
const Figure = ({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) => (
  <figure className="not-prose my-6 flex flex-col items-center gap-2">
    <ZoomableImage
      src={src}
      alt={alt}
      className="max-h-[70vh] w-auto max-w-full rounded-md object-contain"
    />
    {caption && (
      <figcaption className="text-center text-sm text-zinc-600 dark:text-slate-300">
        {caption}
      </figcaption>
    )}
  </figure>
);

export default Figure;

/** Markdown の画像 `![alt](src "キャプション")`。タイトルをキャプションにする */
export const MarkdownImage = ({
  src,
  alt,
  title,
}: {
  src?: string;
  alt?: string;
  title?: string;
}) =>
  typeof src === "string" ? (
    <Figure src={src} alt={alt ?? ""} caption={title} />
  ) : null;
