import { ReactNode } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaRegEnvelope, FaTelegram } from 'react-icons/fa';
import { AuthProviderId } from './auth';

export interface ProviderConfig {
  label: string;
  icon: ReactNode;
  /** CSS-safe slug for BEM modifier classnames — `custom:telegram` isn't a valid class-name segment. */
  slug: string;
}

export const PROVIDER_CONFIG: Record<AuthProviderId, ProviderConfig> = {
  google: {
    label: 'Google',
    icon: <FcGoogle />,
    slug: 'google',
  },
  email: {
    label: 'Email',
    icon: <FaRegEnvelope />,
    slug: 'email',
  },
  'custom:telegram': {
    label: 'Telegram',
    icon: <FaTelegram />,
    slug: 'telegram',
  },
};

export const SIGN_IN_PROVIDER_ORDER: readonly AuthProviderId[] = ['email', 'google', 'custom:telegram'];

const PROVIDER_CONFIG_BY_KEY = new Map(
  Object.entries(PROVIDER_CONFIG).map(([id, config]) => [id.toLowerCase(), config])
);

/** Looks up a provider config by an arbitrary string (e.g. from Supabase's
 * `app_metadata.providers`), unlike `PROVIDER_CONFIG` which is keyed by the
 * known `AuthProviderId` union. */
export const getProviderConfig = (id: string): ProviderConfig | undefined =>
  PROVIDER_CONFIG_BY_KEY.get(id.toLowerCase());
