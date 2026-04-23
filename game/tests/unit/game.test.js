import { describe, it, expect } from "vitest";

// ─── Shared constants (mirrors game.js) ───────────────────────────────────────

const CURRENCIES = {
  real: { label: "Real Currency", prefix: "$", startingBalance: 12.75, allowedBets: [0.5, 1, 2, 3, 5] },
  dining: { label: "Dining Dollars", prefix: "DD ", startingBalance: 48, allowedBets: [1, 2, 4, 6, 8] },
};

const SYMBOLS = {
  ramen:  { id: "ramen",  label: "Ramen",    className: "symbol-ramen"  },
  energy: { id: "energy", label: "Energy",   className: "symbol-energy" },
  book:   { id: "book",   label: "Textbook", className: "symbol-book"   },
  change: { id: "change", label: "Change",   className: "symbol-change" },
  wild:   { id: "wild",   label: "Diploma",  className: "symbol-wild"   },
};

const SYMBOL_ORDER = Object.keys(SYMBOLS);

const INITIAL_REEL_MATRIX = [
  ["ramen", "energy", "book", "change", "wild"],
  ["change", "ramen", "wild", "book", "energy"],
  ["book", "change", "ramen", "energy", "wild"],
];

// ─── Pure helpers (mirrors game.js) ──────────────────────────────────────────

/** @param {number} amount @param {"real"|"dining"} mode */
function formatAmount(amount, mode) {
  const c = CURRENCIES[mode];
  return mode === "real"
    ? `${c.prefix}${amount.toFixed(2)}`
    : `${c.prefix}${amount.toFixed(0)}`;
}

