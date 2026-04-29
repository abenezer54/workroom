import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Log in"
      description="Access your agency workspace or client portal."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
