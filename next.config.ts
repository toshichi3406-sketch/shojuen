import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/journal", permanent: true },
      { source: "/blog/:slug", destination: "/journal/:slug", permanent: true },
      { source: "/column", destination: "/journal", permanent: true },
      { source: "/column/:slug", destination: "/journal/:slug", permanent: true },
      { source: "/the-leaves", destination: "/the-matcha", permanent: true },
      { source: "/farms", destination: "/producers", permanent: true },
      { source: "/brew", destination: "/how-to", permanent: true },
      { source: "/brewing", destination: "/how-to", permanent: true },
      { source: "/tea-library", destination: "/the-matcha", permanent: true },
    ];
  },
};

export default nextConfig;
