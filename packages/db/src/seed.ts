import "varlock/auto-load";

import { readFileSync } from "node:fs";

import { z } from "zod";

import { roundsSchema } from "./content";
import { ENV } from "./env";
import { createPrismaClient } from "./index";

const file = new URL("../../../content/rounds.json", import.meta.url);
const parsed = roundsSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

const rounds = parsed.data;
const roundIds = rounds.map((round) => round.id);
const statementIds = rounds.flatMap((round) => round.statements.map((statement) => statement.id));
const db = createPrismaClient(ENV);

// The database mirrors the file. Deleting content someone has answered fails on the Attempt FK,
// which rolls back the whole seed. Positions are negated first so reordered rounds don't collide.
await db.$transaction([
  db.statement.deleteMany({ where: { id: { notIn: statementIds } } }),
  db.round.deleteMany({ where: { id: { notIn: roundIds } } }),
  db.round.updateMany({ data: { position: { multiply: -1 } } }),
  ...rounds.flatMap(({ id: roundId, theme, statements }, index) => {
    const round = { theme, position: index + 1 };
    return [
      db.round.upsert({ where: { id: roundId }, create: { id: roundId, ...round }, update: round }),
      ...statements.map(({ id, text, isFake, correction, sourceUrl }) => {
        const statement = {
          roundId,
          text,
          isFake,
          correction: correction ?? null,
          sourceUrl: sourceUrl ?? null,
        };
        return db.statement.upsert({
          where: { id },
          create: { id, ...statement },
          update: statement,
        });
      }),
    ];
  }),
]);

console.log(`Seeded ${rounds.length} rounds, ${statementIds.length} statements.`);
await db.$disconnect();
