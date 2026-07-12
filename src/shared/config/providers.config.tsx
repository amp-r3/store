import { FcGoogle } from 'react-icons/fc';
import { FaRegEnvelope, FaTelegram } from 'react-icons/fa';

export const PROVIDER_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
}> = {
  'google': {
    label: 'Google',
    icon: <FcGoogle size={18} />,
  },
  'email': {
    label: 'Email',
    icon: <FaRegEnvelope size={16} />,
  },
  'custom:telegram': {
    label: 'Telegram',
    icon: <FaTelegram size={18} color="#2AABEE" />,
  },
};