import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import "../index.css";
import Providers from "@/components/providers";
import { readSession } from "@/server/services";

export const metadata: Metadata = {
  title: "Hallucinated",
  description: "Two truths and a hallucination. A daily game about the AI era.",
};

export const viewport: Viewport = {
  viewportFit: "cover", // env(safe-area-inset-*) is 0 without it
  colorScheme: "dark",
  themeColor: "#121212", // --background in dark
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await readSession(await headers());
  return (
    <html lang="en" className="dark">
      <body>
        <Providers hasSession={session !== null}>{children}</Providers>
      </body>
    </html>
  );
}
