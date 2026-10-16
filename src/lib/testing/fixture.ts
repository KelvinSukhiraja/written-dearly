import type { Invitation, Guest } from "@/lib/supabase/types";
export const sampleInvitation: Invitation = {
  id: "00000000-0000-4000-8000-000000000001",
  user_id: "00000000-0000-4000-8000-000000000002",
  slug: "design-review",
  template_id: "00000000-0000-4000-8000-000000000003",
  bride_name: "Amelia",
  groom_name: "James",
  wedding_date: "2027-06-12T00:00:00Z",
  venue_name: "The Glasshouse",
  venue_address: "Kew Gardens, London",
  story:
    "Some stories begin with a grand gesture. Ours began with a shared table, a rainy afternoon, and a conversation neither of us wanted to end.\n\nSince then, we have found a home in the little things. Morning coffee. Long walks. Getting lost, and finding our way together.",
  cover_photo_url:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85",
  published: false,
  created_at: "2026-09-17T00:00:00Z",
  theme: {
    bride_description:
      "A collector of stories, sunlit mornings and little adventures.",
    groom_description: "Happiest with a camera in hand and Amelia by his side.",
    events: [
      {
        id: "ceremony",
        title: "The ceremony",
        date: "2027-06-12",
        time: "15:00",
        venue_name: "The Glasshouse",
        venue_address: "Kew Gardens, London",
        dress_code: "Garden formal",
      },
      {
        id: "reception",
        title: "Dinner & dancing",
        date: "2027-06-12",
        time: "18:00",
        venue_name: "The Orangery",
        venue_address: "Kew Gardens, London",
        description: "An evening of good food, old friends and new memories.",
      },
    ],
    details: [
      {
        title: "Getting here",
        body: "Please arrive 30 minutes before the ceremony. Parking is available at the main entrance.",
      },
      {
        title: "A note on gifts",
        body: "Your presence is the greatest gift. We are simply grateful to celebrate with you.",
      },
    ],
    milestones: [
      {
        date: "2019",
        title: "A chance meeting",
        description: "A rainy afternoon that changed everything.",
      },
      {
        date: "2025",
        title: "A very easy yes",
        description: "On our favourite walk, with the whole world ahead.",
      },
    ],
  },
};
export const sampleGuests: Guest[] = [
  "The Hart family",
  "Olivia Bennett",
  "Daniel & Sofia",
  "Charlotte Green",
].map((name, i) => ({
  id: `00000000-0000-4000-8000-00000000001${i}`,
  invitation_id: sampleInvitation.id,
  name,
  side: "bride",
  group: i === 0 ? "Family" : "Friends",
  invited_count: i === 0 ? 4 : 2,
  rsvp_status: i === 1 ? "pending" : "attending",
  rsvp_attending_count: i === 1 ? null : i === 0 ? 4 : 2,
  rsvp_message: i === 0 ? "We cannot wait to celebrate with you both!" : null,
  responded_at: null,
  checked_in: i === 2,
  checked_in_at: null,
  email: `guest${i}@example.invalid`,
  phone: null,
  table_name: i === 1 ? null : String(i + 1),
  dietary: i === 0 ? "One vegetarian" : null,
  notes: null,
  staff_notes: null,
  public_token: String(i + 1).repeat(64),
  checkin_token: String(i + 5).repeat(64),
  event_ids: [],
  checked_in_count: i === 2 ? 2 : 0,
  extra_seats: 0,
  version: 0,
}));
