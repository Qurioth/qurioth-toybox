import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "object-storage.tyo2.conoha.io",
      },
    ],
  },
};

// シナリオの専用ページ(src/scenarios/<slug>/content.mdx)を import できるようにする。
// Turbopack ではプラグインを文字列で渡す必要がある(ADR-0016)
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
  },
});

export default withMDX(nextConfig);
