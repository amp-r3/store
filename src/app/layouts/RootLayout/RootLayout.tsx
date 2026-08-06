import { Outlet, ScrollRestoration } from 'react-router';
import { useAuthSync } from "@/app/providers/auth/useAuthSync";
import { useNotificationsSync } from "@/app/providers/notifications/useNotificationsSync";

export default function RootLayout() {
  useAuthSync();
  useNotificationsSync();

  return (
    <>
      <Outlet />
      {/* Keyed by pathname only, so opening a drawer/modal via a search param
          (e.g. orders `?order=`) doesn't reset scroll — only real page changes do. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}