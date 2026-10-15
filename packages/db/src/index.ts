import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "../prisma/generated/client";
import type { DatabaseConfig } from "./config";

export function createPrismaClient(env: DatabaseConfig) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
}

export type Database = ReturnType<typeof createPrismaClient>;

// game.answer and the account merge both take it, so a user's answers and merge run one at a time.
export function lockUser(tx: Prisma.TransactionClient, userId: string) {
  return tx.$queryRaw`SELECT 1 FROM "user" WHERE id = ${userId} FOR UPDATE`;
}

// round entries are keyed "<day>:<roundId>", perfect and streak entries by "<day>".
export function dayPointEntries(days: string[]): Prisma.PointEntryWhereInput {
  return {
    OR: [
      { reason: { in: ["perfect", "streak"] }, ref: { in: days } },
      ...days.map((day) => ({ reason: "round", ref: { startsWith: `${day}:` } })),
    ],
  };
}
