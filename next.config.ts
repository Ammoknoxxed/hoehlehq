// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Erhöht das Limit für Bilder- und Datei-Uploads
    },
  },
};

export default nextConfig;