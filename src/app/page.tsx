import type { Metadata } from "next";
import { StudioLanding } from "@/components/landing/studio-landing";

export const metadata: Metadata = {
  title: "Written Dearly — A beautiful beginning",
  description: "Thoughtfully composed digital wedding invitations. A beautiful online home for your story, your celebration, and the people you love.",
};

export default function Home() {
  return <StudioLanding />;
}
