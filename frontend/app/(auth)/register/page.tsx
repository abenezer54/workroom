import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create agency account"
      description="Set up an agency admin account for your Workroom workspace."
    >
      <AuthForm mode="register" />
    </AuthLayout>
  );
}
