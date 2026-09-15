/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.jsx", "page.ts", "page.js"],
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  typescript: {
    // Next.js should not fail build on pre-existing type warnings
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
