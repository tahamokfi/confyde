/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Server Actions are available by default in Next.js 14+
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig; 