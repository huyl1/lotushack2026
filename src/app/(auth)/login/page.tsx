"use client";

import { useActionState } from "react";
import { login, signup } from "./actions";

function LoginForm() {
  const [loginState, loginAction, loginPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await login(formData);
      return result ?? null;
    },
    null
  );

  const [signupState, signupAction, signupPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signup(formData);
      return result ?? null;
    },
    null
  );

  const pending = loginPending || signupPending;
  const error = loginState?.error || signupState?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 animate-fade-up">
        <h1 className="text-display">Edify</h1>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to your consultant account
        </p>
      </div>

      <div
        className="h-px animate-fade-up"
        style={{ background: "var(--color-border)", animationDelay: "50ms" }}
      />

      {error && (
        <div
          className="animate-fade-up rounded-sm px-3 py-2 text-body-sm"
          style={{
            background: "var(--color-destructive-dim)",
            color: "var(--color-destructive)",
            borderRadius: "var(--radius-xs)",
          }}
        >
          {error}
        </div>
      )}

      <form>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <label htmlFor="email" className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-10 px-3 text-body rounded-sm border outline-none transition-colors"
              style={{
                background: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <label htmlFor="password" className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-10 px-3 text-body rounded-sm border outline-none transition-colors"
              style={{
                background: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div className="flex gap-3 pt-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <button
              type="submit"
              disabled={pending}
              formAction={loginAction}
              className="flex-1 h-10 rounded-sm text-subhead transition-colors cursor-pointer disabled:opacity-50"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-xs)",
              }}
            >
              {loginPending ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="submit"
              disabled={pending}
              formAction={signupAction}
              className="flex-1 h-10 rounded-sm text-subhead border transition-colors cursor-pointer disabled:opacity-50"
              style={{
                background: "transparent",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-xs)",
              }}
            >
              {signupPending ? "Creating..." : "Sign up"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div className="w-full" style={{ maxWidth: 380 }}>
        <LoginForm />
      </div>
    </div>
  );
}
