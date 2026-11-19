import fs from "node:fs";
import path from "node:path";
import postcss, { type AtRule, type Node } from "postcss";
import { describe, expect, it } from "vitest";

const stylesheet = postcss.parse(fs.readFileSync(path.resolve("src/index.css"), "utf8"));

function displayRules(selector: string) {
  const rules: { media: string | null; display: string }[] = [];
  stylesheet.walkRules(selector, rule => {
    let media: string | null = null;
    for (let parent: Node | undefined = rule.parent; parent; parent = parent.parent) {
      if (parent.type === "atrule") {
        const atRule = parent as AtRule;
        if (atRule.name === "media") media = atRule.params;
      }
    }
    rule.walkDecls("display", declaration => {
      rules.push({ media, display: declaration.value });
    });
  });
  return rules;
}

describe("MiniPlayer song visibility breakpoints", () => {
  it("shows the song beside the controls at every viewport width", () => {
    expect(displayRules(".mini-player-status")).toEqual([
      { media: null, display: "block" },
    ]);
  });

  it("uses two lines on mobile and an ellipsis on desktop without a duplicate under the program", () => {
    expect(displayRules(".mini-player-status strong")).toEqual([
      { media: null, display: "-webkit-box" },
      { media: "(min-width: 1024px)", display: "block" },
    ]);
    expect(displayRules(".mini-player-track-compact")).toEqual([]);
  });
});
