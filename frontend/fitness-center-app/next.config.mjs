/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using rewrites to redirect all API requests through Gateway
  async rewrites() {
    return [
      // All API requests go through Gateway (port 80)
      {
        source: '/api/:path*',
        destination: 'http://localhost:80/api/:path*',
      }
    ];
  }
};

export default nextConfig;
