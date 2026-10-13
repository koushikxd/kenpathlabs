import { headers } from "next/headers";

import AnonymousSession from "@/components/anonymous-session";
import Dock from "@/components/dock";
import { readSession } from "@/server/services";

// The session gate lives here, not in the root layout, so /u/<username> renders without a session
// and a visitor opening a shared profile link does not create an anonymous user.
export default async function DockLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession(await headers());
  return (
    <AnonymousSession hasSession={session !== null}>
      <main className="mx-auto flex w-full max-w-120 flex-col gap-5 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <Dock />
    </AnonymousSession>
  );
}
