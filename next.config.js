/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
};

module.exports = nextConfig;
