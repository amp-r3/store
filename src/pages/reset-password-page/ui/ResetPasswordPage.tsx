import { RiShieldKeyholeLine } from 'react-icons/ri';
import { AuthCard } from '@/shared/ui';
import { ResetPasswordForm } from '@/features/auth';

export const ResetPasswordPage = () => (
  <AuthCard
    title="Set a new password"
    subtitle="Choose a password you haven't used before."
    icon={<RiShieldKeyholeLine />}
  >
    <ResetPasswordForm />
  </AuthCard>
);
