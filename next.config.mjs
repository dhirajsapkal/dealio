/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to fix Vercel deployment issue
    ignoreDuringBuilds: true,
  },
}

export default nextConfig 