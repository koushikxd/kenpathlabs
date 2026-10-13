import type { Badge } from "@kenpathlabs/api/game/history";

import { cn } from "@kenpathlabs/ui/lib/utils";
import {
  CalendarCheck,
  Coins,
  Flame,
  type LucideIcon,
  Medal,
  ScanEye,
  Snowflake,
} from "lucide-react";

import type { RouterOutputs } from "@/utils/trpc";

import { ActivityGraph, ActivityGraphSkeleton } from "./activity-graph";
import { BotTag, RANK_LABEL, RankBadge } from "./player-tags";
import { MAX_FREEZES, StatRow } from "./stat-row";

// Both me.get and profile.byUsername return these fields.
type Summary = Pick<
  RouterOutputs["profile"]["byUsername"],
  "points" | "currentStreak" | "longestStreak" | "freezes" | "graph" | "badges" | "seasonAwards"
>;

const BADGES: { id: Badge; name: string; how: string; icon: LucideIcon }[] = [
  { id: "first-token", name: "First Token", how: "Answer your first round", icon: Coins },
  { id: "on-fire", name: "On Fire", how: "Reach a 7-day streak", icon: Flame },
  { id: "perfect-week", name: "Perfect Week", how: "7 days in a row at 5/5", icon: CalendarCheck },
  {
    id: "hallucination-hunter",
    name: "Hallucination Hunter",
    how: "Catch 50 fakes",
    icon: ScanEye,
  },
];

const SECTION = "flex flex-col gap-3";
const HEADING = "text-xs font-medium text-muted-foreground";

export function PlayerHeader({
  name,
  username,
  isBot = false,
  rankBadge,
}: {
  name: string;
  username: string | null;
  isBot?: boolean;
  rankBadge: keyof typeof RANK_LABEL | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold text-balance">{name}</h1>
        {isBot && <BotTag />}
        <RankBadge badge={rankBadge} />
      </div>
      {username && <p className="text-xs text-muted-foreground">@{username}</p>}
    </div>
  );
}

function Stats({ summary }: { summary?: Summary }) {
  return (
    <StatRow
      label="Stats"
      stats={[
        { icon: Coins, iconClass: "text-brand", label: "points", value: summary?.points },
        {
          icon: Flame,
          iconClass: "text-brand",
          label: "day streak",
          value: summary?.currentStreak,
        },
        {
          icon: Medal,
          iconClass: "text-muted-foreground",
          label: "longest",
          value: summary?.longestStreak,
        },
        {
          icon: Snowflake,
          iconClass: "text-frozen",
          label: "freezes",
          value: summary && `${summary.freezes}/${MAX_FREEZES}`,
        },
      ]}
    />
  );
}

function Badges({ earned }: { earned: Badge[] }) {
  return (
    <section aria-labelledby="badges-title" className={SECTION}>
      <h2 id="badges-title" className={HEADING}>
        Badges
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {BADGES.map(({ id, name, how, icon: Icon }) => {
          const isEarned = earned.includes(id);
          return (
            <li key={id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md",
                    isEarned ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                </span>
                {!isEarned && <span className="text-xs text-muted-foreground">Not yet</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-sm font-medium", !isEarned && "text-muted-foreground")}>
                  {name}
                </span>
                <span className="text-xs text-pretty text-muted-foreground">{how}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SeasonAwards({ awards }: { awards: Summary["seasonAwards"] }) {
  return (
    <section aria-labelledby="awards-title" className={SECTION}>
      <h2 id="awards-title" className={HEADING}>
        Season awards
      </h2>
      {awards.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {awards.map(({ seasonNumber, award }) => {
            // SAFETY: the column is a string, but finalization only ever writes a RankBadge.
            const label = RANK_LABEL[award as keyof typeof RANK_LABEL];
            return (
              <li key={seasonNumber} className="px-3 py-3 text-sm font-medium">
                Season {seasonNumber} · {label}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-border px-3 py-3 text-xs text-pretty text-muted-foreground">
          No season awards yet. Finish a season in the top 10 to keep its badge.
        </p>
      )}
    </section>
  );
}

// No hooks, so it renders in the client Me page and the server profile page alike.
export function PlayerSummary({ summary }: { summary: Summary }) {
  return (
    <>
      <Stats summary={summary} />
      <ActivityGraph graph={summary.graph} />
      <Badges earned={summary.badges} />
      <SeasonAwards awards={summary.seasonAwards} />
    </>
  );
}

export function PlayerSummarySkeleton() {
  return (
    <>
      <Stats />
      <ActivityGraphSkeleton />
    </>
  );
}
