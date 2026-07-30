import { useMemo } from 'react';
import style from './password-requirements.module.scss';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { PASSWORD_RULES } from '../../lib/passwordRules';

interface PasswordRequirementsProps {
  password?: string;
  showUnmetAsError?: boolean;
  /** Lets a password field point at the checklist via aria-describedby. */
  id?: string;
}

export const PasswordRequirements = ({ password = '', showUnmetAsError = false, id }: PasswordRequirementsProps) => {
  const requirements = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, isMet: rule.test(password) })),
    [password]
  );

  const metCount = requirements.filter((req) => req.isMet).length;

  return (
    <div id={id} className={style['password-requirements']}>
      {requirements.map((req) => (
        <div
          key={req.id}
          className={`${style['password-requirements__item']} ${
            req.isMet
              ? style['password-requirements__item--met']
              : showUnmetAsError
              ? style['password-requirements__item--error']
              : style['password-requirements__item--unmet']
          }`}
        >
          {req.isMet ? (
            <RiCheckLine aria-hidden="true" className={style['password-requirements__icon']} />
          ) : (
            <RiCloseLine aria-hidden="true" className={style['password-requirements__icon']} />
          )}
          <span className="sr-only">{req.isMet ? 'Met: ' : 'Not met: '}</span>
          <span>{req.label}</span>
        </div>
      ))}

      {/* A single summary rather than making each item live — re-announcing
          all 5 items on every keystroke would be unusable. */}
      <p className="sr-only" aria-live="polite">
        {`${metCount} of ${requirements.length} password requirements met`}
      </p>
    </div>
  );
};
