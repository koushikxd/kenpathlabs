import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Same column as the dock screens, without the dock or its bottom padding.
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-120 flex-col gap-5 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      {/* To the game, not history.back(): a shared link has no history in the app. */}
      <Link
        href="/"
        className="tap-target inline-flex w-fit items-center gap-1.5 rounded-md py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        Back to the game
      </Link>
      {children}
    </main>
  );
}
