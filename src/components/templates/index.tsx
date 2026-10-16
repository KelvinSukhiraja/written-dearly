import { ClassicInvitation } from "@/components/templates/classic";
import { CoastalInvitation } from "@/components/templates/coastal";
import type { Invitation, GuestContext } from "@/lib/supabase/types";

const TEMPLATES = {
  classic: ClassicInvitation,
  coastal: CoastalInvitation,
} as const;

export function InvitationTemplate({
  invitation,
  componentKey,
  guest,
  token,
  preview = false,
}: {
  invitation: Invitation;
  componentKey: string | null;
  guest?: GuestContext | null;
  token?: string;
  preview?: boolean;
}) {
  const Template =
    (componentKey && componentKey in TEMPLATES
      ? TEMPLATES[componentKey as keyof typeof TEMPLATES]
      : ClassicInvitation) ?? ClassicInvitation;

  return (
    <Template
      invitation={invitation}
      guest={guest}
      token={token}
      preview={preview}
    />
  );
}
