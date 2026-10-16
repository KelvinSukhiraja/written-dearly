"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/dashboard/actions";
import { WeddingMark } from "@/components/templates/wedding-mark";
const items = [
  ["/dashboard", "Home", "home"],
  ["/dashboard/invitation", "Invitation", "letter"],
  ["/dashboard/guests", "Guests", "guests"],
  ["/dashboard/check-in", "Check-in", "scan"],
] as const;
function NavIcon({ name }: { name: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "home" ? (
        <>
          <path d="m3 10 9-7 9 7v10H3Z" />
          <path d="M9 20v-7h6v7" />
        </>
      ) : name === "letter" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </>
      ) : name === "guests" ? (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5" />
        </>
      ) : (
        <>
          <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12h10" />
          <path d="m9 8 3-2 3 2v8l-3 2-3-2Z" />
        </>
      )}
    </svg>
  );
}
function Brand() {
  return (
    <Link
      href="/dashboard"
      className="workspace-brand"
      aria-label="Written Dearly home"
    >
      <WeddingMark variant="monogram" />
      <span>
        Written Dearly<small>THE WEDDING WORKSPACE</small>
      </span>
    </Link>
  );
}
function Navigation() {
  const path = usePathname();
  return (
    <nav aria-label="Main navigation" className="workspace-navigation">
      {items.map(([href, label, icon]) => {
        const active =
          path === href ||
          (href === "/dashboard/invitation" &&
            (path.startsWith(href + "/") || path === "/dashboard/preview"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nav-item ${active ? "nav-item-active" : ""}`}
          >
            <NavIcon name={icon} />
            <span>{label}</span>
            <span className="nav-active-dot" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
function MoreTools() {
  const path = usePathname();
  return (
    <div className="workspace-secondary">
      <Link
        className="nav-item"
        href="/dashboard/settings"
        aria-current={path === "/dashboard/settings" ? "page" : undefined}
      >
        Settings
      </Link>
      <details
        open={[
          "/dashboard/seating",
          "/dashboard/messages",
          "/dashboard/emails",
        ].includes(path)}
      >
        <summary>Additional tools</summary>
        {[
          ["seating", "Seating"],
          ["messages", "Guest messages"],
          ["emails", "Email invitations"],
        ].map(([route, label]) => (
          <Link
            key={route}
            className="nav-item"
            href={`/dashboard/${route}`}
            aria-current={path === `/dashboard/${route}` ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </details>
      <form action={signOut}>
        <button className="nav-item w-full text-left">Sign out</button>
      </form>
    </div>
  );
}
export function Sidebar({ coupleName }: { coupleName: string }) {
  const path = usePathname();
  return (
    <>
      <a href="#workspace-content" className="workspace-skip">
        Skip to content
      </a>
      <header className="workspace-mobile-header lg:hidden">
        <div className="workspace-mobile-brand">
          <Brand />
          <div key={path} className="workspace-mobile-more">
            <button type="button" popoverTarget="workspace-more" aria-label="More workspace options" className="workspace-more-trigger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
              <span>More</span>
            </button>
            <div id="workspace-more" popover="auto">
              <p className="eyebrow-label">Workspace options</p>
              <MoreTools />
            </div>
          </div>
        </div>
        <Navigation />
      </header>
      <aside className="workspace-sidebar fixed inset-y-0 left-0 z-30 hidden w-60 flex-col lg:flex">
        <Brand />
        <div className="workspace-couple">
          <span className="eyebrow-label">A celebration for</span>
          <p>{coupleName}</p>
        </div>
        <div className="workspace-nav-section">
          <p className="eyebrow-label">Your workspace</p>
          <Navigation />
        </div>
        <div className="workspace-sidebar-bottom">
          <MoreTools />
          <p className="workspace-brand-note">
            Thoughtfully planned.
            <br />
            Beautifully shared.
          </p>
        </div>
      </aside>
    </>
  );
}