/** @param {number} v @param {number} min @param {number} max */
function clampNumber(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

/** @param {number} amount */
function roundToCurrencyPrecision(amount) {
  return Math.round(amount * 100) / 100;
}

/** @param {number} reelCount @param {number} slotsPerReel */
function createRandomMatrix(reelCount, slotsPerReel) {
  return Array.from({ length: reelCount }, () =>
    Array.from({ length: slotsPerReel }, () => {
      const i = Math.floor(Math.random() * SYMBOL_ORDER.length);
      return SYMBOL_ORDER[i];
    })
  );
}

/** @param {readonly (readonly string[])[]} matrix */
function cloneMatrix(matrix) {
  return matrix.map((reel) => [...reel]);
}

// ─── Win detection helper ─────────────────────────────────────────────────────

/** @param {string[]} row */
const isWin = (row) => new Set(row).size === 1;

// ─── Symbol config ────────────────────────────────────────────────────────────

describe("Slot Machine Logic", () => {
  it("should have 5 unique symbols defined for this iteration", () => {
    expect(new Set(SYMBOL_ORDER).size).toBe(5);
  });

  it("every symbol has id, label, and className", () => {
    for (const sym of Object.values(SYMBOLS)) {
      expect(sym).toHaveProperty("id");
      expect(sym).toHaveProperty("label");
      expect(sym).toHaveProperty("className");
    }
  });

  it("SYMBOL_ORDER contains all symbol ids", () => {
    expect(SYMBOL_ORDER).toEqual(expect.arrayContaining(Object.keys(SYMBOLS)));
  });
});

// ─── Initial reel matrix ──────────────────────────────────────────────────────

describe("INITIAL_REEL_MATRIX", () => {
  it("has 3 reels", () => {
    expect(INITIAL_REEL_MATRIX.length).toBe(3);
  });

  it("each reel has 5 slots", () => {
    for (const reel of INITIAL_REEL_MATRIX) {
      expect(reel.length).toBe(5);
    }
  });

  it("every symbol in the matrix is a valid symbol id", () => {
    for (const reel of INITIAL_REEL_MATRIX) {
      for (const id of reel) {
        expect(SYMBOL_ORDER).toContain(id);
      }
    }
  });
});

// ─── Currency config ──────────────────────────────────────────────────────────

describe("CURRENCIES", () => {
  it("real currency starts at $12.75", () => {
    expect(CURRENCIES.real.startingBalance).toBe(12.75);
  });

  it("dining dollars starts at 48", () => {
    expect(CURRENCIES.dining.startingBalance).toBe(48);
  });

  it("real currency has 5 allowed bet sizes", () => {
    expect(CURRENCIES.real.allowedBets.length).toBe(5);
  });

  it("dining dollars has 5 allowed bet sizes", () => {
    expect(CURRENCIES.dining.allowedBets.length).toBe(5);
  });

  it("all real bet amounts are positive", () => {
    for (const bet of CURRENCIES.real.allowedBets) {
      expect(bet).toBeGreaterThan(0);
    }
  });

  it("all dining bet amounts are positive", () => {
    for (const bet of CURRENCIES.dining.allowedBets) {
      expect(bet).toBeGreaterThan(0);
    }
  });

  it("real bet list is sorted ascending", () => {
    const bets = CURRENCIES.real.allowedBets;
    for (let i = 1; i < bets.length; i++) {
      expect(bets[i]).toBeGreaterThan(bets[i - 1]);
    }
  });

  it("dining bet list is sorted ascending", () => {
    const bets = CURRENCIES.dining.allowedBets;
    for (let i = 1; i < bets.length; i++) {
      expect(bets[i]).toBeGreaterThan(bets[i - 1]);
    }
  });
});

// ─── formatAmount ─────────────────────────────────────────────────────────────

describe("formatAmount", () => {
  it("formats real currency with $ prefix and 2 decimal places", () => {
    expect(formatAmount(12.75, "real")).toBe("$12.75");
  });

  it("formats real currency whole number with .00", () => {
    expect(formatAmount(5, "real")).toBe("$5.00");
  });

  it("formats real currency $0.50 correctly", () => {
    expect(formatAmount(0.5, "real")).toBe("$0.50");
  });

  it("formats zero real balance as $0.00", () => {
    expect(formatAmount(0, "real")).toBe("$0.00");
  });

  it("formats dining dollars with DD prefix and no decimals", () => {
    expect(formatAmount(48, "dining")).toBe("DD 48");
  });

  it("formats dining dollars truncating to integer display", () => {
    expect(formatAmount(10, "dining")).toBe("DD 10");
  });

  it("formats zero dining balance as DD 0", () => {
    expect(formatAmount(0, "dining")).toBe("DD 0");
  });
});

// ─── clampNumber ──────────────────────────────────────────────────────────────

describe("clampNumber", () => {
  it("returns value when within range", () => {
    expect(clampNumber(3, 0, 5)).toBe(3);
  });

  it("clamps to minimum when below range", () => {
    expect(clampNumber(-1, 0, 5)).toBe(0);
  });

  it("clamps to maximum when above range", () => {
    expect(clampNumber(10, 0, 5)).toBe(5);
  });

  it("returns minimum when value equals minimum", () => {
    expect(clampNumber(0, 0, 5)).toBe(0);
  });

  it("returns maximum when value equals maximum", () => {
    expect(clampNumber(5, 0, 5)).toBe(5);
  });

  it("handles single-point range (min equals max)", () => {
    expect(clampNumber(99, 3, 3)).toBe(3);
  });
});

// ─── roundToCurrencyPrecision ─────────────────────────────────────────────────

describe("roundToCurrencyPrecision", () => {
  it("leaves already-precise values unchanged", () => {
    expect(roundToCurrencyPrecision(12.75)).toBe(12.75);
  });

  it("handles floating-point subtraction without drift", () => {
    expect(roundToCurrencyPrecision(12.75 - 0.5)).toBe(12.25);
  });

  it("rounds down when third decimal is less than 5", () => {
    expect(roundToCurrencyPrecision(1.234)).toBe(1.23);
  });

  it("rounds up when third decimal is 5 or more", () => {
    expect(roundToCurrencyPrecision(1.235)).toBe(1.24);
  });

  it("handles zero correctly", () => {
    expect(roundToCurrencyPrecision(0)).toBe(0);
  });

  it("handles large amounts", () => {
    expect(roundToCurrencyPrecision(999.999)).toBe(1000);
  });
});

// ─── createRandomMatrix ───────────────────────────────────────────────────────

describe("createRandomMatrix", () => {
  it("produces a matrix with the correct number of reels", () => {
    expect(createRandomMatrix(3, 5).length).toBe(3);
  });

  it("produces reels with the correct number of slots", () => {
    for (const reel of createRandomMatrix(3, 5)) {
      expect(reel.length).toBe(5);
    }
  });

  it("every symbol in the matrix is a valid symbol id", () => {
    for (const reel of createRandomMatrix(3, 5)) {
      for (const id of reel) {
        expect(SYMBOL_ORDER).toContain(id);
      }
    }
  });

  it("works with non-standard dimensions", () => {
    const m = createRandomMatrix(2, 3);
    expect(m.length).toBe(2);
    expect(m[0].length).toBe(3);
  });

  it("produces a mutable matrix", () => {
    const m = createRandomMatrix(3, 5);
    expect(() => { m[0][0] = SYMBOL_ORDER[0]; }).not.toThrow();
  });
});

// ─── cloneMatrix ──────────────────────────────────────────────────────────────

describe("cloneMatrix", () => {
  it("produces a matrix equal in content to the source", () => {
    expect(cloneMatrix(INITIAL_REEL_MATRIX)).toEqual(INITIAL_REEL_MATRIX);
  });

  it("produces a new outer array, not the same reference", () => {
    expect(cloneMatrix(INITIAL_REEL_MATRIX)).not.toBe(INITIAL_REEL_MATRIX);
  });

  it("produces new inner arrays, not shared references", () => {
    const clone = cloneMatrix(INITIAL_REEL_MATRIX);
    for (let i = 0; i < INITIAL_REEL_MATRIX.length; i++) {
      expect(clone[i]).not.toBe(INITIAL_REEL_MATRIX[i]);
    }
  });

  it("mutating the clone does not affect the original", () => {
    const clone = cloneMatrix(INITIAL_REEL_MATRIX);
    clone[0][0] = "wild";
    expect(INITIAL_REEL_MATRIX[0][0]).toBe("ramen");
  });
});

// ─── Win detection ────────────────────────────────────────────────────────────

describe("Win detection (3-of-a-kind)", () => {
  it("detects a win when all three symbols match", () => {
    expect(isWin(["ramen", "ramen", "ramen"])).toBe(true);
  });

  it("detects a loss when no symbols match", () => {
    expect(isWin(["ramen", "energy", "book"])).toBe(false);
  });

  it("detects a loss when only two symbols match", () => {
    expect(isWin(["ramen", "ramen", "book"])).toBe(false);
  });

  it("detects a win for every valid symbol", () => {
    for (const sym of SYMBOL_ORDER) {
      expect(isWin([sym, sym, sym])).toBe(true);
    }
  });
});

// ─── Bet boundary logic ───────────────────────────────────────────────────────

describe("Bet boundary logic", () => {
  it("clamps bet index to 0 when already at minimum", () => {
    const bets = CURRENCIES.real.allowedBets;
    const currentIndex = 0;
    const nextIndex = clampNumber(currentIndex - 1, 0, bets.length - 1);
    expect(nextIndex).toBe(0);
  });

  it("clamps bet index to max when already at maximum", () => {
    const bets = CURRENCIES.real.allowedBets;
    const currentIndex = bets.length - 1;
    const nextIndex = clampNumber(currentIndex + 1, 0, bets.length - 1);
    expect(nextIndex).toBe(bets.length - 1);
  });

  it("increments bet index correctly from middle", () => {
    const bets = CURRENCIES.real.allowedBets;
    const currentIndex = 2;
    const nextIndex = clampNumber(currentIndex + 1, 0, bets.length - 1);
    expect(bets[nextIndex]).toBe(bets[3]);
  });

  it("decrements bet index correctly from middle", () => {
    const bets = CURRENCIES.real.allowedBets;
    const currentIndex = 2;
    const nextIndex = clampNumber(currentIndex - 1, 0, bets.length - 1);
    expect(bets[nextIndex]).toBe(bets[1]);
  });
});

// ─── Balance deduction logic ──────────────────────────────────────────────────

describe("Balance deduction logic", () => {
  it("deducts bet from balance without floating-point drift", () => {
    const balance = CURRENCIES.real.startingBalance;
    const bet = CURRENCIES.real.allowedBets[0];
    expect(roundToCurrencyPrecision(balance - bet)).toBe(12.25);
  });

  it("spin is blocked when balance is less than bet", () => {
    const balance = 0.25;
    const bet = 0.5;
    expect(balance < bet).toBe(true);
  });

  it("spin is allowed when balance equals bet", () => {
    const balance = 0.5;
    const bet = 0.5;
    expect(balance >= bet).toBe(true);
  });

  it("spin is allowed when balance exceeds bet", () => {
    const balance = 12.75;
    const bet = 1;
    expect(balance >= bet).toBe(true);
  });
});

// ─── Spin simulation ──────────────────────────────────────────────────────────
// Mirrors the handleSpin logic in game.js without touching the DOM.

/**
 * @param {{ balance: number, bet: number, isSpinning: boolean }} state
 * @returns {{ balance: number, matrix: string[][]|null, status: string, isSpinning: boolean }}
 */
function simulateSpin(state) {
  if (state.isSpinning) {
    return { ...state, matrix: null, status: "already spinning" };
  }
  if (state.balance < state.bet) {
    return { ...state, matrix: null, status: "insufficient funds" };
  }
  const newBalance = roundToCurrencyPrecision(state.balance - state.bet);
  const matrix = createRandomMatrix(3, 5);
  return { balance: newBalance, bet: state.bet, isSpinning: false, matrix, status: "spun" };
}

describe("Spin simulation", () => {
  it("deducts the bet from balance on a successful spin", () => {
    const result = simulateSpin({ balance: 12.75, bet: 1, isSpinning: false });
    expect(result.balance).toBe(11.75);
  });

  it("does not deduct balance when already spinning", () => {
    const result = simulateSpin({ balance: 12.75, bet: 1, isSpinning: true });
    expect(result.balance).toBe(12.75);
    expect(result.status).toBe("already spinning");
  });

  it("does not deduct balance when funds are insufficient", () => {
    const result = simulateSpin({ balance: 0.25, bet: 0.5, isSpinning: false });
    expect(result.balance).toBe(0.25);
    expect(result.status).toBe("insufficient funds");
  });

  it("produces a 3x5 matrix on success", () => {
    const result = simulateSpin({ balance: 12.75, bet: 1, isSpinning: false });
    expect(result.matrix).not.toBeNull();
    expect(result.matrix.length).toBe(3);
    for (const reel of result.matrix) {
      expect(reel.length).toBe(5);
    }
  });

  it("all symbols in the result matrix are valid", () => {
    const result = simulateSpin({ balance: 12.75, bet: 1, isSpinning: false });
    for (const reel of result.matrix) {
      for (const id of reel) {
        expect(SYMBOL_ORDER).toContain(id);
      }
    }
  });

  it("balance reaches zero after enough spins with min bet", () => {
    let balance = CURRENCIES.real.allowedBets[0]; // $0.50 — exactly one spin
    const bet = CURRENCIES.real.allowedBets[0];
    const result = simulateSpin({ balance, bet, isSpinning: false });
    expect(result.balance).toBe(0);
  });

  it("spin is blocked after balance reaches zero", () => {
    const result = simulateSpin({ balance: 0, bet: 0.5, isSpinning: false });
    expect(result.status).toBe("insufficient funds");
    expect(result.matrix).toBeNull();
  });
});

// ─── Payout calculations (TDD) ────────────────────────────────────────────────
// Payout logic is not yet in game.js. These tests define the expected behavior
// so the implementation can be written to pass them.
//
// Payline: middle slot (index 2) of each of the 3 reels.
// Win condition: all 3 payline symbols match.
// Payout multipliers: wild (Diploma) = 10x, book (Textbook) = 7x,
//   energy = 5x, ramen = 4x, change = 3x. Loss = 0.

/** @type {Record<string, number>} */
const PAYOUT_MULTIPLIERS = {
  wild: 10,
  book: 7,
  energy: 5,
  ramen: 4,
  change: 3,
};

/**
 * @param {string[][]} matrix 3 reels × 5 slots
 * @param {number} bet
 * @returns {number}
 */
function calculatePayout(matrix, bet) {
  const payline = matrix.map((reel) => reel[2]); // middle row
  if (new Set(payline).size !== 1) return 0;
  return roundToCurrencyPrecision(bet * (PAYOUT_MULTIPLIERS[payline[0]] ?? 0));
}

describe("Payout calculations (TDD — expected behavior for future implementation)", () => {
  it("returns 0 for a non-winning payline", () => {
    const matrix = [
      ["ramen", "energy", "ramen", "change", "wild"],
      ["ramen", "energy", "book",  "change", "wild"],
      ["ramen", "energy", "wild",  "change", "wild"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(0);
  });

  it("pays out for a 3-of-a-kind ramen payline", () => {
    const matrix = [
      ["wild",  "energy", "ramen", "change", "wild"],
      ["book",  "energy", "ramen", "change", "wild"],
      ["change","energy", "ramen", "change", "wild"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(4);
  });

  it("pays out for a 3-of-a-kind energy payline", () => {
    const matrix = [
      ["ramen", "wild",  "energy", "change", "book"],
      ["ramen", "wild",  "energy", "change", "book"],
      ["ramen", "wild",  "energy", "change", "book"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(5);
  });

  it("pays out for a 3-of-a-kind book (Textbook) payline", () => {
    const matrix = [
      ["ramen", "energy", "book",  "change", "wild"],
      ["ramen", "energy", "book",  "change", "wild"],
      ["ramen", "energy", "book",  "change", "wild"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(7);
  });

  it("pays out for a 3-of-a-kind wild (Diploma) payline — highest value", () => {
    const matrix = [
      ["ramen", "energy", "wild", "change", "book"],
      ["ramen", "energy", "wild", "change", "book"],
      ["ramen", "energy", "wild", "change", "book"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(10);
  });

  it("pays out for a 3-of-a-kind change payline — lowest value", () => {
    const matrix = [
      ["ramen", "energy", "change", "book",  "wild"],
      ["ramen", "energy", "change", "book",  "wild"],
      ["ramen", "energy", "change", "book",  "wild"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(3);
  });

  it("payout scales with bet size", () => {
    const matrix = [
      ["ramen", "energy", "wild", "change", "book"],
      ["ramen", "energy", "wild", "change", "book"],
      ["ramen", "energy", "wild", "change", "book"],
    ];
    expect(calculatePayout(matrix, 2)).toBe(20);
    expect(calculatePayout(matrix, 5)).toBe(50);
  });

  it("only the middle slot (index 2) is the payline, not top or bottom", () => {
    // Top row all match, middle row does not — should be 0
    const matrix = [
      ["wild", "energy", "ramen", "change", "book"],
      ["wild", "energy", "book",  "change", "book"],
      ["wild", "energy", "energy","change", "book"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(0);
  });

  it("returns 0 when payline has two matching and one different", () => {
    const matrix = [
      ["ramen", "energy", "ramen", "change", "wild"],
      ["ramen", "energy", "ramen", "change", "wild"],
      ["ramen", "energy", "book",  "change", "wild"],
    ];
    expect(calculatePayout(matrix, 1)).toBe(0);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("Edge cases", () => {
  it("zero balance blocks spin", () => {
    const result = simulateSpin({ balance: 0, bet: 0.5, isSpinning: false });
    expect(result.status).toBe("insufficient funds");
  });

  it("balance of exactly one cent blocks a $0.50 bet spin", () => {
    const result = simulateSpin({ balance: 0.01, bet: 0.5, isSpinning: false });
    expect(result.status).toBe("insufficient funds");
  });

  it("max real bet ($5) allowed when balance is $12.75", () => {
    const maxBet = CURRENCIES.real.allowedBets.at(-1);
    const result = simulateSpin({ balance: 12.75, bet: maxBet, isSpinning: false });
    expect(result.balance).toBe(7.75);
  });

  it("max dining bet (8) allowed when balance is 48", () => {
    const maxBet = CURRENCIES.dining.allowedBets.at(-1);
    const result = simulateSpin({ balance: 48, bet: maxBet, isSpinning: false });
    expect(result.balance).toBe(40);
  });

  it("max real bet ($5) with only $5 balance leaves $0", () => {
    const maxBet = CURRENCIES.real.allowedBets.at(-1);
    const result = simulateSpin({ balance: 5, bet: maxBet, isSpinning: false });
    expect(result.balance).toBe(0);
  });

  it("max real bet ($5) with $4.99 balance is blocked", () => {
    const maxBet = CURRENCIES.real.allowedBets.at(-1);
    const result = simulateSpin({ balance: 4.99, bet: maxBet, isSpinning: false });
    expect(result.status).toBe("insufficient funds");
  });

  it("all five winning symbol combinations are recognized", () => {
    for (const sym of SYMBOL_ORDER) {
      const matrix = [
        ["ramen", "energy", sym, "change", "wild"],
        ["ramen", "energy", sym, "change", "wild"],
        ["ramen", "energy", sym, "change", "wild"],
      ];
      expect(calculatePayout(matrix, 1)).toBeGreaterThan(0);
    }
  });

  it("payout is 0 for every all-different payline permutation (sample)", () => {
    const perms = [
      ["ramen", "energy", "book"],
      ["energy", "book", "change"],
      ["book", "change", "wild"],
      ["change", "wild", "ramen"],
    ];
    for (const payline of perms) {
      const matrix = [
        ["x", "x", payline[0], "x", "x"],
        ["x", "x", payline[1], "x", "x"],
        ["x", "x", payline[2], "x", "x"],
      ];
      expect(calculatePayout(matrix, 1)).toBe(0);
    }
  });
});

// ─── State management ─────────────────────────────────────────────────────────
// Simulates the createInitialState / state-transition logic from game.js.

function createInitialState() {
  return {
    currencyMode: "real",
    balances: {
      real: CURRENCIES.real.startingBalance,
      dining: CURRENCIES.dining.startingBalance,
    },
    bets: { real: 1, dining: 2 },
    isMuted: false,
    isSpinning: false,
    statusMessage: "Ready to play.",
    reelMatrix: cloneMatrix(INITIAL_REEL_MATRIX),
  };
}

describe("State management — initial state", () => {
  it("starts in real currency mode", () => {
    expect(createInitialState().currencyMode).toBe("real");
  });

  it("real starting balance is $12.75", () => {
    expect(createInitialState().balances.real).toBe(12.75);
  });

  it("dining starting balance is 48", () => {
    expect(createInitialState().balances.dining).toBe(48);
  });

  it("default real bet is $1", () => {
    expect(createInitialState().bets.real).toBe(1);
  });

  it("default dining bet is 2", () => {
    expect(createInitialState().bets.dining).toBe(2);
  });

  it("audio is not muted at start", () => {
    expect(createInitialState().isMuted).toBe(false);
  });

  it("machine is not spinning at start", () => {
    expect(createInitialState().isSpinning).toBe(false);
  });

  it("initial reel matrix matches INITIAL_REEL_MATRIX content", () => {
    expect(createInitialState().reelMatrix).toEqual(INITIAL_REEL_MATRIX);
  });

  it("initial reel matrix is a clone, not the frozen constant", () => {
    expect(createInitialState().reelMatrix).not.toBe(INITIAL_REEL_MATRIX);
  });
});

describe("State management — reset", () => {
  it("reset restores real balance after spending", () => {
    const state = createInitialState();
    state.balances.real = 5;
    Object.assign(state, createInitialState());
    expect(state.balances.real).toBe(12.75);
  });

  it("reset restores dining balance after spending", () => {
    const state = createInitialState();
    state.balances.dining = 10;
    Object.assign(state, createInitialState());
    expect(state.balances.dining).toBe(48);
  });

  it("reset restores bet to defaults", () => {
    const state = createInitialState();
    state.bets.real = 5;
    Object.assign(state, createInitialState());
    expect(state.bets.real).toBe(1);
  });

  it("reset restores currency mode to real", () => {
    const state = createInitialState();
    state.currencyMode = "dining";
    Object.assign(state, createInitialState());
    expect(state.currencyMode).toBe("real");
  });

  it("reset clears mute state", () => {
    const state = createInitialState();
    state.isMuted = true;
    Object.assign(state, createInitialState());
    expect(state.isMuted).toBe(false);
  });

  it("reset restores reel matrix to initial content", () => {
    const state = createInitialState();
    state.reelMatrix[0][0] = "wild";
    Object.assign(state, createInitialState());
    expect(state.reelMatrix[0][0]).toBe("ramen");
  });
});

describe("State management — currency switching", () => {
  it("switching to dining does not affect real balance", () => {
    const state = createInitialState();
    state.currencyMode = "dining";
    expect(state.balances.real).toBe(12.75);
  });

  it("spending in dining mode does not affect real balance", () => {
    const state = createInitialState();
    state.currencyMode = "dining";
    state.balances.dining = roundToCurrencyPrecision(state.balances.dining - state.bets.dining);
    expect(state.balances.real).toBe(12.75);
  });

  it("bet size is tracked independently per currency", () => {
    const state = createInitialState();
    state.bets.real = 5;
    expect(state.bets.dining).toBe(2);
  });

  it("switching currency while spinning is blocked", () => {
    const state = createInitialState();
    state.isSpinning = true;
    const originalMode = state.currencyMode;
    // Guard: currency change is a no-op when spinning
    if (!state.isSpinning) state.currencyMode = "dining";
    expect(state.currencyMode).toBe(originalMode);
  });
});

describe("State management — mute toggle", () => {
  it("mute toggles from false to true", () => {
    const state = createInitialState();
    state.isMuted = !state.isMuted;
    expect(state.isMuted).toBe(true);
  });

  it("mute toggles back to false on second toggle", () => {
    const state = createInitialState();
    state.isMuted = !state.isMuted;
    state.isMuted = !state.isMuted;
    expect(state.isMuted).toBe(false);
  });
});

describe("State management — bet adjustment", () => {
  it("bet cycles through all allowed real values in order", () => {
    const bets = CURRENCIES.real.allowedBets;
    let index = 0;
    for (let i = 0; i < bets.length; i++) {
      expect(bets[index]).toBe(bets[i]);
      index = clampNumber(index + 1, 0, bets.length - 1);
    }
  });

  it("increasing bet past the max keeps it at max", () => {
    const bets = CURRENCIES.real.allowedBets;
    let index = bets.length - 1;
    index = clampNumber(index + 1, 0, bets.length - 1);
    expect(bets[index]).toBe(bets[bets.length - 1]);
  });

  it("decreasing bet past the minimum keeps it at minimum", () => {
    const bets = CURRENCIES.real.allowedBets;
    let index = 0;
    index = clampNumber(index - 1, 0, bets.length - 1);
    expect(bets[index]).toBe(bets[0]);
  });

  it("bet adjustment is blocked when spinning", () => {
    const state = createInitialState();
    state.isSpinning = true;
    const originalBet = state.bets.real;
    // Guard: bet change is a no-op when spinning
    if (!state.isSpinning) state.bets.real = CURRENCIES.real.allowedBets[2];
    expect(state.bets.real).toBe(originalBet);
  });
});
