/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages
  transpilePackages: ["@repo/ui", "@repo/ai", "@repo/auth", "@repo/database", "@repo/api", "@repo/monitoring"],

  // Experimental features for performance
  experimental: {
    // Partial Pre-Rendering (PPR) for faster initial loads
    ppr: true,
    
    // React Compiler for optimized builds
    reactCompiler: true,
    
    // Optimize package imports
    optimizePackageImports: ['@repo/ui', 'lucide-react'],
  },

  // Image optimization
  images: {
    // Add your image domains
    domains: ['cloudflare-r2.com', 'supabase.co'],
    
    // Modern image formats
    formats: ['image/avif', 'image/webp'],
    
    // Image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },

  // Compression
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Rewrites
  async rewrites() {
    return [];
  },

  // Output configuration
  output: 'standalone',

  // Production-only optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Disable source maps in production for smaller bundles
    productionBrowserSourceMaps: false,
  }),
};

export default nextConfig;
