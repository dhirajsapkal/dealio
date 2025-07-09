/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize build performance
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Build optimization
  swcMinify: true,
  compress: true,
  
  // Reduce build memory usage
  webpack: (config, { isServer }) => {
    // Optimize for smaller bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Disable sourcemaps in production to reduce build time
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    unoptimized: true, // Disable image optimization to speed up builds
  },
  
  // Disable ESLint during builds (we can run it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during builds (we can run it separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 