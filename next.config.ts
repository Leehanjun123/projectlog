import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  // pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // 성능 최적화 설정
  reactStrictMode: true,

  // Compiler 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 실험적 기능 최적화
  experimental: {
    optimizePackageImports: ['@/components/ui', 'lucide-react'],
  },
}

export default nextConfig
