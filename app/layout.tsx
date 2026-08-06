import type { Metadata, Viewport } from 'next';
import { inter, poppins } from '@/app/styles/fonts';
import '@/app/styles/main.scss';
import 'react-loading-skeleton/dist/skeleton.css';

// TODO(stage 5): og:url/og:image still point at the Netlify deployment —
// update once the Vercel domain is live.
export const metadata: Metadata = {
  title: 'Store',
  description:
    'A fully responsive, dual-themed e-commerce storefront built with React 19, TypeScript, and Redux Toolkit. Features glassmorphism UI, real-time search, and a persistent cart.',
  keywords: ['react', 'typescript', 'redux toolkit', 'e-commerce', 'portfolio', 'vite', 'glassmorphism', 'frontend'],
  authors: [{ name: 'Amir (amp3re)' }],
  openGraph: {
    type: 'website',
    title: 'Store | Modern E-commerce Portfolio',
    description: 'A fully responsive, dual-themed e-commerce storefront built with React 19, TypeScript, and Redux Toolkit.',
    url: 'https://amp-r3-store.netlify.app/',
    images: ['https://amp-r3-store.netlify.app/catalog.png'],
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
        {children}
        <div id="modal-root" />
      </body>
    </html>
  );
}
