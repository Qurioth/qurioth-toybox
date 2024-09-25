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

export default nextConfig;
