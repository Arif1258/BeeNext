/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    return [
      {
        source: "/images/:all*(svg|jpg|png|webp|jpeg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/notes/:all*(svg|pdf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/fonts/:all*(woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/topics",
        permanent: false,
      },
      {
        source: "/purchases",
        destination: "/topics",
        permanent: false,
      },
      {
        source: "/purchase",
        destination: "/topics",
        permanent: false,
      },
      {
        source: "/purchase/:path*",
        destination: "/topics",
        permanent: false,
      },
      {
        source: "/order-printed",
        destination: "/topics",
        permanent: false,
      },
      {
        source: "/cart",
        destination: "/topics",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
