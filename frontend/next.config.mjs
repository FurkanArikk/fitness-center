/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using rewrites to redirect all API requests through Gateway
  async rewrites() {
    // Environment variable'dan API base URL'sini alıyoruz
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:80';
    
    return [
      // All API requests go through Gateway
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      }
    ];
  }
};

export default nextConfig;
