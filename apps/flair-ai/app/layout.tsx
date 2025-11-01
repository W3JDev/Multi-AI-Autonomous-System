import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlairAi - Staff Training & Development Platform",
  description: "Staff Training & Development Platform",
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
