module.exports = {
    reactStrictMode: true,
    images: {
        dangerouslyAllowSVG: true,
        domains: ['ipfs.infura.io'],
    },
    webpack: (config, options) => {
        if (!options.isServer) {
            config.resolve.fallback.fs = false
        }

        return config
    },
    async headers() {
        return [
            {
                source: '/fonts/LarsMono-RegularWeb.woff2',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },
}
