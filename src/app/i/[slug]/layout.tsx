import type { Viewport } from "next";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f4ef",
};

export default function PublicInvitationLayout({
  children,
}: LayoutProps<"/i/[slug]">) {
  return children;
}
