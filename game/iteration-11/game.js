/* global document, HTMLElement, HTMLButtonElement, HTMLDivElement */

// Matrix population logic: each spin first resolves an explicit per-reel spin result from weighted symbol
// selection, then converts that validated result into `reelMatrix[reelIndex][slotIndex]`. Separating
// weighted randomness, reel outcomes, and matrix construction keeps the UI spin path thin and gives later
// payout, payline, wild, and scatter work a reusable math layer.
// Payline traversal logic: each payline is stored as ordered reel/slot coordinate pairs. Evaluation reads
// each coordinate as `reelMatrix[reelIndex][slotIndex]`, moving across reel arrays while preserving the
// existing matrix orientation instead of transposing the grid into rows first.
// Payout calculation logic: matched paylines are priced by multiplying the active bet by the configured
// symbol multiplier, then summing those line payouts into one balance delta.
// Wild and Scatter evaluation logic: a Wild can stand in for the first regular symbol found on a payline,
// so a line such as Wild/Ramen/Ramen is evaluated as an effective Ramen match. Scatter never becomes a
// payline target and Wild never substitutes for Scatter; Scatters are counted in a separate full-matrix pass
// so later bonus work can use that count without complicating payline matching.

/**
 * @module game
 * @description Foundational Vanilla JS architecture for the broke college slot machine.
 */

/**
 * @typedef {"real" | "dining"} CurrencyMode
 */

/**
 * @typedef {"ramen" | "energy" | "book" | "change" | "wild" | "scatter"} SymbolId
 */

/**
 * @typedef {object} CurrencyConfig
 * @property {CurrencyMode} id Internal currency identifier.
 * @property {string} label Human-readable currency label.
 * @property {string} prefix Prefix used for display formatting.
 * @property {number} startingBalance Initial balance for the currency.
 * @property {number[]} allowedBets Supported bet sizes for the currency.
 * @property {number} betStep Default step amount for fallback calculations.
 */

/**
 * @typedef {object} SymbolConfig
 * @property {SymbolId} id Internal symbol identifier.
 * @property {string} label Human-readable symbol label.
 * @property {string} className CSS class used for styling a symbol slot.
 */

/**
 * @typedef {object} GameState
 * @property {CurrencyMode} currencyMode Active wallet mode.
 * @property {Record<CurrencyMode, number>} balances Current balance by currency.
 * @property {Record<CurrencyMode, number>} bets Current bet by currency.
 * @property {boolean} isMuted Whether audio is muted.
 * @property {boolean} isSpinning Whether a spin is in progress.
 * @property {string} statusMessage Current status text.
 * @property {SymbolId[][]} reelMatrix Current 3x5 symbol matrix.
 * @property {PaylineEvaluationSummary} paylineResults Current invisible payline evaluation output.
 * @property {PayoutApplicationResult} payoutResults Current invisible payout calculation output.
 */

/**
 * @typedef {object} ReelSlotElement
 * @property {HTMLDivElement} element Slot element.
 * @property {number} reelIndex Zero-based reel index.
 * @property {number} slotIndex Zero-based slot index.
 */

/**
 * @typedef {object} ReelSlotRenderInstruction
 * @property {HTMLDivElement} element Slot element to update.
 * @property {number} reelIndex Zero-based reel index.
 * @property {number} slotIndex Zero-based slot index.
 * @property {SymbolId} symbolId Symbol identifier currently assigned to the slot.
 * @property {string} symbolLabel Human-readable symbol label for visible text.
 * @property {string} symbolClassName CSS class that skins the slot.
 * @property {string} ariaLabel Accessible label describing the rendered slot.
 */

/**
 * @typedef {object} DomCache
 * @property {HTMLElement} balanceValue Balance text node.
 * @property {HTMLElement} balanceMeta Currency mode text node.
 * @property {HTMLElement} betDisplay Bet text node.
 * @property {HTMLElement} statusText Status text node.
 * @property {HTMLButtonElement} realCurrencyButton Real currency toggle button.
 * @property {HTMLButtonElement} diningCurrencyButton Dining dollars toggle button.
 * @property {HTMLButtonElement} muteButton Mute toggle button.
 * @property {HTMLButtonElement} decreaseBetButton Bet decrement button.
 * @property {HTMLButtonElement} increaseBetButton Bet increment button.
 * @property {HTMLButtonElement} spinButton Spin action button.
 * @property {HTMLButtonElement} resetButton Reset action button.
 * @property {ReelSlotElement[]} reelSlots Flattened reel slot list in DOM order.
 */

/**
 * @typedef {object} SymbolWeightEntry
 * @property {SymbolId} symbolId Internal symbol identifier.
 * @property {number} weight Relative spawn weight for the symbol.
 */

/**
 * @typedef {object} WeightedSymbolEntry
 * @property {SymbolId} symbolId Internal symbol identifier.
 * @property {number} weight Relative spawn weight for the symbol.
 * @property {number} cumulativeWeight Running cumulative weight threshold.
 */

/**
 * @typedef {object} WeightedSymbolTable
 * @property {Readonly<Record<SymbolId, number>>} weightBySymbol Symbol-to-weight lookup.
 * @property {Readonly<WeightedSymbolEntry[]>} entries Ordered weighted entries with cumulative thresholds.
 * @property {number} totalWeight Total weight across all configured symbols.
 */

/**
 * @typedef {object} ReelSpinResult
 * @property {number} reelIndex Zero-based reel index.
 * @property {SymbolId[]} symbols Ordered symbol sequence for one reel.
 */

/**
 * @typedef {object} SpinResult
 * @property {number} reelCount Number of reels in the spin.
 * @property {number} slotsPerReel Number of slots generated for each reel.
 * @property {ReelSpinResult[]} reels Ordered per-reel spin results.
 */

/**
 * @typedef {object} PaylineCoordinate
 * @property {number} reelIndex Zero-based reel index used as the first matrix index.
 * @property {number} slotIndex Zero-based slot index used as the second matrix index.
 */

/**
 * @typedef {object} PaylineDefinition
 * @property {string} id Stable payline identifier.
 * @property {number} index Zero-based payline index.
 * @property {readonly PaylineCoordinate[]} coordinates Ordered matrix coordinates for this payline.
 */

/**
 * @typedef {object} PaylineMatch
 * @property {string} paylineId Stable payline identifier.
 * @property {number} paylineIndex Zero-based payline index.
 * @property {SymbolId} matchedSymbolId Effective symbol that matched across the payline.
 * @property {number} matchCount Number of matching symbols on the payline.
 * @property {PaylineCoordinate[]} coordinates Coordinates that formed the match.
 * @property {PaylineCoordinate[]} wildCoordinates Coordinates where Wild substituted in the match.
 * @property {SymbolId[]} symbols Symbol sequence read from the payline.
 */

/**
 * @typedef {object} PaylineEvaluation
 * @property {string} paylineId Stable payline identifier.
 * @property {number} paylineIndex Zero-based payline index.
 * @property {PaylineCoordinate[]} coordinates Coordinates checked for this payline.
 * @property {SymbolId[]} symbols Symbol sequence read from the matrix.
 * @property {boolean} isMatch Whether every symbol on the payline matched after Wild handling.
 * @property {SymbolId|null} matchedSymbolId Effective matching symbol identifier, or null when unmatched.
 * @property {number} matchCount Number of matching symbols, or 0 when unmatched.
 * @property {PaylineCoordinate[]} wildCoordinates Coordinates where Wild substituted in this evaluation.
 * @property {SymbolId} wildSymbolId Wild symbol used by the evaluation.
 * @property {SymbolId} scatterSymbolId Scatter symbol excluded from payline matching.
 */

/**
 * @typedef {object} PaylineEvaluationSummary
 * @property {PaylineEvaluation[]} evaluations Evaluation output for every configured payline.
 * @property {PaylineMatch[]} matches Only paylines that matched.
 * @property {ScatterEvaluation} scatterEvaluation Scatter count and positions across the full matrix.
 * @property {number} scatterCount Number of Scatter symbols anywhere on the grid.
 * @property {SymbolId} wildSymbolId Wild symbol used by payline matching.
 * @property {SymbolId} scatterSymbolId Scatter symbol counted outside paylines.
 */

/**
 * @typedef {object} ScatterEvaluation
 * @property {SymbolId} scatterSymbolId Scatter symbol counted across the matrix.
 * @property {number} count Number of Scatter symbols found anywhere on the grid.
 * @property {PaylineCoordinate[]} coordinates Coordinates containing Scatter symbols.
 */

/**
 * @typedef {object} PaylinePayout
 * @property {string} paylineId Stable payline identifier.
 * @property {number} paylineIndex Zero-based payline index.
 * @property {SymbolId} matchedSymbolId Symbol that matched across the payline.
 * @property {number} matchCount Number of matching symbols on the payline.
 * @property {number} betAmount Bet amount used to calculate the payout.
 * @property {number} multiplier Symbol payout multiplier.
 * @property {number} payoutAmount Payout amount for this payline.
 * @property {PaylineCoordinate[]} coordinates Coordinates that formed the match.
 */

/**
 * @typedef {object} PayoutCalculationResult
 * @property {number} betAmount Bet amount used for all payline payout calculations.
 * @property {PaylinePayout[]} paylinePayouts Payout details for each matched payline.
 * @property {PaylinePayout[]} contributingPaylines Matched paylines with a positive payout amount.
 * @property {number} totalPayoutAmount Total payout amount across all matched paylines.
 */

/**
 * @typedef {object} PayoutApplicationResult
 * @property {number} previousBalance Balance before payout was applied.
 * @property {number} balanceDelta Positive payout amount added to the balance.
 * @property {number} updatedBalance Balance after payout was applied.
 * @property {PayoutCalculationResult} payoutSummary Structured payout calculation details.
 */

/** @type {Readonly<Record<CurrencyMode, CurrencyConfig>>} */
const CURRENCIES = Object.freeze({
  real: Object.freeze({
    id: "real",
    label: "Real Currency",
    prefix: "$",
    startingBalance: 12.75,
    allowedBets: [0.5, 1, 2, 3, 5],
    betStep: 0.5
  }),
  dining: Object.freeze({
    id: "dining",
    label: "Dining Dollars",
    prefix: "DD ",
    startingBalance: 48,
    allowedBets: [1, 2, 4, 6, 8],
    betStep: 1
  })
});

