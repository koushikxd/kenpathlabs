import { buttonVariants } from "@kenpathlabs/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@kenpathlabs/ui/components/empty";
import { UserX } from "lucide-react";
import Link from "next/link";

import { Glitch } from "@/components/glitch";

export default function ProfileNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-11 rounded-2xl [&_svg]:size-5">
          <UserX />
        </EmptyMedia>
        <EmptyTitle>
          <Glitch>Player not found</Glitch>
        </EmptyTitle>
        <EmptyDescription>
          No player has this username. Check the link, or find players on the board.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/board" className={buttonVariants({ variant: "outline" })}>
          See the board
        </Link>
      </EmptyContent>
    </Empty>
  );
}
