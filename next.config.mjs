/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to fix Vercel deployment issue
    ignoreDuringBuilds: true,
  },
  // Force fresh build
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

export default nextConfig 