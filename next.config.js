/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

let exportConfig = nextConfig;
try {
  const withPWA = require('next-pwa').default({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  });
  exportConfig = withPWA(nextConfig);
} catch (e) {
  console.log('next-pwa not found, skipping PWA');
}

module.exports = exportConfig;
