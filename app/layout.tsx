import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Precision CNC Parts, Repeated Exactly | Antropi Robotics",
  description:
    "Upload CAD, choose 100, 10 or 5 micron precision, and order inspection-backed CNC parts with clearer delivery expectations and repeat-order confidence.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/antropi-mark.svg",
    shortcut: "/antropi-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
