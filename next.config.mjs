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

    // Exclude ONNX files from minification to avoid import.meta issues
    if (!isServer) {
      config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.exclude = [
            /ort.*\.js$/,
            /ort.*\.mjs$/,
            /webgpu.*\.js$/,
            /webgpu.*\.mjs$/,
            /onnx.*\.js$/,
            /onnx.*\.mjs$/,
          ];
        }
        return plugin;
      });
    }

    return config;
  },
};

export default nextConfig;