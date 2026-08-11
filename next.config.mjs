/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./i18n.ts');
 
 
const nextConfig = { 
    typescript: {
      ignoreBuildErrors: true,
    },
    reactStrictMode: false,
};

export default withNextIntl(nextConfig);