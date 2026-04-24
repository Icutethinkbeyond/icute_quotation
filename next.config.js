const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // เปิดใช้งานโหมด standalone
};

module.exports = withNextIntl(nextConfig);
