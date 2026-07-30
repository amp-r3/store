import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuMail } from 'react-icons/lu';
import { Alert, Button, FormField } from '@/shared/ui';
import { useHaptics, getErrorMessage } from '@/shared/lib';
import { useRequestPasswordResetMutation } from '@/entities/session';
import { ForgotPasswordSchema, forgotPasswordSchema } from '../../model/forgotPasswordSchema';
import { useCooldown } from '../../lib/useCooldown';
import { parseRetryAfter } from '../../lib/parseRetryAfter';
import { AuthSwitchLink } from '../auth-switch-link/AuthSwitchLink';
import { ResetLinkSent } from '../reset-link-sent/ResetLinkSent';
import style from './forgot-password-form.module.scss';

const RESEND_COOLDOWN_SECONDS = 60;

export const ForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const { remaining, isCoolingDown, start } = useCooldown();
  const { success } = useHaptics();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched'
  });

  const send = async (email: string) => {
    try {
      await requestReset({ email }).unwrap();
      // Never branch on whether the address exists — Supabase answers the
      // same way either way, and so must we, or we hand out an account oracle.
      setSentTo(email);
      start(RESEND_COOLDOWN_SECONDS);
      success();
    } catch (err) {
      const message = getErrorMessage(err);

      if (typeof err === 'object' && err !== null && 'status' in err && err.status === 429) {
        start(parseRetryAfter(message, RESEND_COOLDOWN_SECONDS));
        // Still show the sent state — the cooldown itself explains the wait,
        // and it keeps the same no-enumeration behaviour as a fresh request.
        setSentTo(email);
        return;
      }

      setError('root', { type: 'server', message });
    }
  };

  const onSubmit = ({ email }: ForgotPasswordSchema) => send(email);

  if (sentTo) {
    return (
      <ResetLinkSent
        email={sentTo}
        isResending={isLoading}
        cooldownSeconds={remaining}
        onResend={() => { if (!isCoolingDown) void send(sentTo); }}
        onUseAnotherEmail={() => setSentTo(null)}
      />
    );
  }

  return (
    <form className={style['forgot-password-form']} onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField
        label="Email"
        type="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        autoComplete="email"
        icon={<LuMail />}
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" variant="primary" isLoading={isLoading}>
        Send reset link
      </Button>

      <AuthSwitchLink prompt="Remembered your password?" to="/login" label="Log in" />
    </form>
  );
};
