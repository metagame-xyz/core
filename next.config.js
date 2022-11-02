if (
    process.env.LD_LIBRARY_PATH == null ||
    !process.env.LD_LIBRARY_PATH.includes(`${process.env.PWD}/node_modules/canvas/build/Release:`)
) {
    process.env.LD_LIBRARY_PATH = `${process.env.PWD}/node_modules/canvas/build/Release:${
        process.env.LD_LIBRARY_PATH || ''
    }`
}

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
            {
                source: '/api/:path*',
                headers: [
                    { key: 'origins', value: '*' },
                    { key: 'Bypass-Tunnel-Reminder', value: '*' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Request-Methods', value: 'POST, GET' },
                ],
            },
        ]
    },
}
