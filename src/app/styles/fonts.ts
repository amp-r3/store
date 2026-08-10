import { Inter, Poppins } from 'next/font/google';

// Exposed as CSS custom properties (--font-inter/--font-poppins) consumed by
// $font-primary/$font-display in _variables.scss, applied via the className
// on <html> in app/layout.tsx.
export const inter = Inter({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-inter',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
  variable: '--font-poppins',
});
