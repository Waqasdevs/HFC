/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable fast local and serverless execution
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
