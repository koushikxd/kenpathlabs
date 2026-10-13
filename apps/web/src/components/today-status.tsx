import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { cn } from "@kenpathlabs/ui/lib/utils";
import { Flame, Snowflake, Trophy } from "lucide-react";

const MAX_FREEZES = 2;

type Status = { streak: number; freezes: number; season: number };

// Without `status` the values are skeletons; icons and labels stay put, so nothing shifts.
function StatusRow({ status }: { status?: Status }) {
  const stats = [
    { icon: Flame, iconClass: "text-brand", label: "day streak", value: status?.streak },
    {
      icon: Snowflake,
      iconClass: "text-frozen",
      label: "freezes",
      value: status && `${status.freezes}/${MAX_FREEZES}`,
    },
    { icon: Trophy, iconClass: "text-muted-foreground", label: "season", value: status?.season },
  ];

  return (
    <section aria-label="Your status" className="rounded-xl border border-border p-4">
      <dl className="grid grid-cols-3 gap-2">
        {stats.map(({ icon: Icon, iconClass, label, value }) => (
          <div key={label} className="flex flex-col-reverse items-center gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-1.5">
              <Icon aria-hidden className={cn("size-4", iconClass)} />
              {status ? (
                <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
              ) : (
                <Skeleton className="h-7 w-8 rounded-md" />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function TodayStatus(status: Status) {
  return <StatusRow status={status} />;
}

export function TodayStatusSkeleton() {
  return <StatusRow />;
}
