import { Badge } from "@kenpathlabs/ui/components/badge";

export const RANK_LABEL = { goat: "da goat", "10x": "10x dev" } as const;

// Brand marks the one player at the top. 10x stays grey so nine brand chips do not flood the board.
export function RankBadge({ badge }: { badge: keyof typeof RANK_LABEL | null }) {
  if (!badge) return null;
  return <Badge variant={badge === "goat" ? "brand" : "secondary"}>{RANK_LABEL[badge]}</Badge>;
}

// Plain text, not a chip: most board rows are bots, and a bordered chip on each one drowns the rank badges.
export function BotTag() {
  return <span className="text-xs text-muted-foreground">bot</span>;
}
