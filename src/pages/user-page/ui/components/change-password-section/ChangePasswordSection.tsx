import { useState } from 'react';
import { Button } from '@/shared/ui';
import { ChangePasswordForm } from '@/features/auth';
import style from './change-password-section.module.scss';

interface ChangePasswordSectionProps {
  /** Hidden entirely for OAuth-only accounts — they have no password to
   *  change. (Such a user could still set one via /forgot-password, since
   *  resetPasswordForEmail works regardless of provider, but surfacing that
   *  path from the profile is out of scope here.) */
  hasPasswordIdentity: boolean;
}

export const ChangePasswordSection = ({ hasPasswordIdentity }: ChangePasswordSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasPasswordIdentity) return null;

  return (
    <section className={style['change-password-section']} aria-labelledby="change-password-title">
      <div className={style['change-password-section__header']}>
        <h2 id="change-password-title" className={style['change-password-section__title']}>
          Security
        </h2>

        {!isExpanded && (
          <Button variant="ghost" onClick={() => setIsExpanded(true)}>
            Change password
          </Button>
        )}
      </div>

      {isExpanded && (
        <ChangePasswordForm
          onSuccess={() => setIsExpanded(false)}
          onCancel={() => setIsExpanded(false)}
        />
      )}
    </section>
  );
};
