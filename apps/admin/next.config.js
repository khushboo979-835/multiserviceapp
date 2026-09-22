/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  env: {
    NEXT_PUBLIC_API_URL: 'https://multiserviceapp-4pdw.onrender.com/api',
  },
};

module.exports = nextConfig;
