/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: () => {
        return [
            {
              source: '/blog/:month/:slug.html',
              destination: '/blog/:month/:slug',
              permanent: true,
            },
            {
                source: '/blog/:month/:slug.md',
                destination: '/blog/:month/:slug',
                permanent: true,
            },
            {
                source: '/blog/:month/:slug.mdx',
                destination: '/blog/:month/:slug',
                permanent: true,
            },
        ]
    }
}

export default nextConfig