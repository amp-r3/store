import { RiUserAddLine } from "react-icons/ri";
import { AuthCard } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export const RegisterPage = () => (
  <AuthCard
    title="Create an Account"
    subtitle="Join us to start managing your orders"
    icon={<RiUserAddLine />}
  >
    <RegisterForm />
  </AuthCard>
);
