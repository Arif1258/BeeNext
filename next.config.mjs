/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
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
        destination: "/purchase",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
