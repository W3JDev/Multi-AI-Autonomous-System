import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ai-Artisan - AI-Powered Resume Builder",
  description: "Create professional, ATS-optimized resumes with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
