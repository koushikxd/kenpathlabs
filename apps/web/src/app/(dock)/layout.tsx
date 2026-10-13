import Dock from "@/components/dock";

export default function DockLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-120 flex-col gap-5 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <Dock />
    </>
  );
}
