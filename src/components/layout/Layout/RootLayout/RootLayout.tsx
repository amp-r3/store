import { useAuthSync, useTheme } from '@/hooks';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  useAuthSync();
  useTheme();

  return <Outlet />;
}