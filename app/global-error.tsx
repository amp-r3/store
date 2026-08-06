'use client';

import { inter, poppins } from '@/app/styles/fonts';
import { ErrorView } from '@/shared/ui';
import '@/app/styles/main.scss';

// global-error replaces the root layout entirely when it's *that* layout
// that threw, so it can't rely on app/layout.tsx's <html>/<head> or styles
// having been rendered — it declares its own copy of both.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <ErrorView error={error.message} />
      </body>
    </html>
  );
}