/** @type {Readonly<Record<SymbolId, SymbolConfig>>} */
const SYMBOLS = Object.freeze({
  ramen: Object.freeze({ id: "ramen", label: "Ramen", className: "symbol-ramen" }),
  energy: Object.freeze({ id: "energy", label: "Energy", className: "symbol-energy" }),
  book: Object.freeze({ id: "book", label: "Textbook", className: "symbol-book" }),
  change: Object.freeze({ id: "change", label: "Change", className: "symbol-change" }),
  wild: Object.freeze({ id: "wild", label: "Diploma", className: "symbol-wild" }),
  scatter: Object.freeze({ id: "scatter", label: "Scholarship", className: "symbol-scatter" })
});

/** @type {Readonly<SymbolId[]>} */
const SYMBOL_ORDER = Object.freeze(/** @type {SymbolId[]} */ (Object.keys(SYMBOLS)));

/** @type {SymbolId} */
const WILD_SYMBOL_ID = "wild";

/** @type {SymbolId} */
const SCATTER_SYMBOL_ID = "scatter";

/** @type {Readonly<SymbolWeightEntry[]>} */
const SYMBOL_WEIGHT_ENTRIES = Object.freeze([
  Object.freeze({ symbolId: "ramen", weight: 40 }),
  Object.freeze({ symbolId: "energy", weight: 30 }),
  Object.freeze({ symbolId: "book", weight: 18 }),
  Object.freeze({ symbolId: "change", weight: 10 }),
  Object.freeze({ symbolId: "wild", weight: 2 }),
  Object.freeze({ symbolId: "scatter", weight: 3 })
]);

/** @type {Readonly<Record<SymbolId, number>>} */
const SYMBOL_PAYOUT_MULTIPLIERS = Object.freeze({
  ramen: 2,
  energy: 3,
  book: 6,
  change: 4,
  wild: 0,
  scatter: 0
});

/** @type {Readonly<SymbolId[][]>} */
const INITIAL_REEL_MATRIX = Object.freeze([
  Object.freeze(["ramen", "energy", "book", "change", "wild"]),
  Object.freeze(["change", "ramen", "wild", "book", "energy"]),
  Object.freeze(["book", "change", "ramen", "energy", "wild"])
]);

/** @type {Readonly<Record<string, string>>} */
const SYMBOL_CLASS_LOOKUP = Object.freeze(
  SYMBOL_ORDER.reduce(
    /**
     * @param {Record<string, string>} classLookup Current lookup object.
     * @param {SymbolId} symbolId Symbol identifier.
     * @returns {Record<string, string>} Updated lookup object.
     */
    (classLookup, symbolId) => {
      classLookup[symbolId] = SYMBOLS[symbolId].className;
      return classLookup;
    },
    {}
  )
);

/** @type {WeightedSymbolTable} */
const WEIGHTED_SYMBOL_TABLE = createWeightedSymbolTable(SYMBOL_WEIGHT_ENTRIES, SYMBOLS);

const REEL_COUNT = INITIAL_REEL_MATRIX.length;
const SLOTS_PER_REEL = INITIAL_REEL_MATRIX[0].length;

/** @type {Readonly<PaylineDefinition[]>} */
const PAYLINES = createPaylineDefinitions([
  [
    { reelIndex: 0, slotIndex: 0 },
    { reelIndex: 1, slotIndex: 0 },
    { reelIndex: 2, slotIndex: 0 }
  ],
  [
    { reelIndex: 0, slotIndex: 1 },
    { reelIndex: 1, slotIndex: 1 },
    { reelIndex: 2, slotIndex: 1 }
  ],
  [
    { reelIndex: 0, slotIndex: 2 },
    { reelIndex: 1, slotIndex: 2 },
    { reelIndex: 2, slotIndex: 2 }
  ],
  [
    { reelIndex: 0, slotIndex: 3 },
    { reelIndex: 1, slotIndex: 3 },
    { reelIndex: 2, slotIndex: 3 }
  ],
  [
    { reelIndex: 0, slotIndex: 4 },
    { reelIndex: 1, slotIndex: 4 },
    { reelIndex: 2, slotIndex: 4 }
  ]
]);

/**
 * Creates the initial mutable game state.
 * @returns {GameState} Fresh game state object.
 */
function createInitialState() {
  /** @type {CurrencyMode} */
  const initialCurrencyMode = "real";
  /** @type {Record<CurrencyMode, number>} */
  const initialBalances = {
    real: CURRENCIES.real.startingBalance,
    dining: CURRENCIES.dining.startingBalance
  };
  /** @type {Record<CurrencyMode, number>} */
  const initialBets = {
    real: 1,
    dining: 2
  };

  return {
    currencyMode: initialCurrencyMode,
    balances: initialBalances,
    bets: initialBets,
    isMuted: false,
    isSpinning: false,
    statusMessage: "Ready to play.",
    reelMatrix: cloneMatrix(INITIAL_REEL_MATRIX),
    paylineResults: evaluateAllPaylines(INITIAL_REEL_MATRIX, PAYLINES),
    payoutResults: applyPayoutToBalance(
      initialBalances[initialCurrencyMode],
      calculateTotalPayout([], initialBets[initialCurrencyMode], SYMBOL_PAYOUT_MULTIPLIERS)
    )
  };
}

/** @type {GameState} */
const state = createInitialState();

/**
 * Boots the slot machine once the DOM is available.
 * @returns {void}
 */
function init() {
  const dom = getDomCache();
  bindEvents(dom);
  render(dom);
}

/**
 * Builds a cached set of DOM references used throughout the app.
 * @returns {DomCache} Cached DOM references.
 * @throws {Error} Throws when a required DOM node is missing.
 */
function getDomCache() {
  const statCard = getRequiredElement(".stat-card", HTMLElement);
  const balanceValue = getRequiredElement(".stat-value", HTMLElement, statCard);
  const balanceMeta = getRequiredElement(".stat-meta", HTMLElement, statCard);
  const betDisplay = getRequiredElement(".bet-display", HTMLElement);
  const statusText = getRequiredElement(".status-text", HTMLElement);

  const currencyButtons = getButtonGroup(".segmented-control .chip", 2);
  const realCurrencyButton = currencyButtons[0];
  const diningCurrencyButton = currencyButtons[1];

  const muteButton = getRequiredElement(".chip-wide", HTMLButtonElement);

  const betControls = getButtonGroup(".bet-controls .chip", 2);
  const decreaseBetButton = betControls[0];
  const increaseBetButton = betControls[1];

  const actionButtons = getButtonGroup(".action-stack .action-button", 2);
  const spinButton = actionButtons[0];
  const resetButton = actionButtons[1];

  const reelSlots = getReelSlots();

  return {
    balanceValue,
    balanceMeta,
    betDisplay,
    statusText,
    realCurrencyButton,
    diningCurrencyButton,
    muteButton,
    decreaseBetButton,
    increaseBetButton,
    spinButton,
    resetButton,
    reelSlots
  };
}

/**
 * Finds a required element and validates its type.
 * @template {Element} T
 * @param {string} selector CSS selector for the element.
 * @param {new (...args: any[]) => T} ElementType Constructor used for runtime validation.
 * @param {ParentNode} [parent=document] Parent node used for the query.
 * @returns {T} Matching element.
 * @throws {Error} Throws when the element is missing or has the wrong type.
 */
function getRequiredElement(selector, ElementType, parent = document) {
  const element = parent.querySelector(selector);

  if (!(element instanceof ElementType)) {
    throw new Error(`Required element missing or invalid for selector: ${selector}`);
  }

  return element;
}

/**
 * Returns a required button group with an exact minimum size.
 * @param {string} selector CSS selector for the button group.
 * @param {number} minimumCount Minimum number of buttons required.
 * @returns {HTMLButtonElement[]} Ordered array of buttons.
 * @throws {Error} Throws when the button group is incomplete.
 */
function getButtonGroup(selector, minimumCount) {
  const buttons = Array.from(document.querySelectorAll(selector)).filter(
    /**
     * @param {Element} element Candidate DOM node.
     * @returns {element is HTMLButtonElement} Whether the node is a button.
     */
    (element) => element instanceof HTMLButtonElement
  );

  if (buttons.length < minimumCount) {
    throw new Error(`Expected at least ${minimumCount} buttons for selector: ${selector}`);
  }

  return buttons;
}

/**
 * Collects reel slot nodes in DOM order.
 * @returns {ReelSlotElement[]} Flattened reel slot metadata.
 * @throws {Error} Throws when the reel structure is incomplete.
 */
function getReelSlots() {
  const reels = Array.from(document.querySelectorAll("#reels .reel")).filter(
    /**
     * @param {Element} element Candidate DOM node.
     * @returns {element is HTMLDivElement} Whether the node is a reel container.
     */
    (element) => element instanceof HTMLDivElement
  );

  if (reels.length !== INITIAL_REEL_MATRIX.length) {
    throw new Error("Unexpected reel count in DOM.");
  }

  return reels.flatMap(
    /**
     * @param {HTMLDivElement} reel Reel container element.
     * @param {number} reelIndex Reel position.
     * @returns {ReelSlotElement[]} Slot metadata for a single reel.
     */
    (reel, reelIndex) => {
      const slots = Array.from(reel.querySelectorAll(".symbol-slot")).filter(
        /**
         * @param {Element} element Candidate slot element.
         * @returns {element is HTMLDivElement} Whether the node is a symbol slot.
         */
        (element) => element instanceof HTMLDivElement
      );

      if (slots.length !== INITIAL_REEL_MATRIX[reelIndex].length) {
        throw new Error(`Unexpected slot count in reel ${reelIndex + 1}.`);
      }

      return slots.map(
        /**
         * @param {HTMLDivElement} element Slot element.
         * @param {number} slotIndex Slot position.
         * @returns {ReelSlotElement} Slot metadata.
         */
        (element, slotIndex) => ({
          element,
          reelIndex,
          slotIndex
        })
      );
    }
  );
}

