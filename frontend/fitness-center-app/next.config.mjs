/** @type {import('next').NextConfig} */
const nextConfig = {
  // API isteklerini yönlendirmek için rewrites kullanıyoruz
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:80/api/:path*', // gateway servisine yönlendirme
      }
    ];
  }
};

export default nextConfig;
