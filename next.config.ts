import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React strict mode (disabled for production stability)
  reactStrictMode: false,
  
  // Experimental features for better build handling
  experimental: {
    // Enable server actions
    serverComponentsExternalPackages: [
      'prisma',
      '@prisma/client',
    ],
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
