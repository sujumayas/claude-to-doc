import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPG Story Generator",
  description: "Create compelling RPG stories, campaigns, and world-building content with Claude AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
