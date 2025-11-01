import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaiterAi - Restaurant Service Management System",
  description: "Restaurant Service Management System",
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
