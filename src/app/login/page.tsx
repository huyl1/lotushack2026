"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Box,
  Button,
  Callout,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
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
    <Flex direction="column" gap="6">
      {/* Header */}
      <Flex direction="column" gap="2" className="animate-fade-up delay-2">
        <h1 className="font-serif text-3xl tracking-tight">Welcome back</h1>
        <Text size="2" className="text-muted">
          Sign in to continue to Edify
        </Text>
      </Flex>

      <Separator size="4" className="animate-fade-up delay-3" />

      {error && (
        <Callout.Root color="red" size="1" className="animate-fade-up">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Form */}
      <form>
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="2" className="animate-fade-up delay-3">
            <Text as="label" size="2" weight="medium" htmlFor="email">
              Email address
            </Text>
            <TextField.Root
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              size="3"
              required
            />
          </Flex>

          <Flex direction="column" gap="2" className="animate-fade-up delay-4">
            <Text as="label" size="2" weight="medium" htmlFor="password">
              Password
            </Text>
            <TextField.Root
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              size="3"
              required
            />
          </Flex>

          <Flex gap="3" className="animate-fade-up delay-5" pt="2">
            <Button
              size="3"
              type="submit"
              variant="solid"
              highContrast
              style={{ flex: 1 }}
              disabled={pending}
              formAction={loginAction}
            >
              {loginPending ? "Signing in…" : "Sign in"}
            </Button>
            <Button
              size="3"
              type="submit"
              variant="outline"
              highContrast
              style={{ flex: 1 }}
              disabled={pending}
              formAction={signupAction}
            >
              {signupPending ? "Creating…" : "Sign up"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}

export default function LoginPage() {
  return (
    <Flex flexGrow="1" direction="column">
      {/* Back nav */}
      <Flex px="6" py="5" className="animate-fade-up delay-1">
        <Button variant="ghost" color="gray" size="2" asChild>
          <Link href="/">
            <ArrowLeftIcon />
            Home
          </Link>
        </Button>
      </Flex>

      {/* Login form */}
      <Flex flexGrow="1" align="center" justify="center" px="6" pb="16">
        <Box width="100%" style={{ maxWidth: 360 }}>
          <LoginForm />
        </Box>
      </Flex>
    </Flex>
  );
}
