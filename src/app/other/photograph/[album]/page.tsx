import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Template from "@/components/Template";
import { albums } from "@/data/photograph/albums";
import PhotoGallery from "../PhotoGallery";

type Params = { params: Promise<{ album: string }> };

// アルバムはビルド時に決まるため、登録されていない URL は 404 にする(research R11)
export const dynamicParams = false;

export const generateStaticParams = () =>
  Object.keys(albums).map((album) => ({ album }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { album } = await params;
  const title = albums[album]?.title;

  return title ? { title } : {};
}

export default async function PhotographAlbumPage({ params }: Params) {
  const { album: slug } = await params;
  const album = albums[slug];

  if (!album) {
    notFound();
  }

  return (
    <Template>
      <div className="w-full min-h-[calc(100vh-16rem)]">
        <div className="mx-auto mb-8 w-full max-w-[66rem]">
          <Link
            href="/other/photograph"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            アルバム一覧へ戻る
          </Link>
          <h1 className="mt-4 mb-2 break-words text-4xl font-bold text-zinc-950 dark:text-white">
            {album.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {album.date}
          </p>
        </div>

        <PhotoGallery photos={album.photos} title={album.title} />
      </div>
    </Template>
  );
}
