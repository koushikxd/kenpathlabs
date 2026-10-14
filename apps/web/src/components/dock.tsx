"use client";

import { CalendarCheck, CircleUser, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Today", icon: CalendarCheck },
  { href: "/board", label: "Board", icon: Trophy },
  { href: "/me", label: "Me", icon: CircleUser },
] as const;

export default function Dock() {
  const pathname = usePathname();
  // The game screen has the whole viewport. The dock stays mounted and slides away, timed with
  // the game screen's entrance.
  const hidden = pathname === "/play";
  const slide =
    "transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] data-hidden:translate-y-full data-hidden:opacity-0 motion-reduce:transition-none";

  return (
    <>
      <div
        aria-hidden
        data-hidden={hidden || undefined}
        className={`pointer-events-none fixed inset-x-0 bottom-0 h-[calc(6rem+env(safe-area-inset-bottom))] bg-linear-to-t from-background from-40% to-transparent ${slide}`}
      />
      <nav
        aria-label="Main"
        inert={hidden}
        data-hidden={hidden || undefined}
        className={`fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-center ${slide}`}
      >
        <ul className="flex gap-1 rounded-full bg-popover p-1 ring-1 ring-foreground/10">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="flex h-12 w-20 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-medium text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.96] aria-[current=page]:bg-brand/15 aria-[current=page]:text-brand motion-reduce:transition-none"
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
