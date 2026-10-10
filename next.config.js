/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  // lint는 CI의 `npm run lint`(ESLint CLI)에서 수행 — Next 16에서 빌드 중 lint가 제거되므로 미리 분리
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
