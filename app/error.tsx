'use client';

import { ErrorView } from '@/shared/ui';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <ErrorView error={error.message} />;
}
