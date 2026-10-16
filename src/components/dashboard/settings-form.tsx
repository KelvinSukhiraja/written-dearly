"use client";

import { useActionState } from "react";
import { updateSettings, type ActionResult } from "@/app/dashboard/actions";
import type { Invitation, Profile } from "@/lib/supabase/types";

export function SettingsForm({
  profile,
  invitation,
  publicUrl,
}: {
  profile: Profile;
  invitation: Invitation;
  publicUrl: string;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(updateSettings, null);

  return (
    <form action={formAction} className="max-w-xl space-y-4" data-reveal>
      <section className="card p-6" data-hover="card">
        <h2 className="text-xl font-semibold tracking-tight">Account</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm text-muted">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={profile.name}
              className="input mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              value={profile.email}
              readOnly
              className="input mt-1.5 bg-surface text-muted"
            />
          </div>
        </div>
      </section>

      <section className="card p-6" data-hover="card">
        <h2 className="text-xl font-semibold tracking-tight">Invitation URL</h2>
        <p className="mt-1 text-sm text-muted">
          Guests will open this link: {publicUrl}
        </p>
        <div className="mt-4">
          <label htmlFor="slug" className="text-sm text-muted">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={invitation.slug}
            className="input mt-1.5"
          />
        </div>
      </section>

      {state?.ok === false ? (
        <p className="text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-muted">Settings saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary px-5 py-2.5"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
