import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUNCH-CLOCK - HR & Attendance Management",
  description: "AI-powered HR and attendance management system",
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
