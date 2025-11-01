import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Dashboard - Control Center for W3JDev AI Ecosystem",
  description: "Control Center for W3JDev AI Ecosystem",
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
