import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        pathname: "/api/v1/image/assets/**", // Match all images from this path
      },
      {
        protocol: "https",
        hostname: "placehold.co", // Allow images from placehold.co
        pathname: "/**", // Match all paths
      },
      {
        protocol: "https",
        hostname: "webstorageflights.s3.ca-central-1.amazonaws.com", // Allow images from S3
        pathname: "/**", // Match all paths
      },

      {
        protocol: "https",
        hostname: "app-web-storage.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true, // Enable SVG support
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
