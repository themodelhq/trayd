import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React strict mode (disabled for production stability)
  reactStrictMode: false,
  
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to silence the warning and use defaults
    // Turbopack is faster and handles most cases automatically
  },
  
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
