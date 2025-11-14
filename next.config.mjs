/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TEMPORARILY disable minification to test the fix
  // TODO: Re-enable minification after resolving ONNX Runtime issues
  swcMinify: false,
  // Disable ESLint during builds for test mode deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds for test mode deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Apply CORS headers for WASM functionality
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ],
      }
    ];
  },
  webpack: (config, { isServer, dev }) => {
    // Handle ONNX Runtime WebAssembly files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Disable minification in production for testing
    if (!isServer && !dev) {
      config.optimization.minimize = false;
    }

    if (!isServer) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      // Handle WASM files as assets
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
    }

    return config;
  },
};

export default nextConfig;