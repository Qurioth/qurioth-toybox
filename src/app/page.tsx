import Template from "@/components/Template";

export default function Home() {
  return (
    <Template>
      <div className="w-11/12 flex gap-6 flex-col p-2">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">{`Qurioth's Toybox`}</h1>
        <h2 className="text-4xl font-extrabold dark:text-white">{`Welcome to Qurioth's Toybox`}</h2>
        <p>ここはQuriothが自由気ままに遊んでいるホームページです。</p>
        <p>テーブルトークRPG向けのツールやシナリオを公開しています。</p>
      </div>
    </Template>
  );
}
