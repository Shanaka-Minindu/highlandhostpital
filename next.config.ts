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
    },{
      protocol: "https",
      hostname:"picsum.photos",
      pathname:"/**",
    },{
      protocol: "https",
      hostname:"*.ufs.sh",
      pathname:"/**",
    },{
      protocol: "https",
      hostname:"utfs.io",
      pathname:"/**",
    }]
  }
};

export default nextConfig;
