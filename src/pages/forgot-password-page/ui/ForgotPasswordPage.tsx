import { useLocation } from 'react-router';
import { RiLockUnlockLine } from 'react-icons/ri';
import { Alert, AuthCard } from '@/shared/ui';
import { ForgotPasswordForm } from '@/features/auth';
import type { LocationState } from '@/shared/types';

export const ForgotPasswordPage = () => {
  const location = useLocation();
  // Set by RecoveryRoute when a stale/used recovery link sends the user back
  // here to request a fresh one.
  const linkExpired = (location.state as (LocationState & { linkExpired?: boolean }) | null)?.linkExpired;

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      icon={<RiLockUnlockLine />}
    >
      {linkExpired && (
        <Alert variant="warning">Your reset link has expired. Request a new one below.</Alert>
      )}

      <ForgotPasswordForm />
    </AuthCard>
  );
};
