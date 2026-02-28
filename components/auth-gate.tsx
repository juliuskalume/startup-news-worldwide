"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, PropsWithChildren, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

const PASSWORD_MIN_LENGTH = 6;
const PUBLIC_AUTH_EXEMPT_ROUTES = new Set(["/", "/terms", "/privacy"]);

export function AuthGate({ children }: PropsWithChildren): JSX.Element {
  const pathname = usePathname();
  const {
    user,
    loading,
    requiresEmailVerification,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resendVerificationEmail,
    refreshVerificationStatus,
    signOutUser,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const isAuthExemptRoute = PUBLIC_AUTH_EXEMPT_ROUTES.has(pathname);

  const clearFeedback = (): void => {
    setMessage("");
    setError("");
  };

  const title = useMemo(
    () => (mode === "signin" ? "Sign In" : "Create Account"),
    [mode]
  );

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    clearFeedback();

    if (!email.trim().length) {
      setError("Email is required.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        setMessage("Signed in successfully.");
      } else {
        await signUpWithEmail(email.trim(), password);
        setMessage("Verification email sent. Please verify to continue.");
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    clearFeedback();
    try {
      setSubmitting(true);
      await signInWithGoogle();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    clearFeedback();
    try {
      setSubmitting(true);
      await resendVerificationEmail();
      setMessage("Verification email sent again.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to send email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckVerification = async (): Promise<void> => {
    clearFeedback();
    try {
      setSubmitting(true);
      const verified = await refreshVerificationStatus();
      if (!verified) {
        setError("Email still not verified. Please check your inbox.");
      }
    } catch {
      setError("Could not verify status. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthExemptRoute && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-subtle dark:bg-[#070f1c]">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main shadow-soft dark:border-[#223148] dark:bg-[#10192c] dark:text-[#ebf2ff]">
          <span className="spinner-ring" />
          Preparing your account...
        </div>
      </div>
    );
  }

  if (!isAuthExemptRoute && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-subtle px-4 py-6 dark:bg-[#070f1c]">
        <section className="w-full max-w-md rounded-3xl border border-border-light bg-background-light p-5 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-primary/30 bg-background-light">
              <img
                src="/app-logo.png"
                alt="Startup News Worldwide logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Startup News
              </p>
              <h1 className="text-lg font-bold text-text-main dark:text-[#edf3ff]">Worldwide</h1>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-background-subtle p-1 dark:bg-[#0d1728]">
            <button
              type="button"
              aria-label="Switch to sign in mode"
              onClick={() => {
                clearFeedback();
                setMode("signin");
              }}
              className={cn(
                "focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition",
                mode === "signin"
                  ? "bg-background-light text-text-main shadow-soft dark:bg-[#1a2740] dark:text-[#edf3ff]"
                  : "text-text-muted dark:text-[#8ea6cf]"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              aria-label="Switch to sign up mode"
              onClick={() => {
                clearFeedback();
                setMode("signup");
              }}
              className={cn(
                "focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition",
                mode === "signup"
                  ? "bg-background-light text-text-main shadow-soft dark:bg-[#1a2740] dark:text-[#edf3ff]"
                  : "text-text-muted dark:text-[#8ea6cf]"
              )}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">{title}</h2>
          <p className="mt-1 text-sm text-text-muted dark:text-[#8ea6cf]">
            Use email and password, then verify email to continue.
          </p>

          <form className="mt-4 space-y-3" onSubmit={(event) => void handleEmailSubmit(event)}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-[#8ea6cf]">
                Email
              </span>
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                className="focus-ring w-full rounded-2xl border border-border-light bg-background-light px-3 py-2 text-sm text-text-main dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff]"
                placeholder="you@example.com"
                aria-label="Email address"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-[#8ea6cf]">
                Password
              </span>
              <input
                type="password"
                value={password}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                onChange={(event) => setPassword(event.target.value)}
                className="focus-ring w-full rounded-2xl border border-border-light bg-background-light px-3 py-2 text-sm text-text-main dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff]"
                placeholder="Minimum 6 characters"
                aria-label="Password"
              />
            </label>

            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-[#8ea6cf]">
                  Confirm Password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="focus-ring w-full rounded-2xl border border-border-light bg-background-light px-3 py-2 text-sm text-text-main dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff]"
                  placeholder="Re-enter password"
                  aria-label="Confirm password"
                />
              </label>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              aria-label={mode === "signin" ? "Sign in with email" : "Create account"}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <span className="spinner-ring" /> : <MaterialIcon name="mail" className="text-[18px]" />}
              {mode === "signin" ? "Sign In with Email" : "Create Account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border-light dark:bg-[#2a3853]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-[#8ea6cf]">
              or
            </span>
            <span className="h-px flex-1 bg-border-light dark:bg-[#2a3853]" />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleGoogleSignIn()}
            aria-label="Continue with Google"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MaterialIcon name="login" className="text-[18px]" />
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs text-text-muted dark:text-[#8ea6cf]">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="focus-ring rounded-sm font-semibold text-primary">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="focus-ring rounded-sm font-semibold text-primary">
              Privacy Policy
            </Link>
            .
          </p>

          {message ? (
            <p className="mt-3 rounded-xl bg-primary-light px-3 py-2 text-xs font-medium text-primary dark:bg-[#132845]">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-xl bg-[#ffe8eb] px-3 py-2 text-xs font-medium text-[#b32646] dark:bg-[#3a1a24] dark:text-[#ff97ad]">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  if (!isAuthExemptRoute && requiresEmailVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-subtle px-4 py-6 dark:bg-[#070f1c]">
        <section className="w-full max-w-md rounded-3xl border border-border-light bg-background-light p-5 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <h1 className="text-lg font-bold text-text-main dark:text-[#edf3ff]">Verify Your Email</h1>
          <p className="mt-2 text-sm text-text-muted dark:text-[#8ea6cf]">
            We sent a verification link to <strong>{user?.email ?? "your email"}</strong>. Verify it to proceed.
          </p>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => void handleCheckVerification()}
              disabled={submitting}
              aria-label="I've verified my email"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MaterialIcon name="verified" className="text-[18px]" />
              I&apos;ve Verified My Email
            </button>
            <button
              type="button"
              onClick={() => void handleResendVerification()}
              disabled={submitting}
              aria-label="Resend verification email"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MaterialIcon name="forward_to_inbox" className="text-[18px]" />
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              aria-label="Sign out"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-border-light bg-background-light px-4 py-2 text-sm font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:bg-[#0d1728] dark:text-[#edf3ff]"
            >
              <MaterialIcon name="logout" className="text-[18px]" />
              Sign Out
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-text-muted dark:text-[#8ea6cf]">
            Review{" "}
            <Link href="/terms" className="focus-ring rounded-sm font-semibold text-primary">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="focus-ring rounded-sm font-semibold text-primary">
              Privacy Policy
            </Link>
            .
          </p>

          {message ? (
            <p className="mt-3 rounded-xl bg-primary-light px-3 py-2 text-xs font-medium text-primary dark:bg-[#132845]">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-xl bg-[#ffe8eb] px-3 py-2 text-xs font-medium text-[#b32646] dark:bg-[#3a1a24] dark:text-[#ff97ad]">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  return <>{children}</>;
}
