import { describe, expect, it } from "vitest";

import { roundsSchema } from "./content";

type Statement = {
  id: string;
  text: string;
  isFake: boolean;
  correction?: string;
  sourceUrl?: string;
};

function round(id: string) {
  const statements: Statement[] = [
    { id: `${id}-1`, text: "True one", isFake: false, sourceUrl: "https://example.com/1" },
    { id: `${id}-2`, text: "True two", isFake: false, sourceUrl: "https://example.com/2" },
    { id: `${id}-3`, text: "Made up", isFake: true, correction: "The real fact" },
  ];
  return { id, theme: "Theme", statements };
}

const day = (prefix = "r") => Array.from({ length: 5 }, (_, i) => round(`${prefix}${i + 1}`));

function errors(rounds: object[]): string[] {
  const result = roundsSchema.safeParse(rounds);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("roundsSchema", () => {
  it("accepts a valid day", () => {
    expect(errors(day())).toEqual([]);
  });

  it("accepts two days", () => {
    expect(errors([...day("a"), ...day("b")])).toEqual([]);
  });

  it("rejects a round with 2 statements", () => {
    const rounds = day();
    rounds[1]!.statements.shift();
    expect(errors(rounds)).toEqual(["round r2: needs exactly 3 statements, has 2"]);
  });

  it("rejects a round with 4 statements", () => {
    const rounds = day();
    rounds[1]!.statements.push({
      id: "r2-4",
      text: "Extra",
      isFake: false,
      sourceUrl: "https://example.com",
    });
    expect(errors(rounds)).toEqual(["round r2: needs exactly 3 statements, has 4"]);
  });

  it("rejects a round with no fake", () => {
    const rounds = day();
    rounds[2]!.statements[2] = {
      id: "r3-3",
      text: "True three",
      isFake: false,
      sourceUrl: "https://example.com",
    };
    expect(errors(rounds)).toEqual(["round r3: needs exactly 1 fake, has 0"]);
  });

  it("rejects a round with 2 fakes", () => {
    const rounds = day();
    rounds[2]!.statements[0] = { id: "r3-1", text: "Fake too", isFake: true, correction: "Fix" };
    expect(errors(rounds)).toEqual(["round r3: needs exactly 1 fake, has 2"]);
  });

  it("rejects a truth without a source", () => {
    const rounds = day();
    delete rounds[0]!.statements[0]!.sourceUrl;
    expect(errors(rounds)).toEqual(["round r1: truth r1-1 needs an https sourceUrl"]);
  });

  it("rejects a truth with an http source", () => {
    const rounds = day();
    rounds[0]!.statements[0]!.sourceUrl = "http://example.com";
    expect(errors(rounds)).toEqual(["round r1: truth r1-1 needs an https sourceUrl"]);
  });

  it("rejects a truth with a correction", () => {
    const rounds = day();
    rounds[0]!.statements[1]!.correction = "Not needed";
    expect(errors(rounds)).toEqual(["round r1: truth r1-2 must not have a correction"]);
  });

  it("rejects a fake without a correction", () => {
    const rounds = day();
    delete rounds[4]!.statements[2]!.correction;
    expect(errors(rounds)).toEqual(["round r5: fake r5-3 needs a correction"]);
  });

  it("rejects a fake with a source", () => {
    const rounds = day();
    rounds[4]!.statements[2]!.sourceUrl = "https://example.com";
    expect(errors(rounds)).toEqual(["round r5: fake r5-3 must not have a sourceUrl"]);
  });

  it("rejects a duplicate round id", () => {
    const rounds = day();
    rounds[3] = { ...round("r1"), statements: round("r4").statements };
    expect(errors(rounds)).toEqual(["round r1: duplicate id r1"]);
  });

  it("rejects a statement id reused in another round", () => {
    const rounds = day();
    rounds[3]!.statements[0]!.id = "r1-1";
    expect(errors(rounds)).toEqual(["round r4: duplicate id r1-1"]);
  });

  it.each(["best", "Latest", "currently"])("rejects a statement containing %s", (word) => {
    const rounds = day();
    rounds[1]!.statements[0]!.text = `This is ${word} a model`;
    expect(errors(rounds)).toEqual([
      `round r2: statement r2-1 says "${word}", name the exact version`,
    ]);
  });

  it("allows words that only contain a banned word", () => {
    const rounds = day();
    rounds[1]!.statements[0]!.text = "A bestselling book";
    expect(errors(rounds)).toEqual([]);
  });

  it("rejects an empty file", () => {
    expect(errors([])).toEqual(["needs a positive multiple of 5 rounds, has 0"]);
  });

  it("rejects a partial day", () => {
    expect(errors(day().slice(0, 4))).toEqual(["needs a positive multiple of 5 rounds, has 4"]);
  });

  it("rejects a malformed round", () => {
    expect(errors([{ id: "r1" }]).length).toBeGreaterThan(0);
  });
});