/**
 * Registers all UI event handlers.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function bindEvents(dom) {
  dom.realCurrencyButton.addEventListener("click", handleCurrencyChange.bind(null, dom, "real"));
  dom.diningCurrencyButton.addEventListener(
    "click",
    handleCurrencyChange.bind(null, dom, "dining")
  );
  dom.muteButton.addEventListener("click", handleMuteToggle.bind(null, dom));
  dom.decreaseBetButton.addEventListener("click", handleBetAdjustment.bind(null, dom, -1));
  dom.increaseBetButton.addEventListener("click", handleBetAdjustment.bind(null, dom, 1));
  dom.spinButton.addEventListener("click", handleSpin.bind(null, dom));
  dom.resetButton.addEventListener("click", handleReset.bind(null, dom));
}

/**
 * Handles wallet mode switching.
 * @param {DomCache} dom Cached DOM references.
 * @param {CurrencyMode} currencyMode Target currency mode.
 * @returns {void}
 */
function handleCurrencyChange(dom, currencyMode) {
  if (state.isSpinning || state.currencyMode === currencyMode) {
    return;
  }

  state.currencyMode = currencyMode;
  state.statusMessage = `${CURRENCIES[currencyMode].label} selected.`;
  render(dom);
}

/**
 * Handles bet adjustments.
 * @param {DomCache} dom Cached DOM references.
 * @param {number} direction Negative for decrement, positive for increment.
 * @returns {void}
 */
function handleBetAdjustment(dom, direction) {
  if (state.isSpinning) {
    return;
  }

  const currencyMode = state.currencyMode;
  const allowedBets = CURRENCIES[currencyMode].allowedBets;
  const currentIndex = allowedBets.indexOf(state.bets[currencyMode]);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = clampNumber(safeIndex + direction, 0, allowedBets.length - 1);
  const nextBet = allowedBets[nextIndex];

  if (nextBet === state.bets[currencyMode]) {
    state.statusMessage = `Bet already at ${direction > 0 ? "maximum" : "minimum"} for ${CURRENCIES[currencyMode].label}.`;
    render(dom);
    return;
  }

  state.bets[currencyMode] = nextBet;
  state.statusMessage = `Bet set to ${formatAmount(nextBet, currencyMode)}.`;
  render(dom);
}

/**
 * Handles the mute button.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleMuteToggle(dom) {
  state.isMuted = !state.isMuted;
  state.statusMessage = state.isMuted ? "Audio muted." : "Audio enabled.";
  render(dom);
}

/**
 * Performs a basic spin using randomized symbols.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleSpin(dom) {
  if (state.isSpinning) {
    return;
  }

  const currencyMode = state.currencyMode;
  const currentBet = state.bets[currencyMode];
  const currentBalance = state.balances[currencyMode];

  if (currentBalance < currentBet) {
    state.statusMessage = `Not enough ${CURRENCIES[currencyMode].label.toLowerCase()} for that bet.`;
    render(dom);
    return;
  }

  state.isSpinning = true;
  state.balances[currencyMode] = roundToCurrencyPrecision(currentBalance - currentBet);
  const spinResult = createSpinResult(REEL_COUNT, SLOTS_PER_REEL);
  const reelMatrix = createReelMatrixFromSpinResult(spinResult);
  const paylineResults = evaluateAllPaylines(reelMatrix, PAYLINES);
  const payoutSummary = calculateTotalPayout(
    paylineResults.matches,
    currentBet,
    SYMBOL_PAYOUT_MULTIPLIERS
  );
  const payoutResults = applyPayoutToBalance(state.balances[currencyMode], payoutSummary);

  state.reelMatrix = reelMatrix;
  state.paylineResults = paylineResults;
  state.payoutResults = payoutResults;
  state.balances[currencyMode] = payoutResults.updatedBalance;
  state.statusMessage = `Spent ${formatAmount(currentBet, currencyMode)}. Spin complete.`;
  state.isSpinning = false;
  render(dom);
}

/**
 * Restores the initial machine state.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleReset(dom) {
  const initialState = createInitialState();
  state.currencyMode = initialState.currencyMode;
  state.balances = initialState.balances;
  state.bets = initialState.bets;
  state.isMuted = initialState.isMuted;
  state.isSpinning = initialState.isSpinning;
  state.statusMessage = "Machine reset. Ready to play.";
  state.reelMatrix = initialState.reelMatrix;
  state.paylineResults = initialState.paylineResults;
  state.payoutResults = initialState.payoutResults;
  render(dom);
}

/**
 * Renders the entire application state.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function render(dom) {
  renderBalance(dom);
  renderCurrencyButtons(dom);
  renderMuteButton(dom);
  renderBetDisplay(dom);
  renderReels(dom);
  renderControls(dom);
  renderStatus(dom);
}

/**
 * Renders balance-related UI.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderBalance(dom) {
  const currencyMode = state.currencyMode;
  dom.balanceValue.textContent = formatAmount(state.balances[currencyMode], currencyMode);
  dom.balanceValue.setAttribute(
    "aria-label",
    `Current balance amount ${formatAmount(state.balances[currencyMode], currencyMode)}`
  );
  dom.balanceMeta.textContent = CURRENCIES[currencyMode].label;
  dom.balanceMeta.setAttribute(
    "aria-label",
    `Current currency mode ${CURRENCIES[currencyMode].label}`
  );
}

/**
 * Renders currency toggle button state.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderCurrencyButtons(dom) {
  updateToggleButton(dom.realCurrencyButton, state.currencyMode === "real");
  updateToggleButton(dom.diningCurrencyButton, state.currencyMode === "dining");
}

/**
 * Renders the mute button label.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderMuteButton(dom) {
  dom.muteButton.textContent = state.isMuted ? "Unmute" : "Mute";
  dom.muteButton.setAttribute(
    "aria-label",
    state.isMuted ? "Unmute machine audio" : "Mute machine audio"
  );
}

/**
 * Renders the current bet display.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderBetDisplay(dom) {
  const currencyMode = state.currencyMode;
  const betAmount = formatAmount(state.bets[currencyMode], currencyMode);
  dom.betDisplay.textContent = betAmount;
  dom.betDisplay.setAttribute("aria-label", `Current bet size ${betAmount}`);
}

/**
 * Renders the reel matrix into the existing DOM slots.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderReels(dom) {
  const reelSlotRenderInstructions = createReelSlotRenderInstructions(state.reelMatrix, dom.reelSlots);
  applyReelSlotRenderInstructions(reelSlotRenderInstructions);
}

/**
 * Renders button disabled states.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderControls(dom) {
  const canAffordSpin = state.balances[state.currencyMode] >= state.bets[state.currencyMode];
  dom.spinButton.disabled = state.isSpinning || !canAffordSpin;
  dom.decreaseBetButton.disabled = state.isSpinning;
  dom.increaseBetButton.disabled = state.isSpinning;
  dom.realCurrencyButton.disabled = state.isSpinning;
  dom.diningCurrencyButton.disabled = state.isSpinning;
  dom.resetButton.disabled = state.isSpinning;
}

/**
 * Renders the status message.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderStatus(dom) {
  dom.statusText.textContent = state.statusMessage;
  dom.statusText.setAttribute("aria-label", `Game status ${state.statusMessage}`);
}

/**
 * Applies active button styling in a single place.
 * @param {HTMLButtonElement} button Button to update.
 * @param {boolean} isActive Whether the button is active.
 * @returns {void}
 */
function updateToggleButton(button, isActive) {
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
}

/**
 * Clears existing symbol skin classes before applying a new one.
 * @param {HTMLDivElement} element Symbol slot element.
 * @returns {void}
 */
function resetSymbolClasses(element) {
  element.classList.remove(...Object.values(SYMBOL_CLASS_LOOKUP));
}

// DOM sync logic: rendering first derives a validated, deterministic update instruction for every reel slot
// from `reelMatrix[reelIndex][slotIndex]`, then applies those instructions to the existing cached elements.
// This keeps matrix reading pure and reusable while concentrating direct DOM writes in one tiny function.

/**
 * Builds the full set of slot render instructions needed to sync the DOM with the current reel matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {readonly ReelSlotElement[]} reelSlots Cached reel slot metadata from the DOM.
 * @returns {ReelSlotRenderInstruction[]} Ordered render instructions for every visible slot.
 * @throws {Error} Throws when the matrix or slot metadata does not match the expected reel layout.
 */
function createReelSlotRenderInstructions(reelMatrix, reelSlots) {
  validateReelMatrix(reelMatrix, REEL_COUNT, SLOTS_PER_REEL);
  validateReelSlotElements(reelSlots, REEL_COUNT, SLOTS_PER_REEL);

  return reelSlots.map(
    /**
     * @param {ReelSlotElement} reelSlot Reel slot metadata.
     * @returns {ReelSlotRenderInstruction} Render instruction for the slot.
     */
    (reelSlot) => createReelSlotRenderInstruction(reelMatrix, reelSlot)
  );
}

/**
 * Builds the render instruction for a single slot using the reel-oriented matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {ReelSlotElement} reelSlot Cached reel slot metadata.
 * @returns {ReelSlotRenderInstruction} Render instruction for one slot.
 * @throws {Error} Throws when the matrix or slot metadata is invalid.
 */
function createReelSlotRenderInstruction(reelMatrix, reelSlot) {
  validateReelMatrix(reelMatrix, REEL_COUNT, SLOTS_PER_REEL);
  validateReelSlotElement(reelSlot, REEL_COUNT, SLOTS_PER_REEL);

  const { element, reelIndex, slotIndex } = reelSlot;
  const symbolId = reelMatrix[reelIndex][slotIndex];
  const symbol = SYMBOLS[symbolId];

  return {
    element,
    reelIndex,
    slotIndex,
    symbolId,
    symbolLabel: symbol.label,
    symbolClassName: symbol.className,
    ariaLabel: createReelSlotAriaLabel(reelIndex, slotIndex, symbol.label)
  };
}

/**
 * Builds the accessible label for one rendered reel slot.
 * @param {number} reelIndex Zero-based reel index.
 * @param {number} slotIndex Zero-based slot index.
 * @param {string} symbolLabel Human-readable symbol label.
 * @returns {string} Accessible label for the slot.
 * @throws {Error} Throws when the coordinates or label are invalid.
 */
