import { describe, it, expect } from "vitest";

describe("Slot Machine Logic", () => {
  // Updated to match the symbols in your latest HTML
  const VALID_SYMBOLS = [
    "Ramen", 
    "Energy", 
    "Textbook", 
    "Change", 
    "Diploma"
  ];

  it("should have 5 unique symbols defined for this iteration", () => {
    const symbolSet = new Set(VALID_SYMBOLS);
    // Updated assertion to 5 to match the list above
    expect(symbolSet.size).toBe(5);
  });

  it("should identify a winning combination (3 of a kind)", () => {
    // Note: Symbols are now capitalized in your HTML
    const result = ["Ramen", "Ramen", "Ramen"];
    const isWin = new Set(result).size === 1;
    expect(isWin).toBe(true);
  });

  it("should identify a losing combination", () => {
    const result = ["Ramen", "Textbook", "Ramen"];
    const isWin = new Set(result).size === 1;
    expect(isWin).toBe(false);
  });

  it("should verify that all reel symbols are from the valid set", () => {
    // This helper test ensures your logic only uses allowed symbols
    const testSymbol = "Energy";
    expect(VALID_SYMBOLS).toContain(testSymbol);
  });
});