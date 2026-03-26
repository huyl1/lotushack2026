"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup } from "@/app/(auth)/login/actions";
import { TEST_USERS } from "@/app/(auth)/login/constants";

export function LoginForm() {
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

  function fillTestUser(email: string, password: string) {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-lg)" }}>
      {/* Header */}
      <div className="flex flex-col animate-fade-up" style={{ gap: "var(--space-sm)" }}>
        <Link
          href="/"
          className="flex items-center gap-2 mb-4 text-caption transition-colors"
          style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2L3 7l5 5M3 7h10" />
          </svg>
          Back to home
        </Link>
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-tier-match)" }}
          />
          <span className="text-heading tracking-tight">Edify</span>
        </div>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to your consultant account
        </p>
      </div>

      <div
        className="h-px animate-fade-up"
        style={{ background: "var(--color-border)", animationDelay: "50ms" }}
      />

      {/* Test users */}
      <div
        className="flex flex-col animate-fade-up"
        style={{ gap: "var(--space-sm)", animationDelay: "60ms" }}
      >
        <span
          className="text-caption uppercase"
          style={{ color: "var(--color-text-muted)", letterSpacing: "0.06em", fontSize: 11 }}
        >
          Quick login — Test accounts
        </span>
        <div className="flex" style={{ gap: "var(--space-sm)" }}>
          {TEST_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => fillTestUser(user.email, user.password)}
              className="flex-1 flex flex-col items-start px-3 py-2.5 text-left cursor-pointer transition-colors"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span className="text-caption" style={{ color: "var(--color-text-primary)" }}>
                {user.label}
              </span>
              <span className="text-mono" style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
                {user.email}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
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

      {/* Form */}
      <form>
        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          <div className="flex flex-col animate-fade-up" style={{ gap: 6, animationDelay: "80ms" }}>
            <label htmlFor="email" className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-10 px-3 text-body outline-none transition-colors"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div className="flex flex-col animate-fade-up" style={{ gap: 6, animationDelay: "120ms" }}>
            <label htmlFor="password" className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-10 px-3 text-body outline-none transition-colors"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div
            className="flex pt-1 animate-fade-up"
            style={{ gap: "var(--space-sm)", animationDelay: "160ms" }}
          >
            <button
              type="submit"
              disabled={pending}
              formAction={loginAction}
              className="flex-1 h-10 text-subhead transition-colors cursor-pointer disabled:opacity-50"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-sm)",
                border: "none",
              }}
            >
              {loginPending ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="submit"
              disabled={pending}
              formAction={signupAction}
              className="flex-1 h-10 text-subhead transition-colors cursor-pointer disabled:opacity-50"
              style={{
                background: "transparent",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
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
