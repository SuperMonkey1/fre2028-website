/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.mixkit.co'],
  },
  i18n: {
    locales: ['nl'],
    defaultLocale: 'nl',
  },
  // Add trailing slashes for better SEO
  trailingSlash: false,
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'assets.mixkit.co', 'www.fre2028.la', 'fre2028.la'],
    formats: ['image/webp', 'image/avif'],
  },
  // Generate ETags for better caching
  generateEtags: true,
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
