/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['grammy', 'google-gax'],
	},
};

export default nextConfig;