function createReelSlotAriaLabel(reelIndex, slotIndex, symbolLabel) {
  validateReelSlotCoordinate(reelIndex, slotIndex, REEL_COUNT, SLOTS_PER_REEL);

  if (typeof symbolLabel !== "string" || symbolLabel.trim().length === 0) {
    throw new Error("Reel slot symbol label must be a non-empty string.");
  }

  return `Reel ${reelIndex + 1}, slot ${slotIndex + 1}, ${symbolLabel}`;
}

/**
 * Applies validated slot render instructions to the existing reel DOM nodes.
 * @param {readonly ReelSlotRenderInstruction[]} reelSlotRenderInstructions Ordered slot render instructions.
 * @returns {void}
 * @throws {Error} Throws when the render instruction list is malformed.
 */
function applyReelSlotRenderInstructions(reelSlotRenderInstructions) {
  validateReelSlotRenderInstructions(reelSlotRenderInstructions, REEL_COUNT, SLOTS_PER_REEL);

  reelSlotRenderInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelSlotRenderInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelSlotRenderInstruction) => {
      resetSymbolClasses(reelSlotRenderInstruction.element);
      reelSlotRenderInstruction.element.classList.add(reelSlotRenderInstruction.symbolClassName);
      reelSlotRenderInstruction.element.textContent = reelSlotRenderInstruction.symbolLabel;
      reelSlotRenderInstruction.element.setAttribute("aria-label", reelSlotRenderInstruction.ariaLabel);
    }
  );
}

/**
 * Formats a balance or bet amount for display.
 * @param {number} amount Numeric amount to format.
 * @param {CurrencyMode} currencyMode Currency mode that controls formatting.
 * @returns {string} Formatted amount string.
 */
function formatAmount(amount, currencyMode) {
  const currency = CURRENCIES[currencyMode];
  return currencyMode === "real"
    ? `${currency.prefix}${amount.toFixed(2)}`
    : `${currency.prefix}${amount.toFixed(0)}`;
}

/**
 * Clamps a number within an inclusive range.
 * @param {number} value Number to clamp.
 * @param {number} minimum Minimum allowed value.
 * @param {number} maximum Maximum allowed value.
 * @returns {number} Clamped value.
 */
