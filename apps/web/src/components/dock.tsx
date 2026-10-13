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

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-[calc(6rem+env(safe-area-inset-bottom))] bg-linear-to-t from-background from-40% to-transparent"
      />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-center"
      >
        <ul className="flex gap-1 rounded-full bg-popover p-1 ring-1 ring-foreground/10">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="flex h-12 w-20 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-medium text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring aria-[current=page]:bg-brand/15 aria-[current=page]:text-brand motion-reduce:transition-none"
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
