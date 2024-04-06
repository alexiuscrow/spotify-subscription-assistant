/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['grammy', 'googleapis'],
	},
};

export default nextConfig;