function clampNumber(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Creates a reusable spin result for the full set of reels.
 * @param {number} reelCount Number of reels to generate.
 * @param {number} slotsPerReel Number of slots per reel.
 * @returns {SpinResult} Generated spin result for all reels.
 * @throws {Error} Throws when the requested reel dimensions are invalid.
 */
function createSpinResult(reelCount, slotsPerReel) {
  validateSpinDimensions(reelCount, slotsPerReel);

  return {
    reelCount,
    slotsPerReel,
    reels: Array.from(
      { length: reelCount },
      /**
       * @param {undefined} _unused Unused array slot value from Array.from.
       * @param {number} reelIndex Zero-based reel index.
       * @returns {ReelSpinResult} Generated spin result for one reel.
       */
      (_unused, reelIndex) => ({
        reelIndex,
        symbols: createReelSymbolSequence(slotsPerReel)
      })
    )
  };
}

/**
 * Creates the ordered symbol sequence for one reel using weighted symbol selection.
 * @param {number} slotsPerReel Number of slots to generate.
 * @returns {SymbolId[]} Weighted symbol sequence for a single reel.
 * @throws {Error} Throws when the requested slot count is invalid.
 */
function createReelSymbolSequence(slotsPerReel) {
  validateSpinDimensions(1, slotsPerReel);

  return Array.from(
    { length: slotsPerReel },
    /**
     * @returns {SymbolId} Random symbol identifier.
     */
    () => getRandomSymbolId()
  );
}

/**
 * Converts a validated spin result into the mutable reel matrix used by state and rendering.
 * @param {SpinResult} spinResult Structured spin result.
 * @returns {SymbolId[][]} Reel matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @throws {Error} Throws when the spin result shape is invalid.
 */
function createReelMatrixFromSpinResult(spinResult) {
  validateSpinResult(spinResult);

  return spinResult.reels.map(
    /**
     * @param {ReelSpinResult} reelSpinResult Spin result for one reel.
     * @returns {SymbolId[]} Reel symbols in slot order.
     */
    (reelSpinResult) => [...reelSpinResult.symbols]
  );
}

/**
 * Creates validated, indexed payline definitions from raw coordinate sets.
 * @param {readonly (readonly PaylineCoordinate[])[]} coordinateSets Raw payline coordinate sets.
 * @returns {Readonly<PaylineDefinition[]>} Frozen payline definitions.
 * @throws {Error} Throws when any payline coordinate is invalid for the current matrix size.
 */
function createPaylineDefinitions(coordinateSets) {
  const paylines = coordinateSets.map(
    /**
     * @param {readonly PaylineCoordinate[]} coordinates Ordered coordinates for one payline.
     * @param {number} index Zero-based payline index.
     * @returns {PaylineDefinition} Indexed payline definition.
     */
    (coordinates, index) =>
      Object.freeze({
        id: `line-${index + 1}`,
        index,
        coordinates: Object.freeze(clonePaylineCoordinates(coordinates))
      })
  );

  validatePaylineDefinitions(paylines, REEL_COUNT, SLOTS_PER_REEL);
  return Object.freeze(paylines);
}

/**
 * Reads the symbol sequence for one payline from a reel-oriented matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {PaylineDefinition} payline Payline to read from the matrix.
 * @returns {SymbolId[]} Ordered symbol sequence for the payline.
 * @throws {Error} Throws when the matrix or payline is invalid.
 */
function getPaylineSymbolSequence(reelMatrix, payline) {
  validateReelMatrix(reelMatrix, REEL_COUNT, SLOTS_PER_REEL);
  validatePaylineDefinition(payline, REEL_COUNT, SLOTS_PER_REEL);

  return payline.coordinates.map(
    /**
     * @param {PaylineCoordinate} coordinate Matrix coordinate to read.
     * @returns {SymbolId} Symbol at the coordinate.
     */
    (coordinate) => reelMatrix[coordinate.reelIndex][coordinate.slotIndex]
  );
}

/**
 * Evaluates whether a single payline matches after applying Wild substitution rules.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {PaylineDefinition} payline Payline to evaluate.
 * @returns {PaylineEvaluation} Structured payline evaluation result.
 * @throws {Error} Throws when the matrix or payline is invalid.
 */
function evaluatePayline(reelMatrix, payline) {
  return evaluatePaylineWithWildSupport(reelMatrix, payline, WILD_SYMBOL_ID, SCATTER_SYMBOL_ID);
}

/**
 * Evaluates whether a single payline matches after applying explicit Wild and Scatter rules.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {PaylineDefinition} payline Payline to evaluate.
 * @param {SymbolId} wildSymbolId Wild symbol that may substitute for regular symbols.
 * @param {SymbolId} scatterSymbolId Scatter symbol that is excluded from payline matching.
 * @returns {PaylineEvaluation} Structured payline evaluation result.
 * @throws {Error} Throws when the matrix, payline, Wild, or Scatter input is invalid.
 */
function evaluatePaylineWithWildSupport(reelMatrix, payline, wildSymbolId, scatterSymbolId) {
  validateWildScatterSymbolIds(wildSymbolId, scatterSymbolId);
  const symbols = getPaylineSymbolSequence(reelMatrix, payline);
  const matchedSymbolId = getEffectivePaylineMatchedSymbolId(
    symbols,
    wildSymbolId,
    scatterSymbolId
  );
  const isMatch =
    matchedSymbolId !== null &&
    symbols.every(
      /**
       * @param {SymbolId} symbolId Symbol in the payline sequence.
       * @returns {boolean} Whether the symbol matches after Wild handling.
       */
      (symbolId) =>
        doesSymbolMatchPaylineTarget(symbolId, matchedSymbolId, wildSymbolId, scatterSymbolId)
    );
  const wildCoordinates = isMatch
    ? getWildSubstitutionCoordinates(payline.coordinates, symbols, wildSymbolId)
    : [];

  return {
    paylineId: payline.id,
    paylineIndex: payline.index,
    coordinates: clonePaylineCoordinates(payline.coordinates),
    symbols,
    isMatch,
    matchedSymbolId,
    matchCount: isMatch ? symbols.length : 0,
    wildCoordinates,
    wildSymbolId,
    scatterSymbolId
  };
}

/**
 * Finds the effective symbol a payline should match after Wild handling.
 * @param {readonly SymbolId[]} symbols Symbol sequence read from a payline.
 * @param {SymbolId} wildSymbolId Wild symbol that may substitute for regular symbols.
 * @param {SymbolId} scatterSymbolId Scatter symbol that is excluded from payline matching.
 * @returns {SymbolId|null} Effective match target, or null when no payline target is available.
 * @throws {Error} Throws when Wild or Scatter input is invalid.
 */
function getEffectivePaylineMatchedSymbolId(symbols, wildSymbolId, scatterSymbolId) {
  validateWildScatterSymbolIds(wildSymbolId, scatterSymbolId);

  const regularSymbolId = symbols.find(
    /**
     * @param {SymbolId} symbolId Symbol in the payline sequence.
     * @returns {boolean} Whether the symbol can be the regular payline target.
     */
    (symbolId) => isRegularPaylineSymbol(symbolId, wildSymbolId, scatterSymbolId)
  );

  if (regularSymbolId !== undefined) {
    return regularSymbolId;
  }

  return symbols.every(
    /**
     * @param {SymbolId} symbolId Symbol in the payline sequence.
     * @returns {boolean} Whether the symbol is Wild.
     */
    (symbolId) => symbolId === wildSymbolId
  )
    ? wildSymbolId
    : null;
}

/**
 * Checks whether one symbol matches a payline target with Wild substitution.
 * @param {SymbolId} symbolId Symbol to compare.
 * @param {SymbolId} targetSymbolId Effective target symbol for the payline.
 * @param {SymbolId} wildSymbolId Wild symbol that may substitute for regular symbols.
 * @param {SymbolId} scatterSymbolId Scatter symbol that is excluded from payline matching.
 * @returns {boolean} Whether the symbol contributes to the payline match.
 * @throws {Error} Throws when Wild or Scatter input is invalid.
 */
function doesSymbolMatchPaylineTarget(symbolId, targetSymbolId, wildSymbolId, scatterSymbolId) {
  validateWildScatterSymbolIds(wildSymbolId, scatterSymbolId);

  if (symbolId === scatterSymbolId || targetSymbolId === scatterSymbolId) {
    return false;
  }

  return symbolId === targetSymbolId || symbolId === wildSymbolId;
}

/**
 * Checks whether a symbol can be the regular target for a Wild-assisted payline.
 * @param {SymbolId} symbolId Symbol to classify.
 * @param {SymbolId} wildSymbolId Wild symbol excluded from regular target selection.
 * @param {SymbolId} scatterSymbolId Scatter symbol excluded from payline target selection.
 * @returns {boolean} Whether the symbol is a regular payline symbol.
 */
function isRegularPaylineSymbol(symbolId, wildSymbolId, scatterSymbolId) {
  return symbolId !== wildSymbolId && symbolId !== scatterSymbolId;
}

/**
 * Gets payline coordinates where Wild substituted into a matched line.
 * @param {readonly PaylineCoordinate[]} coordinates Ordered payline coordinates.
 * @param {readonly SymbolId[]} symbols Symbol sequence read from the payline.
 * @param {SymbolId} wildSymbolId Wild symbol to locate.
 * @returns {PaylineCoordinate[]} Coordinates containing Wild symbols.
 * @throws {Error} Throws when coordinate and symbol counts do not align.
 */
function getWildSubstitutionCoordinates(coordinates, symbols, wildSymbolId) {
  if (coordinates.length !== symbols.length) {
    throw new Error("Wild coordinate mapping requires matching coordinate and symbol counts.");
  }

  return coordinates
    .filter(
      /**
       * @param {PaylineCoordinate} _coordinate Payline coordinate paired with the symbol.
       * @param {number} symbolIndex Symbol index within the payline sequence.
       * @returns {boolean} Whether the coordinate contains a Wild symbol.
       */
      (_coordinate, symbolIndex) => symbols[symbolIndex] === wildSymbolId
    )
    .map(
      /**
       * @param {PaylineCoordinate} coordinate Wild coordinate to clone.
       * @returns {PaylineCoordinate} Cloned Wild coordinate.
       */
      (coordinate) => clonePaylineCoordinate(coordinate)
    );
}

/**
 * Evaluates all configured paylines against the current reel matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {readonly PaylineDefinition[]} paylines Paylines to evaluate.
 * @returns {PaylineEvaluationSummary} All payline evaluations and matched paylines.
 * @throws {Error} Throws when the matrix or any payline definition is invalid.
 */
function evaluateAllPaylines(reelMatrix, paylines) {
  return evaluateWildScatterResults(reelMatrix, paylines, WILD_SYMBOL_ID, SCATTER_SYMBOL_ID);
}

/**
 * Produces the full structured Wild/Scatter evaluation for the current matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {readonly PaylineDefinition[]} paylines Paylines to evaluate.
 * @param {SymbolId} wildSymbolId Wild symbol that may substitute for regular symbols.
 * @param {SymbolId} scatterSymbolId Scatter symbol counted outside payline matching.
 * @returns {PaylineEvaluationSummary} Wild-aware payline results plus separate Scatter details.
 * @throws {Error} Throws when the matrix, paylines, Wild, or Scatter input is invalid.
 */
function evaluateWildScatterResults(reelMatrix, paylines, wildSymbolId, scatterSymbolId) {
  validateReelMatrix(reelMatrix, REEL_COUNT, SLOTS_PER_REEL);
  validatePaylineDefinitions(paylines, REEL_COUNT, SLOTS_PER_REEL);
  validateWildScatterSymbolIds(wildSymbolId, scatterSymbolId);

  const evaluations = paylines.map(
    /**
     * @param {PaylineDefinition} payline Payline to evaluate.
     * @returns {PaylineEvaluation} Evaluation output for the payline.
     */
    (payline) => {
      if (wildSymbolId === WILD_SYMBOL_ID && scatterSymbolId === SCATTER_SYMBOL_ID) {
        return evaluatePayline(reelMatrix, payline);
      }

      return evaluatePaylineWithWildSupport(reelMatrix, payline, wildSymbolId, scatterSymbolId);
    }
  );
  const matches = evaluations
    .filter(
      /**
       * @param {PaylineEvaluation} evaluation Payline evaluation.
       * @returns {boolean} Whether the payline matched.
       */
      (evaluation) => evaluation.isMatch
    )
    .map(
      /**
       * @param {PaylineEvaluation} evaluation Matched payline evaluation.
       * @returns {PaylineMatch} Compact matched payline result.
       */
      (evaluation) => ({
        paylineId: evaluation.paylineId,
        paylineIndex: evaluation.paylineIndex,
        matchedSymbolId: /** @type {SymbolId} */ (evaluation.matchedSymbolId),
        matchCount: evaluation.matchCount,
        coordinates: clonePaylineCoordinates(evaluation.coordinates),
        wildCoordinates: clonePaylineCoordinates(evaluation.wildCoordinates),
        symbols: [...evaluation.symbols]
      })
    );
  const scatterEvaluation = createScatterEvaluation(reelMatrix, scatterSymbolId);

  return {
    evaluations,
    matches,
    scatterEvaluation,
    scatterCount: scatterEvaluation.count,
    wildSymbolId,
    scatterSymbolId
  };
}

/**
 * Counts Scatter symbols across the full reel matrix, independent of paylines.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {SymbolId} scatterSymbolId Scatter symbol to count.
 * @returns {number} Number of Scatter symbols found anywhere on the grid.
 * @throws {Error} Throws when the matrix or Scatter input is invalid.
 */
function countScatterSymbols(reelMatrix, scatterSymbolId) {
  return getSymbolCoordinatesInMatrix(reelMatrix, scatterSymbolId).length;
}

/**
 * Builds structured Scatter count data across the full reel matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {SymbolId} scatterSymbolId Scatter symbol to count.
 * @returns {ScatterEvaluation} Scatter count and positions across the grid.
 * @throws {Error} Throws when the matrix or Scatter input is invalid.
 */
function createScatterEvaluation(reelMatrix, scatterSymbolId) {
  const coordinates = getSymbolCoordinatesInMatrix(reelMatrix, scatterSymbolId);

  return {
    scatterSymbolId,
    count: countScatterSymbols(reelMatrix, scatterSymbolId),
    coordinates
  };
}

/**
 * Finds every coordinate containing a target symbol in a reel-oriented matrix.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {SymbolId} targetSymbolId Symbol to locate.
 * @returns {PaylineCoordinate[]} Coordinates containing the requested symbol.
 * @throws {Error} Throws when the matrix or target symbol is invalid.
 */
function getSymbolCoordinatesInMatrix(reelMatrix, targetSymbolId) {
  validateReelMatrix(reelMatrix, REEL_COUNT, SLOTS_PER_REEL);
  validateConfiguredSymbolId(targetSymbolId, "Target symbol");

  return reelMatrix.flatMap(
    /**
     * @param {readonly SymbolId[]} reel Symbol sequence for one reel.
     * @param {number} reelIndex Zero-based reel index.
     * @returns {PaylineCoordinate[]} Coordinates from this reel containing the target symbol.
     */
    (reel, reelIndex) =>
      reel
        .map(
          /**
           * @param {SymbolId} symbolId Symbol at the current coordinate.
           * @param {number} slotIndex Zero-based slot index.
           * @returns {PaylineCoordinate|null} Coordinate when the symbol matches, otherwise null.
           */
          (symbolId, slotIndex) =>
            symbolId === targetSymbolId
              ? {
                  reelIndex,
                  slotIndex
                }
              : null
        )
        .filter(
          /**
           * @param {PaylineCoordinate|null} coordinate Candidate coordinate.
           * @returns {coordinate is PaylineCoordinate} Whether the coordinate contains the target.
           */
          (coordinate) => coordinate !== null
        )
  );
}

/**
 * Calculates the payout for a single matched payline.
 * @param {PaylineMatch} paylineMatch Matched payline to price.
 * @param {number} betAmount Current bet amount.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup by symbol.
 * @returns {PaylinePayout} Structured single-payline payout result.
 * @throws {Error} Throws when payout input is malformed.
 */
function calculateSinglePaylinePayout(paylineMatch, betAmount, payoutMultipliers) {
  validatePaylineMatch(paylineMatch);
  validatePayoutBetAmount(betAmount);
  validatePayoutMultipliers(payoutMultipliers);

  const multiplier = payoutMultipliers[paylineMatch.matchedSymbolId];

  return {
    paylineId: paylineMatch.paylineId,
    paylineIndex: paylineMatch.paylineIndex,
    matchedSymbolId: paylineMatch.matchedSymbolId,
    matchCount: paylineMatch.matchCount,
    betAmount,
    multiplier,
    payoutAmount: roundToCurrencyPrecision(betAmount * multiplier),
    coordinates: clonePaylineCoordinates(paylineMatch.coordinates)
  };
}

/**
 * Calculates total payout across all matched paylines.
 * @param {readonly PaylineMatch[]} paylineMatches Matched paylines to price.
 * @param {number} betAmount Current bet amount.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup by symbol.
 * @returns {PayoutCalculationResult} Structured total payout result.
 * @throws {Error} Throws when payout input is malformed.
 */
function calculateTotalPayout(paylineMatches, betAmount, payoutMultipliers) {
  if (!Array.isArray(paylineMatches)) {
    throw new Error("Payline matches must be an array.");
  }

  const paylinePayouts = paylineMatches.map(
    /**
     * @param {PaylineMatch} paylineMatch Matched payline to price.
     * @returns {PaylinePayout} Payout details for one matched payline.
     */
    (paylineMatch) => calculateSinglePaylinePayout(paylineMatch, betAmount, payoutMultipliers)
  );
  const contributingPaylines = paylinePayouts.filter(
    /**
     * @param {PaylinePayout} paylinePayout Payline payout result.
     * @returns {boolean} Whether the payline contributed a positive payout.
     */
    (paylinePayout) => paylinePayout.payoutAmount > 0
  );
  const totalPayoutAmount = roundToCurrencyPrecision(
    contributingPaylines.reduce(
      /**
       * @param {number} payoutTotal Running payout total.
       * @param {PaylinePayout} paylinePayout Payline payout result.
       * @returns {number} Updated payout total.
       */
      (payoutTotal, paylinePayout) => payoutTotal + paylinePayout.payoutAmount,
      0
    )
  );

  return {
    betAmount,
    paylinePayouts,
    contributingPaylines,
    totalPayoutAmount
  };
}

/**
 * Applies a payout calculation to a balance without mutating external state.
 * @param {number} currentBalance Current balance after the bet has been spent.
 * @param {PayoutCalculationResult} payoutSummary Structured payout calculation result.
 * @returns {PayoutApplicationResult} Balance application output.
 * @throws {Error} Throws when the balance or payout summary is invalid.
 */
function applyPayoutToBalance(currentBalance, payoutSummary) {
  validateBalanceAmount(currentBalance);
  validatePayoutSummary(payoutSummary);

  return {
    previousBalance: currentBalance,
    balanceDelta: payoutSummary.totalPayoutAmount,
    updatedBalance: roundToCurrencyPrecision(currentBalance + payoutSummary.totalPayoutAmount),
    payoutSummary
  };
}

/**
 * Validates one matched payline before payout calculation.
 * @param {PaylineMatch} paylineMatch Matched payline to validate.
 * @returns {void}
 * @throws {Error} Throws when the matched payline is malformed.
 */
function validatePaylineMatch(paylineMatch) {
  if (typeof paylineMatch !== "object" || paylineMatch === null) {
    throw new Error("Payline match must be a non-null object.");
  }

  if (typeof paylineMatch.paylineId !== "string" || paylineMatch.paylineId.length === 0) {
    throw new Error("Payline match must include a non-empty paylineId.");
  }

  if (!Number.isInteger(paylineMatch.paylineIndex) || paylineMatch.paylineIndex < 0) {
    throw new Error(
      `Payline match index must be a non-negative integer: ${String(paylineMatch.paylineIndex)}.`
    );
  }

  if (!Object.hasOwn(SYMBOLS, paylineMatch.matchedSymbolId)) {
    throw new Error(`Payline match has unknown symbol: ${String(paylineMatch.matchedSymbolId)}.`);
  }

  if (!Number.isInteger(paylineMatch.matchCount) || paylineMatch.matchCount <= 0) {
    throw new Error(
      `Payline match count must be a positive integer: ${String(paylineMatch.matchCount)}.`
    );
  }

  if (!Array.isArray(paylineMatch.coordinates) || paylineMatch.coordinates.length !== REEL_COUNT) {
    throw new Error(`Payline match ${paylineMatch.paylineId} has an invalid coordinate count.`);
  }

  paylineMatch.coordinates.forEach(
    /**
     * @param {PaylineCoordinate} coordinate Payline coordinate to validate.
     * @param {number} coordinateIndex Coordinate order within the payline.
     * @returns {void}
     */
    (coordinate, coordinateIndex) => {
      validatePaylineCoordinate(
        coordinate,
        REEL_COUNT,
        SLOTS_PER_REEL,
        paylineMatch.paylineId,
        coordinateIndex
      );
    }
  );
}

/**
 * Validates that a symbol id is configured in the shared symbol metadata.
 * @param {SymbolId} symbolId Symbol identifier to validate.
 * @param {string} label Human-readable label for error messages.
 * @returns {void}
 * @throws {Error} Throws when the symbol id is not configured.
 */
function validateConfiguredSymbolId(symbolId, label) {
  if (!Object.hasOwn(SYMBOLS, symbolId)) {
    throw new Error(`${label} must be a configured symbol: ${String(symbolId)}.`);
  }
}

/**
 * Validates the Wild and Scatter symbols used by the special-symbol evaluation layer.
 * @param {SymbolId} wildSymbolId Wild symbol that may substitute for regular symbols.
 * @param {SymbolId} scatterSymbolId Scatter symbol counted outside paylines.
 * @returns {void}
 * @throws {Error} Throws when either symbol is unknown or both roles point to the same symbol.
 */
function validateWildScatterSymbolIds(wildSymbolId, scatterSymbolId) {
  validateConfiguredSymbolId(wildSymbolId, "Wild symbol");
  validateConfiguredSymbolId(scatterSymbolId, "Scatter symbol");

  if (wildSymbolId === scatterSymbolId) {
    throw new Error("Wild and Scatter symbols must be different configured symbols.");
  }
}

/**
 * Validates a bet amount used by payout calculations.
 * @param {number} betAmount Bet amount to validate.
 * @returns {void}
 * @throws {Error} Throws when the bet amount is invalid.
 */
function validatePayoutBetAmount(betAmount) {
  if (typeof betAmount !== "number" || !Number.isFinite(betAmount) || betAmount <= 0) {
    throw new Error(`Payout bet amount must be a positive finite number: ${String(betAmount)}.`);
  }
}

/**
 * Validates a balance amount before applying payout.
 * @param {number} balanceAmount Balance amount to validate.
 * @returns {void}
 * @throws {Error} Throws when the balance amount is invalid.
 */
function validateBalanceAmount(balanceAmount) {
  if (typeof balanceAmount !== "number" || !Number.isFinite(balanceAmount) || balanceAmount < 0) {
    throw new Error(`Balance amount must be a non-negative finite number: ${String(balanceAmount)}.`);
  }
}

/**
 * Validates the configured symbol payout multipliers.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup by symbol.
 * @returns {void}
 * @throws {Error} Throws when any multiplier is missing or invalid.
 */
function validatePayoutMultipliers(payoutMultipliers) {
  if (typeof payoutMultipliers !== "object" || payoutMultipliers === null) {
    throw new Error("Payout multipliers must be a non-null object.");
  }

  SYMBOL_ORDER.forEach(
    /**
     * @param {SymbolId} symbolId Configured symbol identifier.
     * @returns {void}
     */
    (symbolId) => {
      const multiplier = payoutMultipliers[symbolId];

      if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier < 0) {
        throw new Error(`Invalid payout multiplier for symbol ${symbolId}: ${String(multiplier)}.`);
      }
    }
  );
}

