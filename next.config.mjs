/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{source: '/demo', destination: '/spider/index.html'}];
  },
};
export default nextConfig;
