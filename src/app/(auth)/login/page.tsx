import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>
        <LoginForm />
      </div>
    </div>
  );
}