/**
 * Validates the structured payout summary before applying it to a balance.
 * @param {PayoutCalculationResult} payoutSummary Payout summary to validate.
 * @returns {void}
 * @throws {Error} Throws when the payout summary is malformed.
 */
function validatePayoutSummary(payoutSummary) {
  if (typeof payoutSummary !== "object" || payoutSummary === null) {
    throw new Error("Payout summary must be a non-null object.");
  }

  validatePayoutBetAmount(payoutSummary.betAmount);

  if (!Array.isArray(payoutSummary.paylinePayouts)) {
    throw new Error("Payout summary paylinePayouts must be an array.");
  }

  if (!Array.isArray(payoutSummary.contributingPaylines)) {
    throw new Error("Payout summary contributingPaylines must be an array.");
  }

  if (
    typeof payoutSummary.totalPayoutAmount !== "number" ||
    !Number.isFinite(payoutSummary.totalPayoutAmount) ||
    payoutSummary.totalPayoutAmount < 0
  ) {
    throw new Error(
      `Total payout amount must be a non-negative finite number: ${String(payoutSummary.totalPayoutAmount)}.`
    );
  }
}

/**
 * Validates requested reel dimensions before random generation.
 * @param {number} reelCount Number of reels requested.
 * @param {number} slotsPerReel Number of slots per reel requested.
 * @returns {void}
 * @throws {Error} Throws when either dimension is not a positive integer.
 */
function validateSpinDimensions(reelCount, slotsPerReel) {
  if (!Number.isInteger(reelCount) || reelCount <= 0) {
    throw new Error(`Reel count must be a positive integer: ${String(reelCount)}`);
  }

  if (!Number.isInteger(slotsPerReel) || slotsPerReel <= 0) {
    throw new Error(`Slots per reel must be a positive integer: ${String(slotsPerReel)}`);
  }
}

/**
 * Validates cached reel slot metadata against the expected reel layout.
 * @param {readonly ReelSlotElement[]} reelSlots Cached reel slot metadata from the DOM.
 * @param {number} expectedReelCount Expected number of reels.
 * @param {number} expectedSlotsPerReel Expected number of slots per reel.
 * @returns {void}
 * @throws {Error} Throws when the slot metadata is missing, duplicated, or out of bounds.
 */
function validateReelSlotElements(reelSlots, expectedReelCount, expectedSlotsPerReel) {
  validateSpinDimensions(expectedReelCount, expectedSlotsPerReel);

  if (!Array.isArray(reelSlots)) {
    throw new Error("Reel slots must be provided as an array.");
  }

  const expectedSlotCount = expectedReelCount * expectedSlotsPerReel;

  if (reelSlots.length !== expectedSlotCount) {
    throw new Error(`Reel slots must contain exactly ${expectedSlotCount} slot entries.`);
  }

  /** @type {Set<string>} */
  const seenCoordinates = new Set();

  reelSlots.forEach(
    /**
     * @param {ReelSlotElement} reelSlot Cached reel slot metadata.
     * @returns {void}
     */
    (reelSlot) => {
      validateReelSlotElement(reelSlot, expectedReelCount, expectedSlotsPerReel);

      const coordinateKey = `${reelSlot.reelIndex}:${reelSlot.slotIndex}`;

      if (seenCoordinates.has(coordinateKey)) {
        throw new Error(`Duplicate reel slot metadata found for coordinate ${coordinateKey}.`);
      }

      seenCoordinates.add(coordinateKey);
    }
  );
}

/**
 * Validates one cached reel slot metadata entry.
 * @param {ReelSlotElement} reelSlot Cached reel slot metadata.
 * @param {number} expectedReelCount Expected number of reels.
 * @param {number} expectedSlotsPerReel Expected number of slots per reel.
 * @returns {void}
 * @throws {Error} Throws when the slot metadata is malformed or out of bounds.
 */
function validateReelSlotElement(reelSlot, expectedReelCount, expectedSlotsPerReel) {
  if (typeof reelSlot !== "object" || reelSlot === null) {
    throw new Error("Reel slot metadata must be a non-null object.");
  }

  if (!(reelSlot.element instanceof HTMLDivElement)) {
    throw new Error("Reel slot metadata must include an HTMLDivElement.");
  }

  validateReelSlotCoordinate(
    reelSlot.reelIndex,
    reelSlot.slotIndex,
    expectedReelCount,
    expectedSlotsPerReel
  );
}

