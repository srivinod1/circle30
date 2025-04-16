/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.tomtom.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 