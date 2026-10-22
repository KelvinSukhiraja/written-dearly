import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import type { Invitation, Guest } from "@/lib/supabase/types";
import { guestSummary } from "@/lib/guests/summary";
import { parseInvitationTheme } from "@/lib/invitations/theme";
import { WeddingMark } from "@/components/templates/wedding-mark";

export function DashboardHome({
  invitation,
  guests,
}: {
  invitation: Invitation;
  guests: Guest[];
}) {
  const summary = guestSummary(guests);
  const theme = parseInvitationTheme(invitation.theme);
  const detailsReady = !!(
    invitation.bride_name &&
    invitation.groom_name &&
    invitation.wedding_date &&
    (invitation.venue_name || theme.events.some((e) => e.venue_name))
  );
  const next = !detailsReady
    ? {
        title: "Make the invitation yours",
        text: "Start with a design, your names, date and venue. Photos and music can follow.",
        label: "Choose a design",
        href: "/dashboard/invitation/designs",
      }
    : !guests.length
      ? {
          title: "Build your guest list",
          text: "Add names, WhatsApp numbers and how many people each invitation includes.",
          label: "Add guests",
          href: "/dashboard/guests",
        }
      : !invitation.published
        ? {
            title: "Review and publish",
            text: "Preview the invitation, then publish it before sharing personal links.",
            label: "Review invitation",
            href: "/dashboard/invitation?section=publish",
          }
        : {
            title: "Invite your guests",
            text: "Open a guest's WhatsApp message to share their personal link. Track replies here as they arrive.",
            label: "Open guest list",
            href: "/dashboard/guests",
          };
  const steps = [
    {
      title: "Choose & edit",
      text: "Design, names, photos, events and music.",
      href: "/dashboard/invitation",
      done: detailsReady,
    },
    {
      title: "Add guests",
      text: "Phone numbers and companion allowances.",
      href: "/dashboard/guests",
      done: guests.length > 0,
    },
    {
      title: "Publish & share",
      text: "Preview, publish, then send through WhatsApp.",
      href: invitation.published
        ? "/dashboard/guests"
        : "/dashboard/invitation?section=publish",
      done: false,
    },
    {
      title: "Welcome guests",
      text: "Share QR passes, scan and confirm arrivals.",
      href: "/dashboard/check-in",
      done: false,
    },
  ];
  return (
    <div className="workspace-home">
      <header className="home-welcome">
        <div>
          <p className="eyebrow-label">Your wedding workspace</p>
          <h1 className="studio-heading">
            {[invitation.bride_name, invitation.groom_name]
              .filter(Boolean)
              .join(" & ") || "Let's get started"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            A little planning. A beautiful beginning.
          </p>
        </div>
        <span className="status-pill">
          {invitation.published ? "Invitation published" : "Invitation draft"}
        </span>
      </header>
      <section className="home-feature" aria-label="Your next step">
        <div className="home-feature-content">
          <p className="eyebrow-label">A little closer to your day</p>
          <h2>{next.title}</h2>
          <p>{next.text}</p>
          <Link className="btn btn-primary shrink-0" href={next.href}>
            {next.label} <ArrowIcon />
          </Link>
        </div>
        <div className="home-identity" aria-hidden="true">
          <WeddingMark />
          <p>
            Made for
            <br />
            your forever
          </p>
        </div>
      </section>
      <div className="home-section-title">
        <h2>Your wedding, step by step</h2>
        <span className="text-sm text-muted">
          From invitation to celebration
        </span>
      </div>
      <section aria-label="Invitation progress" className="home-steps">
        {steps.map((step, i) => (
          <Link className="flow-step" key={step.title} href={step.href}>
            <span
              className="step-marker"
              aria-label={step.done ? "Complete" : `Step ${i + 1}`}
            >
              {step.done ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
          </Link>
        ))}
      </section>
      <section aria-label="Guest overview">
        <div className="home-section-title">
          <h2>Guest overview</h2>
          <Link
            className="text-sm text-accent underline underline-offset-4"
            href="/dashboard/guests"
          >
            Manage guests
          </Link>
        </div>
        <dl className="workspace-metrics grid grid-cols-2 sm:grid-cols-4">
          {[
            ["People invited", summary.reserved],
            ["People attending", summary.confirmed],
            ["Invitations awaiting reply", summary.pending],
            ["People checked in", summary.arrived],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="stat-number mt-2">{value}</dd>
            </div>
          ))}
        </dl>
        {!guests.length && (
          <p className="mt-4 text-sm text-muted">
            Your guest totals will appear here after you add your first guest.
          </p>
        )}
      </section>
      <div className="home-footer">
        <WeddingMark />
        <p>Wedding day? Scan a pass or find someone by name.</p>
        <Link className="btn btn-secondary" href="/dashboard/check-in">
          Open check-in <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}
