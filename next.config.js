// const withNextIntl = require('next-intl/plugin')();

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'standalone', // เปิดใช้งานโหมด standalone
// };
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // เปิดใช้งานโหมด standalone
};
 
module.exports = withNextIntl(nextConfig);
