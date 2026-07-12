import { Outlet } from 'react-router-dom';
import { useAuthSync } from "@/entities/session";

export default function RootLayout() {
  useAuthSync();

  return <Outlet />;
}