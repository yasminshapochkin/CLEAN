import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clean",
  description: "Find verified cleaning professionals near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
