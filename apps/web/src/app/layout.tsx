import type { Metadata, Viewport } from "next";

import "../index.css";

export const metadata: Metadata = {
  title: "Hallucinated",
  description: "Two truths and a hallucination. A daily game about the AI era.",
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
