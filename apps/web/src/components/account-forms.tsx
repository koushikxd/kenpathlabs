"use client";

import { Button } from "@kenpathlabs/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@kenpathlabs/ui/components/field";
import { Input } from "@kenpathlabs/ui/components/input";
import { Spinner } from "@kenpathlabs/ui/components/spinner";
import { useState } from "react";

import { signIn, signUp } from "@/lib/auth-client";
import { useFeedback } from "@/lib/feedback";

import { Glitch } from "./glitch";

type Mode = "sign-up" | "sign-in";
type Name = "name" | "username" | "email" | "password";
type Errors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  form?: string;
};

// Shape checks run in the browser (required, minLength, pattern, type="email"). These cover what only
// the server knows, plus the same rules for a browser that skips validation.
function toErrors(code: string | undefined, mode: Mode): Errors {
  switch (code) {
    case "USERNAME_IS_ALREADY_TAKEN":
      return { username: "That username is taken. Try another." };
    case "INVALID_USERNAME":
    case "USERNAME_TOO_SHORT":
    case "USERNAME_TOO_LONG":
      return { username: "Use 3 to 30 letters, numbers, dots or underscores." };
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return { email: "An account with this email already exists. Sign in instead." };
    case "INVALID_EMAIL":
      return { email: "Enter a valid email address." };
    case "PASSWORD_TOO_SHORT":
      return { password: "Use at least 8 characters." };
    case "PASSWORD_TOO_LONG":
      return { password: "Use at most 128 characters." };
    case "INVALID_EMAIL_OR_PASSWORD":
      return { form: "Wrong email or password." };
    default:
      return {
        form:
          mode === "sign-up" ? "Could not sign up. Try again." : "Could not sign in. Try again.",
      };
  }
}

function TextField({
  name,
  label,
  error,
  description,
  ...props
}: React.ComponentProps<typeof Input> & {
  name: Name;
  label: string;
  error?: string;
  description?: string;
}) {
  const id = `account-${name}`;
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name={name} required aria-invalid={error ? true : undefined} {...props} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function AccountForms() {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const feedback = useFeedback();
  const isSignUp = mode === "sign-up";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: Name) => String(form.get(name));
    setErrors({});
    setPending(true);
    try {
      const { error } = isSignUp
        ? await signUp({
            name: value("name"),
            username: value("username"),
            email: value("email"),
            password: value("password"),
          })
        : await signIn({ email: value("email"), password: value("password") });
      // On success the queries reset and Me re-renders signed in once me.get lands, unmounting this
      // form. It stays pending until then, so it cannot be sent twice.
      if (error) {
        feedback("wrong");
        setErrors(toErrors(error.code, mode));
        setPending(false);
      }
    } catch {
      feedback("wrong");
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
      setPending(false);
    }
  }

  function switchMode() {
    setMode(isSignUp ? "sign-in" : "sign-up");
    setErrors({});
  }

  return (
    <section aria-labelledby="account-title" className="flex flex-col gap-4 rounded-xl border p-4">
      <h2 id="account-title" className="text-sm font-medium">
        {isSignUp ? "Sign up" : "Sign in"}
      </h2>
      <form onSubmit={onSubmit}>
        <FieldSet disabled={pending}>
          <FieldGroup className="gap-4">
            {isSignUp && (
              <TextField
                name="name"
                label="Name"
                autoComplete="name"
                maxLength={50}
                error={errors.name}
              />
            )}
            {isSignUp && (
              <TextField
                name="username"
                label="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_.]+"
                description="3 to 30 letters, numbers, dots or underscores."
                error={errors.username}
              />
            )}
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              error={errors.password}
            />
            {errors.form && (
              <p role="alert" className="text-xs text-destructive">
                <Glitch>{errors.form}</Glitch>
              </p>
            )}
            <Button type="submit" size="lg">
              {pending && <Spinner data-icon="inline-start" />}
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        {isSignUp ? "Have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          disabled={pending}
          className="tap-target rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </section>
  );
}
