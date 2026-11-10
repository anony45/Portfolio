import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharon Mageto — QA Analyst",
  description: "Sharon Mageto's portfolio: software quality assurance, test automation practice, SQL validation, and cloud application support. Based in Nairobi, Kenya.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
