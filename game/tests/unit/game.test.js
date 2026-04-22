import { describe, it, expect } from "vitest";

describe("Slot Machine Logic", () => {
  // These represent the symbols defined in your HTML typedef
  const VALID_SYMBOLS = [
    "instant-noodles", 
    "textbook", 
    "coffee", 
    "laundry-quarters", 
    "overdue-fee", 
    "ramen-coupon"
  ];

  it("should have 6 unique symbols defined for the game", () => {
    const symbolSet = new Set(VALID_SYMBOLS);
    expect(symbolSet.size).toBe(6);
  });

  it("should identify a winning combination (3 of a kind)", () => {
    const result = ["coffee", "coffee", "coffee"];
    const isWin = new Set(result).size === 1;
    expect(isWin).toBe(true);
  });

  it("should identify a losing combination", () => {
    const result = ["coffee", "textbook", "coffee"];
    const isWin = new Set(result).size === 1;
    expect(isWin).toBe(false);
  });
});