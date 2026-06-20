/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide the X-Powered-By header and strip console.* from production bundles.
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    optimizePackageImports: ["firebase/app", "firebase/auth", "firebase/firestore"],
  },
};

export default nextConfig;
