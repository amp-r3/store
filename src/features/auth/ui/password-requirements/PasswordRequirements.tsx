import React from 'react';
import style from './password-requirements.module.scss';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import zxcvbn from 'zxcvbn';

interface PasswordRequirementsProps {
  password?: string;
  hasError?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password = '', hasError = false }) => {
  const requirements = [
    {
      id: 'length',
      label: 'Minimum 6 characters',
      isMet: password.length >= 6,
    },
    {
      id: 'english',
      label: 'Only English characters, numbers, and symbols',
      isMet: password.length > 0 && /^[\x20-\x7E]+$/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number',
      isMet: /[0-9]/.test(password),
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter',
      isMet: /[A-Z]/.test(password),
    },
    {
      id: 'strength',
      label: 'Password is not too weak',
      isMet: password.length > 0 && zxcvbn(password).score >= 2,
    },
  ];

  return (
    <div className={style['password-requirements']}>
      {requirements.map((req) => (
        <div
          key={req.id}
          className={`${style['password-requirements__item']} ${
            req.isMet
              ? style['password-requirements__item--met']
              : hasError
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
