import { useMemo } from 'react';
import style from './password-requirements.module.scss';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { PASSWORD_RULES } from '../../model/passwordRules';

interface PasswordRequirementsProps {
  password?: string;
  showUnmetAsError?: boolean;
}

export const PasswordRequirements = ({ password = '', showUnmetAsError = false }: PasswordRequirementsProps) => {
  const requirements = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, isMet: rule.test(password) })),
    [password]
  );

  return (
    <div className={style['password-requirements']}>
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
            <RiCheckLine className={style['password-requirements__icon']} />
          ) : (
            <RiCloseLine className={style['password-requirements__icon']} />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
};
