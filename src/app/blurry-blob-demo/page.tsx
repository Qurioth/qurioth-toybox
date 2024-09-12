import BlurryBlob from "@/components/animata/background/blurry-blob";

export default function BlurryBlobDemo() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8 animate-in fade-in duration-500">
        BlurryBlob デモ
      </h1>

      <div className="w-full max-w-2xl aspect-video relative overflow-hidden rounded-xl shadow-lg animate-in zoom-in duration-700">
        <BlurryBlob
          className="rounded-xl opacity-45"
          firstBlobColor="bg-purple-400"
          secondBlobColor="bg-blue-400"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-xl font-semibold z-10">
            BlurryBlob エフェクト
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4 animate-in slide-in-from-bottom duration-700">
        <p className="text-center">
          このデモは、BlurryBlobコンポーネントを使用して背景にアニメーションのある
          ぼかし効果を追加する方法を示しています。
        </p>
        <a href="/" className="block text-center text-blue-500 hover:underline">
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
