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
  {
    id: "perfect-week",
    name: "Perfect Week",
    how: "Get 5/5 for 7 days in a row",
    icon: CalendarCheck,
  },
  {
    id: "hallucination-hunter",
    name: "Hallucination Hunter",
    how: "Find 50 fakes",
    icon: ScanEye,
  },
];

const SECTION = "flex flex-col gap-3";
const HEADING = "eyebrow";

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
    <div className="flex items-center gap-4">
      {/* The Play orb in small: the player's initial on brand, behind scanlines. */}
      <span
        aria-hidden
        className="scanlines grid size-14 shrink-0 place-items-center rounded-full bg-brand font-mono text-2xl font-semibold text-background uppercase shadow-[0_0_32px_-8px_var(--brand)] ring-4 ring-brand/15"
      >
        {name.charAt(0)}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-balance">{name}</h1>
          {isBot && <BotTag />}
          <RankBadge badge={rankBadge} />
        </div>
        {username && (
          <p className="truncate font-mono text-xs text-muted-foreground">@{username}</p>
        )}
      </div>
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
            <li
              key={id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3",
                isEarned ? "border-brand/40 bg-brand/5" : "border-dashed",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md",
                    isEarned
                      ? "bg-brand text-background shadow-[0_0_20px_-4px_var(--brand)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                </span>
                {!isEarned && <span className="eyebrow">Not yet</span>}
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
              <li
                key={seasonNumber}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium"
              >
                <span className="eyebrow">Season {seasonNumber}</span>
                {label}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed px-3 py-3 text-xs text-pretty text-muted-foreground">
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
