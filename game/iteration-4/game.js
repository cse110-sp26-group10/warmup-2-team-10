// Structural logic: this file is split into stable configuration, a single source-of-truth state object,
// DOM caching, small reusable helpers, render functions, and event bindings so the current UI stays intact
// while the game logic remains DRY and easy to extend with payouts, paylines, animations, and audio later.

/**
 * @module game
 * @description Foundational Vanilla JS architecture for the broke college slot machine.
 */

/**
 * @typedef {"real" | "dining"} CurrencyMode
 */

/**
 * @typedef {"ramen" | "energy" | "book" | "change" | "wild"} SymbolId
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
 */

/**
 * @typedef {object} ReelSlotElement
 * @property {HTMLDivElement} element Slot element.
 * @property {number} reelIndex Zero-based reel index.
 * @property {number} slotIndex Zero-based slot index.
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
  wild: Object.freeze({ id: "wild", label: "Diploma", className: "symbol-wild" })
});

/** @type {Readonly<SymbolId[]>} */
const SYMBOL_ORDER = Object.freeze(/** @type {SymbolId[]} */ (Object.keys(SYMBOLS)));

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

/**
 * Creates the initial mutable game state.
 * @returns {GameState} Fresh game state object.
 */
function createInitialState() {
  return {
    currencyMode: "real",
    balances: {
      real: CURRENCIES.real.startingBalance,
      dining: CURRENCIES.dining.startingBalance
    },
    bets: {
      real: 1,
      dining: 2
    },
    isMuted: false,
    isSpinning: false,
    statusMessage: "Ready to play.",
    reelMatrix: cloneMatrix(INITIAL_REEL_MATRIX)
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
  dom.diningCurrencyButton.addEventListener("click", handleCurrencyChange.bind(null, dom, "dining"));
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
  state.reelMatrix = createRandomMatrix(INITIAL_REEL_MATRIX.length, INITIAL_REEL_MATRIX[0].length);
  state.statusMessage = `Spent ${formatAmount(currentBet, currencyMode)}. Payout logic comes next.`;
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
  dom.balanceValue.setAttribute("aria-label", `Current balance amount ${formatAmount(state.balances[currencyMode], currencyMode)}`);
  dom.balanceMeta.textContent = CURRENCIES[currencyMode].label;
  dom.balanceMeta.setAttribute("aria-label", `Current currency mode ${CURRENCIES[currencyMode].label}`);
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
  dom.reelSlots.forEach(
    /**
     * @param {ReelSlotElement} slot Reel slot metadata.
     * @returns {void}
     */
    (slot) => {
      const symbolId = state.reelMatrix[slot.reelIndex][slot.slotIndex];
      const symbol = SYMBOLS[symbolId];
      const reelNumber = slot.reelIndex + 1;
      const slotNumber = slot.slotIndex + 1;

      resetSymbolClasses(slot.element);
      slot.element.classList.add(symbol.className);
      slot.element.textContent = symbol.label;
      slot.element.setAttribute("aria-label", `Reel ${reelNumber}, slot ${slotNumber}, ${symbol.label}`);
    }
  );
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
 * Creates a randomized reel matrix.
 * @param {number} reelCount Number of reels to generate.
 * @param {number} slotsPerReel Number of slots per reel.
 * @returns {SymbolId[][]} Randomized reel matrix.
 */
function createRandomMatrix(reelCount, slotsPerReel) {
  return Array.from(
    { length: reelCount },
    /**
     * @returns {SymbolId[]} Randomized single reel.
     */
    () =>
      Array.from(
        { length: slotsPerReel },
        /**
         * @returns {SymbolId} Random symbol identifier.
         */
        () => getRandomSymbolId()
      )
  );
}

/**
 * Returns a random symbol identifier.
 * @returns {SymbolId} Random symbol identifier.
 */
function getRandomSymbolId() {
  const randomIndex = Math.floor(Math.random() * SYMBOL_ORDER.length);
  return SYMBOL_ORDER[randomIndex];
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
