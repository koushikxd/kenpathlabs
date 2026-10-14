import type { Metadata, Viewport } from "next";

import "../index.css";

const description = "Two truths and a hallucination. A daily game about tech, coding and AI.";

export const metadata: Metadata = {
  title: { default: "Hallucinated", template: "%s · Hallucinated" },
  description,
  applicationName: "Hallucinated",
  openGraph: { title: "Hallucinated", description, siteName: "Hallucinated", type: "website" },
  twitter: { card: "summary", title: "Hallucinated", description },
};

export const viewport: Viewport = {
  viewportFit: "cover", // env(safe-area-inset-*) is 0 without it
  colorScheme: "dark",
  themeColor: "#121212", // --background in dark
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