/**
 * Validates one reel slot coordinate.
 * @param {number} reelIndex Zero-based reel index.
 * @param {number} slotIndex Zero-based slot index.
 * @param {number} expectedReelCount Expected number of reels.
 * @param {number} expectedSlotsPerReel Expected number of slots per reel.
 * @returns {void}
 * @throws {Error} Throws when the coordinate is not a valid matrix position.
 */
function validateReelSlotCoordinate(reelIndex, slotIndex, expectedReelCount, expectedSlotsPerReel) {
  validateSpinDimensions(expectedReelCount, expectedSlotsPerReel);

  if (!Number.isInteger(reelIndex)) {
    throw new Error(`Reel slot reelIndex must be an integer: ${String(reelIndex)}.`);
  }

  if (!Number.isInteger(slotIndex)) {
    throw new Error(`Reel slot slotIndex must be an integer: ${String(slotIndex)}.`);
  }

  if (reelIndex < 0 || reelIndex >= expectedReelCount) {
    throw new Error(`Reel slot reelIndex is out of bounds: ${String(reelIndex)}.`);
  }

  if (slotIndex < 0 || slotIndex >= expectedSlotsPerReel) {
    throw new Error(`Reel slot slotIndex is out of bounds: ${String(slotIndex)}.`);
  }
}

/**
 * Validates the slot render instructions before they are applied to the DOM.
 * @param {readonly ReelSlotRenderInstruction[]} reelSlotRenderInstructions Ordered slot render instructions.
 * @param {number} expectedReelCount Expected number of reels.
 * @param {number} expectedSlotsPerReel Expected number of slots per reel.
 * @returns {void}
 * @throws {Error} Throws when any render instruction is incomplete or inconsistent.
 */
function validateReelSlotRenderInstructions(
  reelSlotRenderInstructions,
  expectedReelCount,
  expectedSlotsPerReel
) {
  if (!Array.isArray(reelSlotRenderInstructions)) {
    throw new Error("Reel slot render instructions must be provided as an array.");
  }

  validateReelSlotElements(reelSlotRenderInstructions, expectedReelCount, expectedSlotsPerReel);

  reelSlotRenderInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelSlotRenderInstruction Slot render instruction to validate.
     * @returns {void}
     */
    (reelSlotRenderInstruction) => {
      if (!Object.hasOwn(SYMBOLS, reelSlotRenderInstruction.symbolId)) {
        throw new Error(
          `Reel slot render instruction contains an unknown symbol: ${String(reelSlotRenderInstruction.symbolId)}.`
        );
      }

      if (
        typeof reelSlotRenderInstruction.symbolLabel !== "string" ||
        reelSlotRenderInstruction.symbolLabel.trim().length === 0
      ) {
        throw new Error("Reel slot render instruction must include a non-empty symbol label.");
      }

      if (
        typeof reelSlotRenderInstruction.symbolClassName !== "string" ||
        reelSlotRenderInstruction.symbolClassName.trim().length === 0
      ) {
        throw new Error("Reel slot render instruction must include a non-empty symbol class name.");
      }

      if (
        typeof reelSlotRenderInstruction.ariaLabel !== "string" ||
        reelSlotRenderInstruction.ariaLabel.trim().length === 0
      ) {
        throw new Error("Reel slot render instruction must include a non-empty aria-label.");
      }
    }
  );
}

/**
 * Validates that a spin result matches the expected reel-oriented structure.
 * @param {SpinResult} spinResult Structured spin result to validate.
 * @returns {void}
 * @throws {Error} Throws when the spin result shape is incomplete or contains invalid symbols.
 */
function validateSpinResult(spinResult) {
  if (typeof spinResult !== "object" || spinResult === null) {
    throw new Error("Spin result must be a non-null object.");
  }

  const { reelCount, slotsPerReel, reels } = spinResult;
  validateSpinDimensions(reelCount, slotsPerReel);

  if (!Array.isArray(reels) || reels.length !== reelCount) {
    throw new Error(`Spin result reel count mismatch. Expected ${reelCount} reels.`);
  }

  reels.forEach(
    /**
     * @param {ReelSpinResult} reelSpinResult Spin result for one reel.
     * @param {number} expectedReelIndex Expected zero-based reel index.
     * @returns {void}
     */
    (reelSpinResult, expectedReelIndex) => {
      if (reelSpinResult.reelIndex !== expectedReelIndex) {
        throw new Error(
          `Spin result reel index mismatch. Expected ${expectedReelIndex}, received ${String(reelSpinResult.reelIndex)}.`
        );
      }

      if (!Array.isArray(reelSpinResult.symbols) || reelSpinResult.symbols.length !== slotsPerReel) {
        throw new Error(
          `Spin result reel ${expectedReelIndex} must contain exactly ${slotsPerReel} symbols.`
        );
      }

      reelSpinResult.symbols.forEach(
        /**
         * @param {SymbolId} symbolId Symbol identifier at the current slot.
         * @param {number} slotIndex Zero-based slot index.
         * @returns {void}
         */
        (symbolId, slotIndex) => {
          if (!Object.hasOwn(SYMBOLS, symbolId)) {
            throw new Error(
              `Spin result contains unknown symbol at reel ${expectedReelIndex}, slot ${slotIndex}: ${String(symbolId)}`
            );
          }
        }
      );
    }
  );
}

/**
 * Validates that a reel matrix matches the expected dimensions and configured symbols.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @param {number} expectedReelCount Expected number of reel arrays.
 * @param {number} expectedSlotsPerReel Expected number of slots in each reel.
 * @returns {void}
 * @throws {Error} Throws when the matrix shape or any symbol id is invalid.
 */
function validateReelMatrix(reelMatrix, expectedReelCount, expectedSlotsPerReel) {
  validateSpinDimensions(expectedReelCount, expectedSlotsPerReel);

  if (!Array.isArray(reelMatrix) || reelMatrix.length !== expectedReelCount) {
    throw new Error(`Reel matrix must contain exactly ${expectedReelCount} reels.`);
  }

  reelMatrix.forEach(
    /**
     * @param {readonly SymbolId[]} reel Symbol sequence for one reel.
     * @param {number} reelIndex Zero-based reel index.
     * @returns {void}
     */
    (reel, reelIndex) => {
      if (!Array.isArray(reel) || reel.length !== expectedSlotsPerReel) {
        throw new Error(
          `Reel matrix reel ${reelIndex} must contain exactly ${expectedSlotsPerReel} slots.`
        );
      }

      reel.forEach(
        /**
         * @param {SymbolId} symbolId Symbol identifier in the matrix.
         * @param {number} slotIndex Zero-based slot index.
         * @returns {void}
         */
        (symbolId, slotIndex) => {
          if (!Object.hasOwn(SYMBOLS, symbolId)) {
            throw new Error(
              `Reel matrix contains unknown symbol at reel ${reelIndex}, slot ${slotIndex}: ${String(symbolId)}`
            );
          }
        }
      );
    }
  );
}

/**
 * Validates a set of paylines against expected matrix dimensions.
 * @param {readonly PaylineDefinition[]} paylines Payline definitions to validate.
 * @param {number} expectedReelCount Expected number of reel arrays.
 * @param {number} expectedSlotsPerReel Expected number of slots in each reel.
 * @returns {void}
 * @throws {Error} Throws when a payline is missing, malformed, or out of bounds.
 */
function validatePaylineDefinitions(paylines, expectedReelCount, expectedSlotsPerReel) {
  if (!Array.isArray(paylines) || paylines.length === 0) {
    throw new Error("At least one payline definition is required.");
  }

  paylines.forEach(
    /**
     * @param {PaylineDefinition} payline Payline definition to validate.
     * @param {number} expectedIndex Expected zero-based payline index.
     * @returns {void}
     */
    (payline, expectedIndex) => {
      validatePaylineDefinition(payline, expectedReelCount, expectedSlotsPerReel);

      if (payline.index !== expectedIndex) {
        throw new Error(
          `Payline index mismatch. Expected ${expectedIndex}, received ${String(payline.index)}.`
        );
      }
    }
  );
}

/**
 * Validates one payline against expected matrix dimensions.
 * @param {PaylineDefinition} payline Payline definition to validate.
 * @param {number} expectedReelCount Expected number of reel arrays.
 * @param {number} expectedSlotsPerReel Expected number of slots in each reel.
 * @returns {void}
 * @throws {Error} Throws when the payline is malformed or out of bounds.
 */
function validatePaylineDefinition(payline, expectedReelCount, expectedSlotsPerReel) {
  validateSpinDimensions(expectedReelCount, expectedSlotsPerReel);

  if (typeof payline !== "object" || payline === null) {
    throw new Error("Payline definition must be a non-null object.");
  }

  if (typeof payline.id !== "string" || payline.id.length === 0) {
    throw new Error("Payline definition must include a non-empty id.");
  }

  if (!Number.isInteger(payline.index) || payline.index < 0) {
    throw new Error(`Payline index must be a non-negative integer: ${String(payline.index)}`);
  }

  if (!Array.isArray(payline.coordinates) || payline.coordinates.length !== expectedReelCount) {
    throw new Error(
      `Payline ${payline.id} must contain exactly ${expectedReelCount} coordinates.`
    );
  }

  payline.coordinates.forEach(
    /**
     * @param {PaylineCoordinate} coordinate Payline coordinate to validate.
     * @param {number} coordinateIndex Coordinate order within the payline.
     * @returns {void}
     */
    (coordinate, coordinateIndex) => {
      validatePaylineCoordinate(
        coordinate,
        expectedReelCount,
        expectedSlotsPerReel,
        payline.id,
        coordinateIndex
      );

      if (coordinate.reelIndex !== coordinateIndex) {
        throw new Error(
          `Payline ${payline.id} coordinate ${coordinateIndex} must target reel ${coordinateIndex}.`
        );
      }
    }
  );
}

