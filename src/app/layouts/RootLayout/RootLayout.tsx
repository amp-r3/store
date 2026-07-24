import { Outlet } from 'react-router-dom';
import { useAuthSync } from "@/entities/session";
import { useNotificationsSync } from "@/app/providers/notifications/useNotificationsSync";

export default function RootLayout() {
  useAuthSync();
  useNotificationsSync();

  return <Outlet />;
}