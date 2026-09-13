/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Enable Edge-friendly features
  experimental: {
    // Allows Cloudflare Pages to bundle server components cleanly
  },
};

export default nextConfig;