/**
 * Validates one payline coordinate against expected matrix dimensions.
 * @param {PaylineCoordinate} coordinate Coordinate to validate.
 * @param {number} expectedReelCount Expected number of reel arrays.
 * @param {number} expectedSlotsPerReel Expected number of slots in each reel.
 * @param {string} paylineId Payline identifier used for error messages.
 * @param {number} coordinateIndex Coordinate order within the payline.
 * @returns {void}
 * @throws {Error} Throws when the coordinate is malformed or out of bounds.
 */
function validatePaylineCoordinate(
  coordinate,
  expectedReelCount,
  expectedSlotsPerReel,
  paylineId,
  coordinateIndex
) {
  if (typeof coordinate !== "object" || coordinate === null) {
    throw new Error(`Payline ${paylineId} coordinate ${coordinateIndex} must be an object.`);
  }

  if (!Number.isInteger(coordinate.reelIndex)) {
    throw new Error(`Payline ${paylineId} coordinate ${coordinateIndex} has an invalid reelIndex.`);
  }

  if (!Number.isInteger(coordinate.slotIndex)) {
    throw new Error(`Payline ${paylineId} coordinate ${coordinateIndex} has an invalid slotIndex.`);
  }

  if (coordinate.reelIndex < 0 || coordinate.reelIndex >= expectedReelCount) {
    throw new Error(
      `Payline ${paylineId} coordinate ${coordinateIndex} reelIndex is out of bounds: ${coordinate.reelIndex}.`
    );
  }

  if (coordinate.slotIndex < 0 || coordinate.slotIndex >= expectedSlotsPerReel) {
    throw new Error(
      `Payline ${paylineId} coordinate ${coordinateIndex} slotIndex is out of bounds: ${coordinate.slotIndex}.`
    );
  }
}

/**
 * Validates ordered symbol weight entries and derives the weighted lookup data used by spins.
 * @param {readonly SymbolWeightEntry[]} weightEntries Ordered source weight entries.
 * @param {Readonly<Record<SymbolId, SymbolConfig>>} symbolConfig UI symbol configuration.
 * @returns {WeightedSymbolTable} Validated weighted symbol table.
 * @throws {Error} Throws when the weight configuration is incomplete or invalid.
 */
function createWeightedSymbolTable(weightEntries, symbolConfig) {
  const validatedEntries = validateSymbolWeightEntries(weightEntries, symbolConfig);
  const weightBySymbol = buildWeightLookup(validatedEntries);

  return buildWeightedSymbolTable(validatedEntries, symbolConfig, weightBySymbol);
}

/**
 * Validates that every configured symbol has exactly one finite weight entry.
 * @param {readonly SymbolWeightEntry[]} weightEntries Ordered source weight entries.
 * @param {Readonly<Record<SymbolId, SymbolConfig>>} symbolConfig UI symbol configuration.
 * @returns {SymbolWeightEntry[]} Validated mutable copy of the ordered entries.
 * @throws {Error} Throws when a symbol is missing, duplicated, unknown, or has an invalid weight.
 */
function validateSymbolWeightEntries(weightEntries, symbolConfig) {
  /** @type {SymbolId[]} */
  const configuredSymbolIds = /** @type {SymbolId[]} */ (Object.keys(symbolConfig));
  /** @type {Set<SymbolId>} */
  const seenSymbols = new Set();
  const validatedEntries = weightEntries.map(
    /**
     * @param {SymbolWeightEntry} entry Source weight entry.
     * @returns {SymbolWeightEntry} Validated weight entry.
     */
    (entry) => {
      const { symbolId, weight } = entry;

      if (!Object.hasOwn(symbolConfig, symbolId)) {
        throw new Error(`Unknown symbol in weight configuration: ${String(symbolId)}`);
      }

      if (seenSymbols.has(symbolId)) {
        throw new Error(`Duplicate symbol in weight configuration: ${symbolId}`);
      }

      if (typeof weight !== "number" || !Number.isFinite(weight)) {
        throw new Error(`Weight must be a finite number for symbol: ${symbolId}`);
      }

      seenSymbols.add(symbolId);

      return { symbolId, weight };
    }
  );

  const missingSymbols = configuredSymbolIds.filter(
    /**
     * @param {SymbolId} symbolId Configured symbol identifier.
     * @returns {boolean} Whether the symbol is missing from the weight configuration.
     */
    (symbolId) => !seenSymbols.has(symbolId)
  );

  if (missingSymbols.length > 0) {
    throw new Error(
      `Missing configured symbols in weight configuration: ${missingSymbols.join(", ")}`
    );
  }

  return validatedEntries;
}

/**
 * Builds a normalized symbol-to-weight lookup after validation.
 * @param {readonly SymbolWeightEntry[]} validatedEntries Ordered validated weight entries.
 * @returns {Readonly<Record<SymbolId, number>>} Frozen weight lookup keyed by symbol.
 */
function buildWeightLookup(validatedEntries) {
  /** @type {Record<SymbolId, number>} */
  const weightBySymbol = /** @type {Record<SymbolId, number>} */ ({});

  validatedEntries.forEach(
    /**
     * @param {SymbolWeightEntry} entry Validated weight entry.
     * @returns {void}
     */
    (entry) => {
      weightBySymbol[entry.symbolId] = entry.weight;
    }
  );

  return Object.freeze(weightBySymbol);
}

/**
 * Builds the cumulative weighted table used for symbol selection.
 * @param {readonly SymbolWeightEntry[]} validatedEntries Ordered validated weight entries.
 * @param {Readonly<Record<SymbolId, SymbolConfig>>} symbolConfig UI symbol configuration.
 * @param {Readonly<Record<SymbolId, number>>} weightBySymbol Frozen symbol-to-weight lookup.
 * @returns {WeightedSymbolTable} Frozen weighted symbol table.
 * @throws {Error} Throws when configured symbols are missing or the total weight is not positive.
 */
function buildWeightedSymbolTable(validatedEntries, symbolConfig, weightBySymbol) {
  /** @type {SymbolId[]} */
  const configuredSymbolIds = /** @type {SymbolId[]} */ (Object.keys(symbolConfig));
  const missingSymbols = configuredSymbolIds.filter(
    /**
     * @param {SymbolId} symbolId Configured symbol identifier.
     * @returns {boolean} Whether the symbol is missing from the weight configuration.
     */
    (symbolId) => !Object.hasOwn(weightBySymbol, symbolId)
  );

  if (missingSymbols.length > 0) {
    throw new Error(
      `Missing configured symbols in weight configuration: ${missingSymbols.join(", ")}`
    );
  }

  let totalWeight = 0;
  const entries = validatedEntries.map(
    /**
     * @param {SymbolWeightEntry} entry Validated weight entry.
     * @returns {WeightedSymbolEntry} Weighted entry with a cumulative threshold.
     */
    (entry) => {
      totalWeight += entry.weight;

      return Object.freeze({
        symbolId: entry.symbolId,
        weight: entry.weight,
        cumulativeWeight: totalWeight
      });
    }
  );

  if (totalWeight <= 0) {
    throw new Error("Total symbol weight must be greater than zero.");
  }

  return Object.freeze({
    weightBySymbol,
    entries: Object.freeze(entries),
    totalWeight
  });
}

/**
 * Returns a weighted random symbol identifier using the shared symbol table.
 * @returns {SymbolId} Weighted random symbol identifier.
 */
function getRandomSymbolId() {
  return selectWeightedSymbolId(WEIGHTED_SYMBOL_TABLE, Math.random());
}

/**
 * Selects a symbol from a weighted table using a normalized random input.
 * @param {WeightedSymbolTable} weightedTable Weighted symbol table.
 * @param {number} randomValue Normalized random input in the range [0, 1).
 * @returns {SymbolId} Selected symbol identifier.
 * @throws {Error} Throws when the random value is invalid or the weighted table cannot resolve a symbol.
 */
function selectWeightedSymbolId(weightedTable, randomValue) {
  if (
    typeof randomValue !== "number" ||
    !Number.isFinite(randomValue) ||
    randomValue < 0 ||
    randomValue >= 1
  ) {
    throw new Error(
      `Random value must be a finite number in the range [0, 1): ${String(randomValue)}`
    );
  }

  const targetWeight = randomValue * weightedTable.totalWeight;
  const matchingEntry = weightedTable.entries.find(
    /**
     * @param {WeightedSymbolEntry} entry Weighted symbol entry.
     * @returns {boolean} Whether the entry covers the generated target weight.
     */
    (entry) => targetWeight < entry.cumulativeWeight
  );

  if (!matchingEntry) {
    throw new Error("Weighted symbol selection failed to resolve a symbol.");
  }

  return matchingEntry.symbolId;
}

/**
 * Clones a reel matrix to keep state mutable without mutating constants.
 * @param {readonly (readonly SymbolId[])[]} matrix Source reel matrix.
 * @returns {SymbolId[][]} Cloned reel matrix.
 */
function cloneMatrix(matrix) {
  return matrix.map(
    /**
     * @param {readonly SymbolId[]} reel Source reel.
     * @returns {SymbolId[]} Cloned reel.
     */
    (reel) => [...reel]
  );
}

/**
 * Clones one payline coordinate so results do not share mutable coordinate objects.
 * @param {PaylineCoordinate} coordinate Source coordinate.
 * @returns {PaylineCoordinate} Cloned coordinate.
 */
function clonePaylineCoordinate(coordinate) {
  return {
    reelIndex: coordinate.reelIndex,
    slotIndex: coordinate.slotIndex
  };
}

/**
 * Clones payline coordinates so definitions and results do not share mutable coordinate objects.
 * @param {readonly PaylineCoordinate[]} coordinates Source payline coordinates.
 * @returns {PaylineCoordinate[]} Cloned payline coordinates.
 */
function clonePaylineCoordinates(coordinates) {
  return coordinates.map(
    /**
     * @param {PaylineCoordinate} coordinate Source coordinate.
     * @returns {PaylineCoordinate} Cloned coordinate.
     */
    (coordinate) => clonePaylineCoordinate(coordinate)
  );
}

/**
 * Rounds to two decimal places for currency-safe UI display.
 * @param {number} amount Amount to round.
 * @returns {number} Rounded amount.
 */
function roundToCurrencyPrecision(amount) {
  return Math.round(amount * 100) / 100;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
