import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images:{
    remotePatterns:[{
      protocol: "https",
      hostname:"plus.unsplash.com",
      pathname:"/**",
    },{
      protocol: "https",
      hostname:"images.unsplash.com",
      pathname:"/**",
    }]
  }
};

export default nextConfig;
