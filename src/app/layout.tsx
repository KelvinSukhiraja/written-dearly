import type { Metadata } from "next";
import { HoverRoot } from "@/components/motion/hover-root";
import "./globals.css";


export const metadata: Metadata = {
  title: "Written Dearly",
  description: "Invitation studio for couples",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <HoverRoot>{children}</HoverRoot>
      </body>
    </html>
  );
}
