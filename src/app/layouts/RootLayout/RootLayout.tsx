import { Outlet } from 'react-router-dom';
import { useAuthSync } from "@/entities/session";
import { useOrderNotifications } from "@/app/providers/notifications/useOrderNotifications";

export default function RootLayout() {
  useAuthSync();
  useOrderNotifications();

  return <Outlet />;
}