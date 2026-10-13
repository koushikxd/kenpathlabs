import { Flame, Snowflake, Trophy } from "lucide-react";

import { MAX_FREEZES, StatRow } from "./stat-row";

type Status = { streak: number; freezes: number; season: number };

function StatusRow({ status }: { status?: Status }) {
  return (
    <StatRow
      label="Your status"
      stats={[
        { icon: Flame, iconClass: "text-brand", label: "day streak", value: status?.streak },
        {
          icon: Snowflake,
          iconClass: "text-frozen",
          label: "freezes",
          value: status && `${status.freezes}/${MAX_FREEZES}`,
        },
        {
          icon: Trophy,
          iconClass: "text-muted-foreground",
          label: "season",
          value: status?.season,
        },
      ]}
    />
  );
}

export function TodayStatus(status: Status) {
  return <StatusRow status={status} />;
}

export function TodayStatusSkeleton() {
  return <StatusRow />;
}
