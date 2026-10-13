import { z } from "zod";

const ROUNDS_PER_DAY = 5;
const BANNED_WORD = /\b(best|latest|currently)\b/i;

const statementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isFake: z.boolean(),
  correction: z.string().min(1).optional(),
  sourceUrl: z.url().optional(),
});

const roundSchema = z.object({
  id: z.string().min(1),
  theme: z.string().min(1),
  statements: z.array(statementSchema),
});

export type ContentRound = z.infer<typeof roundSchema>;

// Position is the 1-based array index.
export const roundsSchema = z.array(roundSchema).superRefine((rounds, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });

  if (rounds.length === 0 || rounds.length % ROUNDS_PER_DAY !== 0) {
    fail(`needs a positive multiple of ${ROUNDS_PER_DAY} rounds, has ${rounds.length}`);
  }

  const ids = new Set<string>();
  for (const round of rounds) {
    const roundFail = (message: string) => fail(`round ${round.id}: ${message}`);

    for (const id of [round.id, ...round.statements.map((statement) => statement.id)]) {
      if (ids.has(id)) roundFail(`duplicate id ${id}`);
      ids.add(id);
    }

    if (round.statements.length !== 3) {
      roundFail(`needs exactly 3 statements, has ${round.statements.length}`);
    }
    const fakes = round.statements.filter((statement) => statement.isFake).length;
    if (fakes !== 1) roundFail(`needs exactly 1 fake, has ${fakes}`);

    for (const { id, text, isFake, correction, sourceUrl } of round.statements) {
      if (isFake) {
        if (!correction) roundFail(`fake ${id} needs a correction`);
        if (sourceUrl) roundFail(`fake ${id} must not have a sourceUrl`);
      } else {
        if (!sourceUrl?.startsWith("https://")) roundFail(`truth ${id} needs an https sourceUrl`);
        if (correction) roundFail(`truth ${id} must not have a correction`);
      }
      const banned = text.match(BANNED_WORD);
      if (banned) roundFail(`statement ${id} says "${banned[0]}", name the exact version`);
    }
  }
});
