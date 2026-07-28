import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pages = [
  "Index.tsx",
  "NossaRadio.tsx",
  "Equipe.tsx",
  "Programacao.tsx",
  "Anuncie.tsx",
  "Ouvir.tsx",
  "Assistir.tsx",
];

describe("page heading semantics", () => {
  it.each(pages)("declares one h1 in %s", (filename) => {
    const source = fs.readFileSync(path.resolve("src/pages", filename), "utf8");
    expect(source.match(/<h1\b/g)?.length || 0).toBe(1);
  });
});
