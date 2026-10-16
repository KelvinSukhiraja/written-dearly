"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type ActionResult } from "@/app/dashboard/actions";
import { PageReveal } from "@/components/motion/page-reveal";
import { Wordmark } from "@/components/wordmark";

export function AuthForm({
  mode,
  nextPath = "/dashboard",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const action = mode === "signup" ? signUp : signIn;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <PageReveal className="wd-frame relative mx-auto w-full max-w-md border border-border p-8 sm:p-10">
      <Wordmark href="/" />
      <h1 data-reveal className="mt-8 text-4xl font-semibold tracking-tight">
        {mode === "signup" ? "Create your studio" : "Welcome back"}
      </h1>
      <p data-reveal className="mt-3 text-[15px] leading-7 text-muted">
        {mode === "signup"
          ? "Sign up to write, send, and manage your wedding invitation."
          : "Sign in to manage your invitation and guest list."}
      </p>

      <form action={formAction} className="mt-10 space-y-4" data-reveal>
        <input type="hidden" name="next" value={nextPath} />
        {mode === "signup" ? (
          <div>
            <label htmlFor="name" className="text-sm text-muted">
              Your name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="input mt-1.5"
            />
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="input mt-1.5"
          />
        </div>
        {state && !state.ok ? (
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full py-2.5"
        >
          {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p data-reveal className="mt-8 text-sm text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New couple?{" "}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </PageReveal>
  );
}
