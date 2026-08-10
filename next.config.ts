import type { NextConfig } from 'next';
import path from 'node:path';
import { SUPABASE_IMAGE_HOST } from './src/shared/config/images';

const nextConfig: NextConfig = {
  distDir: process.env.SECOND_INSTANCE ? '.next-second' : '.next',
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
        hostname: SUPABASE_IMAGE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
      // profiles.avatar_url is seeded from raw_user_meta_data on signup
      // (see supabase/schema.sql's handle_new_user trigger) — for a Google
      // OAuth signup that's a googleusercontent.com URL, not Storage.
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
