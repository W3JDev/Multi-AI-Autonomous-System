import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serene-AI - Spa & Salon Management System",
  description: "Spa & Salon Management System",
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
