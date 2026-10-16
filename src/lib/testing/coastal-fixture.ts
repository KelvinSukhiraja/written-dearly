import { sampleInvitation } from "./fixture";
import type { CoastalReference } from "@/components/templates/coastal";
const art = (name: string) => `/invitation-art/coastal/${name}`;
export const coastalFixture = {
  ...sampleInvitation,
  slug: "coastal-design-review",
  groom_name: "CLEMENT",
  bride_name: "MICHELLINA",
  wedding_date: "2027-02-07T04:00:00Z",
  cover_photo_url: art("cover.png"),
  story: "",
  theme: {
    groom_photo: art("18-91-imgTre042261.png"),
    bride_photo: art("18-91-imgTre042782.png"),
    groom_description:
      "The First Son of\nMr. Julius Wendra Lea\n& Mrs. Ekawati Indriani",
    bride_description:
      "The First Daughter of\nAlm. Rudy Gatot Darmawan\n& Mrs. Veronika Tan",
    music_source: "none",
    events: [
      {
        id: "catholic",
        title: "Catholic ceremony",
        date: "2027-02-07",
        time: "11.00 AM",
        venue_name: "Gereja Katolik Paroki Santo Mikael,",
        venue_address: "Semarang Indah",
        map_url: "https://maps.google.com/?q=Gereja+Santo+Mikael+Semarang",
      },
      {
        id: "christian",
        title: "Christian ceremony",
        date: "2027-02-07",
        time: "4.00 PM",
        venue_name: "Gedong Songo Outdoor Deck",
        venue_address: "Hotel Padma, Semarang",
        map_url: "https://maps.google.com/?q=Padma+Semarang",
      },
      {
        id: "dinner",
        title: "Wedding dinner",
        date: "2027-02-07",
        time: "6.00 PM",
        venue_name: "Candi Ballroom",
        venue_address: "Hotel Padma, Semarang",
        map_url: "https://maps.google.com/?q=Padma+Semarang",
      },
    ],
    gallery: [
      "Tre048841",
      "Dsc089281",
      "Tre042091",
      "Tre051241",
      "Dsc085351",
      "Dsc091521",
      "Tre054151",
      "Dsc09106Copy1",
      "Tre043101",
      "Dsc081662",
    ].map((name, i) => ({
      src: art(`23-481-img${name}.png`),
      alt: `Clement and Michellina — photograph ${i + 1}`,
    })),
  },
};
export const coastalReference: CoastalReference = {
  openingPhoto: art("opening-photo.png"),
  groomFullName: "CLEMENT A. LEA",
  brideFullName: "MICHELLINA V. DARMAWAN",
  gift: { account: "DEMO BANK — SAMPLE ACCOUNT", number: "0000 0000 00" },
  wishes: [
    { name: "Alex", message: "Wishing you a lifetime of happiness!" },
    { name: "Jamie", message: "So happy to celebrate with you both." },
    { name: "Taylor", message: "With love, today and always." },
  ],
};
