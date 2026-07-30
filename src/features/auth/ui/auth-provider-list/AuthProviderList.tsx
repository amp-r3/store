import { SignInButton } from '../sign-in-button/SignInButton';
import { SIGN_IN_PROVIDER_ORDER, type AuthProviderId, type OAuthProviderId } from '@/shared/config';
import style from './auth-provider-list.module.scss';

interface AuthProviderListProps {
  onEmailClick: () => void;
  onProviderClick: (provider: OAuthProviderId) => void;
  blockedProviders: AuthProviderId[];
}

export const AuthProviderList = ({ onEmailClick, onProviderClick, blockedProviders }: AuthProviderListProps) => (
  <div className={style['auth-provider-list']}>
    {SIGN_IN_PROVIDER_ORDER.map((provider) => (
      <SignInButton
        key={provider}
        provider={provider}
        disabled={blockedProviders.includes(provider)}
        onClick={() => (provider === 'email' ? onEmailClick() : onProviderClick(provider))}
      />
    ))}
  </div>
);
