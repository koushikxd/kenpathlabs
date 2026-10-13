import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { cn } from "@kenpathlabs/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

export const MAX_FREEZES = 2;

export type Stat = {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value?: React.ReactNode;
};

// A stat without a `value` is a skeleton; icons and labels stay put, so nothing shifts.
export function StatRow({ label, stats }: { label: string; stats: Stat[] }) {
  return (
    <section aria-label={label} className="rounded-xl border border-border p-4">
      <dl className="flex gap-2">
        {stats.map(({ icon: Icon, iconClass, label, value }) => (
          <div key={label} className="flex flex-1 basis-0 flex-col-reverse items-center gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-1.5">
              <Icon aria-hidden className={cn("size-4", iconClass)} />
              {value === undefined ? (
                <Skeleton className="h-7 w-8 rounded-md" />
              ) : (
                <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
