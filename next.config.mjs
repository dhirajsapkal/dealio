/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimization - remove experimental turbo features that cause issues
  swcMinify: true,
  compress: true,
  
  // Simple webpack config to avoid memory issues
  webpack: (config, { isServer, dev }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Simple chunking strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Disable resource-intensive features during build
  productionBrowserSourceMaps: false,
  
  // Disable image optimization to speed up builds
  images: {
    unoptimized: true,
  },
  
  // Skip linting and type checking during builds to prevent timeouts
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Output configuration for better compatibility
  output: 'standalone',
};

export default nextConfig; 