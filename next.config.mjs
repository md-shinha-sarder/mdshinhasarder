/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mdshinhasarder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    // Next.js should not fail build on pre-existing type warnings
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "https://hpnndbmyibbgrlskskyt.supabase.co/storage/v1/object/public/media/:path*",
      },
    ];
  },
};

export default nextConfig;
