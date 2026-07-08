import { useAuthSync } from '@/hooks';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  useAuthSync();

  return <Outlet />;
}