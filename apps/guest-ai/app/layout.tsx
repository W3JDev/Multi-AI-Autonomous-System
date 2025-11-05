import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuestAi - Customer Assistant & Support System",
  description: "Customer Assistant & Support System",
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
