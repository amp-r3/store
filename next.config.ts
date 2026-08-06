import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
    // Every .module.scss does `@use 'app/styles/index' as *;` — resolve that
    // against src/ the same way the old Vite `@` alias did.
    loadPaths: [path.join(process.cwd(), 'src')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ymerxlukxkwcjvlbxoda.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
