import { Link } from 'react-router';
import style from './auth-switch-link.module.scss';

interface AuthSwitchLinkProps {
  prompt: string;
  to: string;
  label: string;
}

export const AuthSwitchLink = ({ prompt, to, label }: AuthSwitchLinkProps) => (
  <p className={style['auth-switch-link']}>
    {prompt} <Link to={to} className={style['auth-switch-link__link']}>{label}</Link>
  </p>
);
