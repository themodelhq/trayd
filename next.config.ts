import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React strict mode (disabled for production stability)
  reactStrictMode: false,
  
  // Server external packages (moved from experimental.serverComponentsExternalPackages in Next.js 16)
  serverExternalPackages: [
    'prisma',
    '@prisma/client',
  ],
  
  // Experimental features for better build handling
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
    ],
  },
};

export default nextConfig;
