import type { Metadata, Viewport } from 'next';
import { inter, poppins } from '@/app/styles/fonts';
import { AppProviders } from '@/app/providers/AppProviders';
import { getSiteOrigin } from '@/shared/config';
import '@/app/styles/main.scss';
import 'react-loading-skeleton/dist/skeleton.css';

// Lets relative OG images and per-page `alternates.canonical` (see
// app/(shop)/product/[id]/page.tsx) resolve to absolute URLs.
// NEXT_PUBLIC_SITE_URL must be set (see .env) since there's no request to
// read window.location from here.

// TODO(stage 5): update NEXT_PUBLIC_SITE_URL to the Vercel domain once live
// — og:url/og:image (and every canonical/sitemap URL, all built from
// getSiteOrigin()) follow it automatically.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin() || 'http://localhost:3000'),
  title: 'Store',
  description:
    'A fully responsive, dual-themed e-commerce storefront built with React 19, TypeScript, and Redux Toolkit. Features glassmorphism UI, real-time search, and a persistent cart.',
  keywords: ['react', 'typescript', 'redux toolkit', 'e-commerce', 'portfolio', 'vite', 'glassmorphism', 'frontend'],
  authors: [{ name: 'Amir (amp3re)' }],
  openGraph: {
    type: 'website',
    title: 'Store | Modern E-commerce Portfolio',
    description: 'A fully responsive, dual-themed e-commerce storefront built with React 19, TypeScript, and Redux Toolkit.',
    url: getSiteOrigin(),
    // No `images` here — app/opengraph-image.png (+ .alt.txt) covers every
    // route that doesn't set its own (product pages do, with the actual
    // product photo, which takes priority over this default).
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Store | Modern E-commerce Portfolio',
    description: 'A fully responsive, dual-themed e-commerce storefront built with React 19, TypeScript, and Redux Toolkit.',
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
  manifest: '/favicon_io/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#b8a7f0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
        <div id="modal-root" />
      </body>
    </html>
  );
}
