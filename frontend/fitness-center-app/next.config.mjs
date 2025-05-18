/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using rewrites to redirect API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:80/api/:path*', // redirect to gateway service
      }
    ];
  }
};

export default nextConfig;
