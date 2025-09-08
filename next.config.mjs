/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  webpack: (config, { isServer }) => {
    // Handle ONNX Runtime WebAssembly files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Configure Terser to handle import.meta syntax
    if (!isServer) {
      config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.terserOptions = {
            ...plugin.options.terserOptions,
            ecma: 2020,
            module: true,
          };
        }
        return plugin;
      });
    }

    return config;
  },
};

export default nextConfig;