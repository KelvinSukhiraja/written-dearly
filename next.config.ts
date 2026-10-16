import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [
    {protocol:'https',hostname:'images.unsplash.com'},
    {protocol:'https',hostname:'sikswvcuyhtusnxyafzj.supabase.co',pathname:'/storage/v1/object/public/invitation-media/**'},
  ] },
  async headers(){return [{source:'/i/:path*',headers:[{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'private, no-store'}]},{source:'/preview/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'private, no-store'}]}];},
};

export default nextConfig;
