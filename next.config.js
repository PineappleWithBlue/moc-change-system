/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (isProd ? '/moc-change-system' : '');

const cleanBasePath = rawBasePath && rawBasePath !== '/' ? rawBasePath : undefined;

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  basePath: cleanBasePath,
  assetPrefix: cleanBasePath ? `${cleanBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
