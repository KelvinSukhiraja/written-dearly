"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type ActionResult } from "@/app/dashboard/actions";
import { PageReveal } from "@/components/motion/page-reveal";
import styles from "./auth.module.css";

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
    <PageReveal className={styles.formPanel}>
      <p className={styles.eyebrow}>Your wedding workspace</p>
      <h1 data-reveal>
        {mode === "signup" ? "Create your studio" : "Welcome back"}
      </h1>
      <p data-reveal className={styles.intro}>
        {mode === "signup"
          ? "Sign up to write, send, and manage your wedding invitation."
          : "Sign in to manage your invitation and guest list."}
      </p>

      <form action={formAction} className={styles.form} aria-busy={pending} data-reveal>
        <input type="hidden" name="next" value={nextPath} />
        {mode === "signup" ? (
          <div className={styles.field}>
            <label htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className={`input ${styles.input}`}
            />
          </div>
        ) : null}
        <div className={styles.field}>
          <label htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`input ${styles.input}`}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={`input ${styles.input}`}
          />
        </div>
        {state && !state.ok ? (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={`btn ${styles.submit}`}
        >
          {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p data-reveal className={styles.switch}>
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New couple?{" "}
            <Link href="/signup">
              Create an account
            </Link>
          </>
        )}
      </p>
    </PageReveal>
  );
}
