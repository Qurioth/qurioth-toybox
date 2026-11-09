import Template from "@/components/Template";
import { albums } from "@/data/photograph/albums";
import AlbumList from "./AlbumList";

export default function PhotographPage() {
  return (
    <Template>
      <div className="w-full min-h-[calc(100vh-16rem)]">
        <div className="mx-auto mb-8 w-full max-w-[66rem]">
          <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">
            Photograph
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            撮影した写真をアルバムごとにまとめています。
          </p>
        </div>

        <AlbumList albums={albums} />
      </div>
    </Template>
  );
}
