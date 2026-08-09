import { SignInButton } from '../sign-in-button/SignInButton';
import { SIGN_IN_PROVIDER_ORDER, type AuthProviderId, type OAuthProviderId } from '@/shared/config';
import style from './auth-provider-list.module.scss';

interface AuthProviderListProps {
  onEmailClick: () => void;
  onProviderClick: (provider: OAuthProviderId) => void;
  failedProviders: AuthProviderId[];
  pendingProvider: OAuthProviderId | null;
}

export const AuthProviderList = ({
  onEmailClick,
  onProviderClick,
  failedProviders,
  pendingProvider,
}: AuthProviderListProps) => (
  <div className={style['auth-provider-list']}>
    {SIGN_IN_PROVIDER_ORDER.map((provider) => (
      <SignInButton
        key={provider}
        provider={provider}
        hasFailed={failedProviders.includes(provider)}
        isLoading={pendingProvider === provider}
        disabled={pendingProvider !== null && pendingProvider !== provider}
        onClick={() => (provider === 'email' ? onEmailClick() : onProviderClick(provider))}
      />
    ))}
  </div>
);
