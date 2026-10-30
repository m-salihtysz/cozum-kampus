import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The dev "N" badge sits over the admin sidebar profile button.
  devIndicators: { position: "bottom-right" },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
