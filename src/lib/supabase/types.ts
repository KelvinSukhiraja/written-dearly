export type GuestSide = "bride" | "groom";
export type RsvpStatus = "pending" | "attending" | "declined";
export type EventResponses = Record<string, "attending" | "declined">;

export type Profile = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type Invitation = {
  id: string;
  user_id: string;
  slug: string;
  template_id: string;
  groom_name: string | null;
  bride_name: string | null;
  wedding_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  story: string | null;
  cover_photo_url: string | null;
  theme: Record<string, unknown>;
  published: boolean;
  created_at: string;
};

export type Guest = {
  id: string;
  invitation_id: string;
  name: string;
  side: GuestSide;
  group: string | null;
  invited_count: number;
  rsvp_status: RsvpStatus;
  rsvp_attending_count: number | null;
  rsvp_message: string | null;
  responded_at: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  email: string | null;
  phone: string | null;
  table_name: string | null;
  dietary: string | null;
  notes: string | null;
  staff_notes: string | null;
  public_token: string;
  checkin_token: string;
  event_ids: string[];
  checked_in_count: number;
  extra_seats: number;
  version: number;
  invitation_sent_at?: string | null;
  event_responses?: EventResponses;
};

export type GuestContext = Pick<
  Guest,
  | "name"
  | "invited_count"
  | "rsvp_status"
  | "rsvp_attending_count"
  | "rsvp_message"
  | "dietary"
  | "table_name"
  | "checkin_token"
  | "event_ids"
> & {
  event_responses?: EventResponses;
  version?: number;
  event_rsvp_available?: boolean;
};
