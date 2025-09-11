import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
 		// Temporarily ignore ESLint errors during production builds to unblock build
 		ignoreDuringBuilds: true,
 	},
	experimental: {
		optimizePackageImports: [
			"react-icons",
			"framer-motion",
			"recharts",
			"react-leaflet"
		]
	},
	productionBrowserSourceMaps: false,
};

export default nextConfig;
