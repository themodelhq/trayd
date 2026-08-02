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
  },
  
  // Handle webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    // Fix for packages that use Node.js built-ins in client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
