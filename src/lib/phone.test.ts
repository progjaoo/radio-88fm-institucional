import { describe, expect, it } from "vitest";
import { formatBrazilianPhone, isValidBrazilianPhone, onlyDigits } from "./phone";

describe("phone helpers", () => {
  it("keeps only up to 11 digits", () => {
    expect(onlyDigits("(24) 99999-9999<script>")).toBe("24999999999");
  });

  it("formats Brazilian landline and mobile phones", () => {
    expect(formatBrazilianPhone("2433334444")).toBe("(24) 3333-4444");
    expect(formatBrazilianPhone("24999994444")).toBe("(24) 99999-4444");
  });

  it("validates DDD phones", () => {
    expect(isValidBrazilianPhone("(24) 99999-4444")).toBe(true);
    expect(isValidBrazilianPhone("9999-4444")).toBe(false);
  });
});
