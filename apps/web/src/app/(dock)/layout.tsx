import AnonymousSession from "@/components/anonymous-session";
import Dock from "@/components/dock";
import Providers from "@/components/providers";
import { requestSession } from "@/server/services";

// The session gate and the query client live here, not in the root layout, so /u/<username> renders
// without a session, does not create an anonymous user, and ships no query or toast code.
// The gate wraps the pages for its session-ready flag, which the account forms read.
export default async function DockLayout({ children }: { children: React.ReactNode }) {
  const session = await requestSession();
  return (
    <Providers>
      <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col gap-5 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] has-[[data-game]]:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <AnonymousSession hasSession={session !== null}>{children}</AnonymousSession>
      </main>
      <Dock />
    </Providers>
  );
}
