/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Server Actions are available by default in Next.js 14+
    // missingSuspenseWithCSRBailout: false, // Removed this temporary fix
  },
};

module.exports = nextConfig; 