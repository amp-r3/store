import { Button } from '@/shared/ui';
import style from './reset-link-sent.module.scss';

interface ResetLinkSentProps {
  email: string;
  onResend: () => void;
  onUseAnotherEmail: () => void;
  isResending: boolean;
  cooldownSeconds: number;
}

export const ResetLinkSent = ({
  email,
  onResend,
  onUseAnotherEmail,
  isResending,
  cooldownSeconds,
}: ResetLinkSentProps) => {
  const isCoolingDown = cooldownSeconds > 0;

  return (
    <div className={style['reset-link-sent']}>
      <p className={style['reset-link-sent__text']}>
        If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your
        password. Open it in this browser — the link is tied to the device you requested it from.
      </p>

      {/* Only the transition to "ready" is announced — keying off the boolean
          (not cooldownSeconds) keeps this from re-announcing every second. */}
      {!isCoolingDown && (
        <p className={style['reset-link-sent__hint']} aria-live="polite">
          Didn&apos;t get it? You can resend the email now.
        </p>
      )}

      <div className={style['reset-link-sent__actions']}>
        <Button type="button" variant="ghost" disabled={isCoolingDown} isLoading={isResending} onClick={onResend}>
          {isCoolingDown ? `Resend in ${cooldownSeconds}s` : 'Resend email'}
        </Button>
        <Button type="button" variant="primary" onClick={onUseAnotherEmail}>
          Use a different email
        </Button>
      </div>
    </div>
  );
};
