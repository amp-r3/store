import { RiLockPasswordLine } from "react-icons/ri";
import { AuthCard } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export const LoginPage = () => (
  <AuthCard
    title="Welcome Back"
    subtitle="Log in to access your orders and settings"
    icon={<RiLockPasswordLine />}
  >
    <LoginForm />
  </AuthCard>
);
