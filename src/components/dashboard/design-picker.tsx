"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { chooseDesign } from "@/app/dashboard/invitation/design-actions";
import { invitationDesigns, supportedDesign } from "@/lib/invitations/designs";

export function DesignPicker({
  designs,
  selected,
  slug,
}: {
  designs: { id: string; component_key: string }[];
  selected: string;
  slug: string;
}) {
  const [state, action, pending] = useActionState(
    async (
      previous: Awaited<ReturnType<typeof chooseDesign>> | null,
      form: FormData,
    ) => {
      try {
        return await chooseDesign(previous, form);
      } catch {
        return {
          ok: false as const,
          error:
            "Your design could not be saved. Check your connection and try again.",
        };
      }
    },
    null,
  );
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      router.push("/dashboard/invitation");
      router.refresh();
    }
  }, [state, router]);
  return (
    <div className="space-y-5">
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`notice ${state.ok ? "" : "notice-error"}`}
        >
          {state.ok ? "Design saved. Opening your invitation…" : state.error}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {designs
          .filter((d) => supportedDesign(d.component_key))
          .map((design) => {
            const info =
              invitationDesigns[
                design.component_key as keyof typeof invitationDesigns
              ];
            return (
              <article className="card overflow-hidden" key={design.id}>
                <div
                  className="design-cover"
                  aria-label={`${info.name} design illustration`}
                  style={
                    design.component_key === "coastal"
                      ? {
                          background: "#eae2d9",
                          color: "#402518",
                          backgroundImage:
                            "linear-gradient(#eae2d999, #eae2d966), url('/invitation-art/coastal/cover.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  <small>The wedding of</small>
                  <span>Alex & Jamie</span>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">{info.name}</h2>
                    {design.id === selected && (
                      <span className="status-pill">Current design</span>
                    )}
                  </div>
                  <p className="text-sm text-muted leading-6">
                    {info.description}
                  </p>
                  <form action={action}>
                    <input type="hidden" name="template_id" value={design.id} />
                    <button disabled={pending} className="btn btn-primary">
                      {pending ? "Saving…" : "Use this design"}
                    </button>
                  </form>
                  <Link
                    className="inline-block text-sm text-accent underline"
                    href={`/preview/${encodeURIComponent(slug)}?design=${design.component_key}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview with your details
                  </Link>
                </div>
              </article>
            );
          })}
        {!designs.some((d) => d.component_key === "coastal") && (
          <article className="card overflow-hidden">
            <div
              className="design-cover"
              style={{ background: "#eae2d9", color: "#402518" }}
            >
              <small>The wedding of</small>
              <span>Alex &amp; Jamie</span>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Coastal</h2>
                <span className="status-pill">Preview available</span>
              </div>
              <p className="text-sm text-muted leading-6">
                {invitationDesigns.coastal.description}
              </p>
              <Link
                className="btn btn-secondary"
                href={`/preview/${encodeURIComponent(slug)}?design=coastal`}
                target="_blank"
                rel="noreferrer"
              >
                Preview with your details
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
