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
 * @property {boolean} isFreeSpinMode Whether the free-spin bonus loop is active.
 * @property {number} freeSpinsRemaining Number of queued free spins left to play.
 * @property {boolean} isAutoplay Whether the autoplay loop is active.
 * @property {number} autoplaySpinsRemaining Number of queued autoplay spins left to play.
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
 * @property {string} symbolLabel Human-readable symbol label kept for accessibility.
 * @property {string} symbolClassName CSS class that skins the slot.
 * @property {string} symbolSvgMarkup Inline SVG markup used as the slot's visible icon.
 * @property {string} ariaLabel Accessible label describing the rendered slot.
 */

/**
 * @typedef {object} DomCache
 * @property {HTMLElement} machine Root machine panel used for reactive CSS state.
 * @property {HTMLElement} reelFrame Reel frame element used for reactive CSS state.
 * @property {HTMLElement} reelGrid Reel grid container used for win feedback positioning.
 * @property {HTMLElement} balanceValue Balance text node.
 * @property {HTMLElement} balanceMeta Currency mode text node.
 * @property {HTMLElement} betDisplay Bet text node.
 * @property {HTMLElement} autoplayDisplay Autoplay counter text node.
 * @property {HTMLElement} freeSpinDisplay Free-spin counter text node.
 * @property {HTMLElement} statusText Status text node.
 * @property {HTMLElement} resultsAnnouncer Live region used for announcing spin outcomes.
 * @property {HTMLElement} paytableModalBackdrop Backdrop element for the generated paytable dialog.
 * @property {HTMLElement} paytableModal Dialog element for the generated paytable.
 * @property {HTMLElement} paytableModalContent Container for generated paytable rows.
 * @property {HTMLElement} winAmountOverlay Visual overlay that displays the latest win amount.
 * @property {HTMLElement} coinShowerLayer Visual layer that hosts temporary coin particles.
 * @property {HTMLButtonElement} realCurrencyButton Real currency toggle button.
 * @property {HTMLButtonElement} diningCurrencyButton Dining dollars toggle button.
 * @property {HTMLButtonElement} muteButton Mute toggle button.
 * @property {HTMLButtonElement} decreaseBetButton Bet decrement button.
 * @property {HTMLButtonElement} increaseBetButton Bet increment button.
 * @property {HTMLButtonElement} spinButton Spin action button.
 * @property {HTMLButtonElement[]} autoplayButtons Autoplay preset buttons.
 * @property {HTMLButtonElement} stopAutoplayButton Button that cancels autoplay.
 * @property {HTMLButtonElement} paytableButton Button that opens the paytable dialog.
 * @property {HTMLButtonElement} paytableCloseButton Button that closes the paytable dialog.
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

/**
 * @typedef {object} ActiveWager
 * @property {CurrencyMode} currencyMode Active currency mode used by the wager.
 * @property {number} balanceAmount Current balance available for the active currency.
 * @property {number} betAmount Current bet configured for the active currency.
 * @property {Readonly<CurrencyConfig>} currencyConfig Currency metadata used to validate the wager.
 */

/**
 * @typedef {object} SpinPlayResult
 * @property {number} betAmount Bet amount configured for the spin.
 * @property {number} wagerCost Actual balance cost applied before payout.
 * @property {boolean} isFreeSpin Whether the spin was played inside the free-spin bonus.
 * @property {boolean} isAutoplaySpin Whether the spin was started by the autoplay loop.
 * @property {number} balanceBeforeSpin Balance before the wager was deducted.
 * @property {number} balanceAfterBet Balance immediately after any wager cost and before payout.
 * @property {number} updatedBalance Final balance after applying payout to the wagered balance.
 * @property {SymbolId[][]} reelMatrix Final reel matrix produced by the spin result.
 * @property {PaylineEvaluationSummary} paylineResults Structured payline evaluation results for the matrix.
 * @property {PayoutApplicationResult} payoutResults Structured payout application details for the spin.
 */

/**
 * @typedef {"neutral" | "win" | "loss" | "alert"} VisualTone
 */

/**
 * @typedef {object} ReactiveVisualState
 * @property {VisualTone} tone Visual tone derived from the current game state.
 * @property {boolean} isMuted Whether the game is currently muted.
 * @property {Set<string>} matchedCoordinateKeys Coordinate keys for winning payline slots.
 * @property {Set<string>} wildCoordinateKeys Coordinate keys where Wild substituted into a win.
 * @property {Set<string>} scatterCoordinateKeys Coordinate keys containing Scatter symbols.
 * @property {number[]} winningReelIndexes Reel indexes that contain winning payline symbols.
 * @property {boolean} isFreeSpinMode Whether the bonus state is active.
 * @property {boolean} isAutoplay Whether autoplay is active.
 * @property {boolean} shouldAnimateWinFeedback Whether the celebratory visual suite should run.
 * @property {string} winAmountText Formatted payout amount shown in the visual overlay.
 * @property {string} announcementMessage Accessible summary for the live results region.
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
const REACTIVE_STYLE_ELEMENT_ID = "iteration-22-reactive-styles";
const MATCHED_SLOT_CLASS_NAME = "is-payline-match";
const WILD_MATCH_SLOT_CLASS_NAME = "is-wild-match";
const SCATTER_SLOT_CLASS_NAME = "is-scatter-hit";
const SLOT_WIN_HIGHLIGHT_CLASS_NAME = "slot-win-highlight";
const WIN_AMOUNT_OVERLAY_ID = "iteration-22-win-amount-overlay";
const COIN_SHOWER_LAYER_ID = "iteration-22-coin-shower-layer";
const LIVE_REGION_RESET_DELAY_MS = 40;
const SPIN_REEL_ANIMATION_DURATION_MS = 360;
const SPIN_REEL_STAGGER_MS = 80;
const SPIN_REEL_SYMBOL_OFFSET_PX = 28;
const BIG_WIN_PAYOUT_MULTIPLIER_THRESHOLD = 6;
const BIG_WIN_PAYLINE_THRESHOLD = 2;
const COIN_PARTICLES_PER_REEL = 10;
const FREE_SPIN_AWARD_COUNT = 10;
const FREE_SPIN_TRIGGER_SCATTER_COUNT = 3;
const AUTO_FREE_SPIN_DELAY_MS = 650;
const AUTOPLAY_SPIN_DELAY_MS = 650;
const AUTOPLAY_OPTIONS = Object.freeze([5, 10, 25]);
const PAYTABLE_MODAL_BACKDROP_ID = "iteration-22-paytable-backdrop";
const PAYTABLE_MODAL_ID = "iteration-22-paytable-modal";
const PAYTABLE_MODAL_CONTENT_ID = "iteration-22-paytable-content";
const PAYTABLE_MODAL_TITLE_ID = "iteration-22-paytable-title";

/** @type {WeakMap<HTMLElement, number>} */
const liveRegionTimeoutByElement = new WeakMap();

/** @type {number | null} */
let queuedFreeSpinTimeoutId = null;

/** @type {number | null} */
let queuedAutoplayTimeoutId = null;

const paytableRuntime = {
  isOpen: false,
  previouslyFocusedElement: null
};

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
    isFreeSpinMode: false,
    freeSpinsRemaining: 0,
    isAutoplay: false,
    autoplaySpinsRemaining: 0,
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

// Audio runtime logic: Iteration 18 keeps sound state outside the game state tree so the existing payout,
// RNG, and render architecture stay untouched. A lazily created Web Audio graph is resumed from user
// gestures, then small named helpers schedule short procedural tones for bet changes and spin outcomes.

const audioRuntime = {
  audioContext: null,
  masterGain: null,
  compressor: null
};

/**
 * Returns the browser AudioContext constructor when the environment supports Web Audio.
 * @returns {(typeof AudioContext) | null} AudioContext constructor, or null when unsupported.
 */
function getAudioContextConstructor() {
  const audioContextConstructor =
    globalThis.AudioContext ?? globalThis.webkitAudioContext ?? null;
  return typeof audioContextConstructor === "function" ? audioContextConstructor : null;
}

/**
 * Creates the shared Web Audio graph once and reuses it for all procedural sound effects.
 * @returns {{ audioContext: AudioContext, masterGain: GainNode, compressor: DynamicsCompressorNode } | null} Initialized audio runtime, or null when unsupported.
 */
function ensureAudioRuntime() {
  if (
    audioRuntime.audioContext !== null &&
    audioRuntime.masterGain !== null &&
    audioRuntime.compressor !== null
  ) {
    return /** @type {{ audioContext: AudioContext, masterGain: GainNode, compressor: DynamicsCompressorNode }} */ (
      audioRuntime
    );
  }

  const AudioContextConstructor = getAudioContextConstructor();

  if (AudioContextConstructor === null) {
    return null;
  }

  const audioContext = new AudioContextConstructor();
  const compressor = audioContext.createDynamicsCompressor();
  const masterGain = audioContext.createGain();

  compressor.threshold.value = -18;
  compressor.knee.value = 22;
  compressor.ratio.value = 10;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.16;
  masterGain.gain.value = 0.18;

  compressor.connect(masterGain);
  masterGain.connect(audioContext.destination);

  audioRuntime.audioContext = audioContext;
  audioRuntime.masterGain = masterGain;
  audioRuntime.compressor = compressor;

  return /** @type {{ audioContext: AudioContext, masterGain: GainNode, compressor: DynamicsCompressorNode }} */ (
    audioRuntime
  );
}

/**
 * Returns whether sound playback should proceed for the current state and environment.
 * @returns {boolean} Whether procedural audio should play.
 */
function shouldPlayAudio() {
  return !state.isMuted && getAudioContextConstructor() !== null;
}

/**
 * Resumes the shared AudioContext from a user gesture so later async outcome sounds can play reliably.
 * @returns {void}
 */
function primeAudioContextForInteraction() {
  const runtime = ensureAudioRuntime();

  if (runtime === null || runtime.audioContext.state !== "suspended") {
    return;
  }

  void runtime.audioContext.resume().catch(
    /**
     * Audio resume failures should stay silent because gameplay must continue even when sound is blocked.
     * @returns {void}
     */
    () => {}
  );
}

/**
 * Schedules one short procedural tone with a fast attack and fade.
 * @param {AudioContext} audioContext Shared audio context.
 * @param {AudioNode} destinationNode Output node for the tone.
 * @param {number} startTime Time in seconds when playback should start.
 * @param {number} startFrequency Starting oscillator frequency in hertz.
 * @param {number} endFrequency Ending oscillator frequency in hertz.
 * @param {number} durationSeconds Duration of the tone in seconds.
 * @param {number} peakGain Peak gain applied during the tone envelope.
 * @param {OscillatorType} waveType Oscillator waveform used for the tone.
 * @returns {void}
 * @throws {Error} Throws when any scheduling input is invalid.
 */
function scheduleTone(
  audioContext,
  destinationNode,
  startTime,
  startFrequency,
  endFrequency,
  durationSeconds,
  peakGain,
  waveType
) {
  if (
    typeof audioContext !== "object" ||
    audioContext === null ||
    typeof audioContext.createOscillator !== "function" ||
    typeof audioContext.createGain !== "function"
  ) {
    throw new Error("Tone scheduling requires a valid AudioContext.");
  }

  if (
    typeof destinationNode !== "object" ||
    destinationNode === null ||
    typeof destinationNode.connect !== "function"
  ) {
    throw new Error("Tone scheduling requires a valid destination AudioNode.");
  }

  validateToneNumber(startTime, "Tone start time");
  validateToneNumber(startFrequency, "Tone start frequency");
  validateToneNumber(endFrequency, "Tone end frequency");
  validateToneNumber(durationSeconds, "Tone duration");
  validateToneNumber(peakGain, "Tone peak gain");

  if (durationSeconds <= 0) {
    throw new Error("Tone duration must be greater than zero.");
  }

  if (peakGain <= 0) {
    throw new Error("Tone peak gain must be greater than zero.");
  }

  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();

  oscillator.type = waveType;
  oscillator.frequency.setValueAtTime(startFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(endFrequency, 1),
    startTime + durationSeconds
  );

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(
    peakGain,
    startTime + Math.min(durationSeconds * 0.2, 0.02)
  );
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

  oscillator.connect(noteGain);
  noteGain.connect(destinationNode);
  oscillator.start(startTime);
  oscillator.stop(startTime + durationSeconds + 0.03);
}

/**
 * Validates one numeric tone scheduling input.
 * @param {number} value Numeric input to validate.
 * @param {string} label Error label for the value.
 * @returns {void}
 * @throws {Error} Throws when the value is not a positive finite number or zero-safe time value.
 */
function validateToneNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number: ${String(value)}.`);
  }
}

/**
 * Plays the short mechanical clink used when the player changes the bet.
 * @returns {void}
 */
function playBetPlacementSound() {
  if (!shouldPlayAudio()) {
    return;
  }

  const runtime = ensureAudioRuntime();

  if (runtime === null) {
    return;
  }

  const startTime = runtime.audioContext.currentTime;
  scheduleTone(runtime.audioContext, runtime.compressor, startTime, 920, 540, 0.05, 0.04, "triangle");
  scheduleTone(
    runtime.audioContext,
    runtime.compressor,
    startTime + 0.01,
    420,
    240,
    0.08,
    0.025,
    "sine"
  );
}

/**
 * Plays the neutral loss tick used after a non-winning spin.
 * @returns {void}
 */
function playLossSound() {
  if (!shouldPlayAudio()) {
    return;
  }

  const runtime = ensureAudioRuntime();

  if (runtime === null) {
    return;
  }

  scheduleTone(runtime.audioContext, runtime.compressor, runtime.audioContext.currentTime, 320, 240, 0.07, 0.02, "square");
}

/**
 * Plays the short ascending tone used after a standard win.
 * @returns {void}
 */
function playSmallWinSound() {
  if (!shouldPlayAudio()) {
    return;
  }

  const runtime = ensureAudioRuntime();

  if (runtime === null) {
    return;
  }

  const startTime = runtime.audioContext.currentTime;
  scheduleTone(runtime.audioContext, runtime.compressor, startTime, 520, 600, 0.1, 0.03, "triangle");
  scheduleTone(runtime.audioContext, runtime.compressor, startTime + 0.08, 660, 760, 0.11, 0.03, "triangle");
  scheduleTone(runtime.audioContext, runtime.compressor, startTime + 0.16, 840, 980, 0.13, 0.035, "sine");
}

/**
 * Plays the longer cascading coin-like sequence used after a bigger win.
 * @returns {void}
 */
function playBigWinSound() {
  if (!shouldPlayAudio()) {
    return;
  }

  const runtime = ensureAudioRuntime();

  if (runtime === null) {
    return;
  }

  const startTime = runtime.audioContext.currentTime;
  const coinFrequencies = [780, 920, 1040, 1170, 980, 1320, 1560];

  coinFrequencies.forEach(
    /**
     * @param {number} frequency Coin-like tone frequency.
     * @param {number} index Tone position in the cascade.
     * @returns {void}
     */
    (frequency, index) => {
      const noteStartTime = startTime + index * 0.055;
      scheduleTone(
        runtime.audioContext,
        runtime.compressor,
        noteStartTime,
        frequency,
        frequency * 0.92,
        0.12,
        0.028,
        "triangle"
      );
      scheduleTone(
        runtime.audioContext,
        runtime.compressor,
        noteStartTime + 0.012,
        frequency * 1.5,
        frequency * 1.1,
        0.08,
        0.012,
        "sine"
      );
    }
  );
}

// Bonus-audio logic: the free-spin award gets its own brighter rising cue so the bonus state is audible
// without changing the existing win and loss sound routing for standard spin outcomes.

/**
 * Plays the celebratory bonus cue used when free spins are awarded.
 * @returns {void}
 */
function playFreeSpinsAwardedSound() {
  if (!shouldPlayAudio()) {
    return;
  }

  const runtime = ensureAudioRuntime();

  if (runtime === null) {
    return;
  }

  const startTime = runtime.audioContext.currentTime;
  scheduleTone(runtime.audioContext, runtime.compressor, startTime, 620, 820, 0.12, 0.028, "triangle");
  scheduleTone(runtime.audioContext, runtime.compressor, startTime + 0.1, 880, 1180, 0.14, 0.03, "triangle");
  scheduleTone(runtime.audioContext, runtime.compressor, startTime + 0.2, 1240, 1560, 0.18, 0.034, "sine");
}

/**
 * Returns whether the completed spin should use the larger win sound.
 * @param {SpinPlayResult} spinPlayResult Completed spin result.
 * @returns {boolean} Whether the spin qualifies as a big win.
 */
function isBigWinSpinResult(spinPlayResult) {
  validateSpinPlayResult(spinPlayResult);
  return (
    spinPlayResult.payoutResults.balanceDelta >=
      spinPlayResult.betAmount * BIG_WIN_PAYOUT_MULTIPLIER_THRESHOLD ||
    spinPlayResult.paylineResults.matches.length >= BIG_WIN_PAYLINE_THRESHOLD
  );
}

/**
 * Routes a completed spin result to the correct win or loss sound effect.
 * @param {SpinPlayResult} spinPlayResult Completed spin result.
 * @returns {void}
 */
function playSpinOutcomeSound(spinPlayResult) {
  validateSpinPlayResult(spinPlayResult);

  if (spinPlayResult.payoutResults.balanceDelta <= 0) {
    playLossSound();
    return;
  }

  if (isBigWinSpinResult(spinPlayResult)) {
    playBigWinSound();
    return;
  }

  playSmallWinSound();
}

/**
 * Boots the slot machine once the DOM is available.
 * @returns {void}
 */
function init() {
  ensureReactiveStateStyles();
  const dom = getDomCache();
  configureResultsAnnouncer(dom.resultsAnnouncer);
  renderPaytableModal(dom);
  bindEvents(dom);
  render(dom);
}

/**
 * Builds a cached set of DOM references used throughout the app.
 * @returns {DomCache} Cached DOM references.
 * @throws {Error} Throws when a required DOM node is missing.
 */
function getDomCache() {
  const machine = getRequiredElement(".machine", HTMLElement);
  const reelFrame = getRequiredElement(".reel-frame", HTMLElement, machine);
  const reelGrid = getRequiredElement("#reels", HTMLElement, reelFrame);
  const statCard = getRequiredElement(".stat-card", HTMLElement);
  const balanceValue = getRequiredElement(".stat-value", HTMLElement, statCard);
  const balanceMeta = getRequiredElement(".stat-meta", HTMLElement, statCard);
  const betDisplay = getRequiredElement(".bet-display", HTMLElement);
  const autoplayDisplay = getRequiredElement(".autoplay-display", HTMLElement);
  const freeSpinDisplay = getRequiredElement(".free-spin-display", HTMLElement);
  const statusText = getRequiredElement(".status-text", HTMLElement);
  const resultsAnnouncer = getRequiredElement("#results-announcer", HTMLElement);
  const winFeedbackElements = ensureWinFeedbackElements(reelFrame);
  const paytableElements = ensurePaytableModalElements();

  const currencyButtons = getButtonGroup(".segmented-control .chip", 2);
  const realCurrencyButton = currencyButtons[0];
  const diningCurrencyButton = currencyButtons[1];

  const muteButton = getRequiredElement(".chip-wide", HTMLButtonElement);

  const betControls = getButtonGroup(".bet-controls .chip", 2);
  const decreaseBetButton = betControls[0];
  const increaseBetButton = betControls[1];

  const actionButtons = getButtonGroup(".action-stack .action-button", 3);
  const spinButton = actionButtons[0];
  const resetButton = actionButtons[1];
  const paytableButton = actionButtons[2];
  const autoplayButtons = getButtonGroup(".autoplay-controls .autoplay-button", 3);
  const stopAutoplayButton = getRequiredElement(
    ".autoplay-stop-button",
    HTMLButtonElement
  );

  const reelSlots = getReelSlots();

  return {
    machine,
    reelFrame,
    reelGrid,
    balanceValue,
    balanceMeta,
    betDisplay,
    autoplayDisplay,
    freeSpinDisplay,
    statusText,
    resultsAnnouncer,
    paytableModalBackdrop: paytableElements.backdrop,
    paytableModal: paytableElements.modal,
    paytableModalContent: paytableElements.content,
    winAmountOverlay: winFeedbackElements.winAmountOverlay,
    coinShowerLayer: winFeedbackElements.coinShowerLayer,
    realCurrencyButton,
    diningCurrencyButton,
    muteButton,
    decreaseBetButton,
    increaseBetButton,
    spinButton,
    autoplayButtons,
    stopAutoplayButton,
    paytableButton,
    paytableCloseButton: paytableElements.closeButton,
    resetButton,
    reelSlots
  };
}

// Win-feedback element logic: Iteration 19 keeps the HTML untouched by creating the celebratory overlay
// and particle host at runtime, caching those nodes once, and reusing them on every spin result.

/**
 * Ensures the win feedback overlay elements exist inside the reel frame.
 * @param {HTMLElement} reelFrame Reel frame that hosts the visual feedback suite.
 * @returns {{ winAmountOverlay: HTMLElement, coinShowerLayer: HTMLElement }} Cached feedback elements.
 * @throws {Error} Throws when the reel frame is invalid.
 */
function ensureWinFeedbackElements(reelFrame) {
  if (!(reelFrame instanceof HTMLElement)) {
    throw new Error("Win feedback elements require a valid reel frame element.");
  }

  const existingWinAmountOverlay = document.getElementById(WIN_AMOUNT_OVERLAY_ID);
  const existingCoinShowerLayer = document.getElementById(COIN_SHOWER_LAYER_ID);

  if (existingWinAmountOverlay instanceof HTMLElement && existingCoinShowerLayer instanceof HTMLElement) {
    return {
      winAmountOverlay: existingWinAmountOverlay,
      coinShowerLayer: existingCoinShowerLayer
    };
  }

  const winAmountOverlay = document.createElement("div");
  const coinShowerLayer = document.createElement("div");

  winAmountOverlay.id = WIN_AMOUNT_OVERLAY_ID;
  winAmountOverlay.className = "win-amount-overlay";
  winAmountOverlay.setAttribute("aria-hidden", "true");

  coinShowerLayer.id = COIN_SHOWER_LAYER_ID;
  coinShowerLayer.className = "coin-shower-layer";
  coinShowerLayer.setAttribute("aria-hidden", "true");

  reelFrame.append(winAmountOverlay, coinShowerLayer);

  return {
    winAmountOverlay,
    coinShowerLayer
  };
}

// Paytable-modal element logic: the paytable is created once at runtime so the static HTML only needs the
// trigger button while the dialog content stays fully data-driven and reusable.

/**
 * Ensures the runtime-generated paytable modal elements exist inside the document body.
 * @returns {{ backdrop: HTMLElement, modal: HTMLElement, content: HTMLElement, closeButton: HTMLButtonElement }} Cached paytable modal elements.
 * @throws {Error} Throws when the document body is unavailable.
 */
function ensurePaytableModalElements() {
  const existingBackdrop = document.getElementById(PAYTABLE_MODAL_BACKDROP_ID);
  const existingModal = document.getElementById(PAYTABLE_MODAL_ID);
  const existingContent = document.getElementById(PAYTABLE_MODAL_CONTENT_ID);

  if (
    existingBackdrop instanceof HTMLElement &&
    existingModal instanceof HTMLElement &&
    existingContent instanceof HTMLElement
  ) {
    return {
      backdrop: existingBackdrop,
      modal: existingModal,
      content: existingContent,
      closeButton: getRequiredElement(
        ".paytable-modal-close-button",
        HTMLButtonElement,
        existingModal
      )
    };
  }

  if (!(document.body instanceof HTMLElement)) {
    throw new Error("Paytable modal creation requires a valid document body.");
  }

  const backdrop = document.createElement("div");
  const modal = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("h2");
  const closeButton = document.createElement("button");
  const copy = document.createElement("p");
  const content = document.createElement("div");

  backdrop.id = PAYTABLE_MODAL_BACKDROP_ID;
  backdrop.className = "paytable-modal-backdrop";
  backdrop.hidden = true;

  modal.id = PAYTABLE_MODAL_ID;
  modal.className = "paytable-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", PAYTABLE_MODAL_TITLE_ID);
  modal.setAttribute("tabindex", "-1");

  header.className = "paytable-modal-header";

  title.id = PAYTABLE_MODAL_TITLE_ID;
  title.className = "paytable-modal-title";
  title.textContent = "Paytable";

  closeButton.type = "button";
  closeButton.className = "action-button paytable-modal-close-button";
  closeButton.setAttribute("aria-label", "Close paytable");
  closeButton.textContent = "Close";

  copy.className = "paytable-modal-copy";
  copy.textContent =
    "Symbol payouts and bonus rules are rendered directly from the live slot configuration.";

  content.id = PAYTABLE_MODAL_CONTENT_ID;
  content.className = "paytable";

  header.append(title, closeButton);
  modal.append(header, copy, content);
  backdrop.append(modal);
  document.body.append(backdrop);

  return {
    backdrop,
    modal,
    content,
    closeButton
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
     * @returns {element is HTMLElement} Whether the node is a reel container.
     */
    (element) => element instanceof HTMLElement
  );

  if (reels.length !== INITIAL_REEL_MATRIX.length) {
    throw new Error("Unexpected reel count in DOM.");
  }

  return reels.flatMap(
    /**
     * @param {HTMLElement} reel Reel container element.
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
  dom.autoplayButtons[0].addEventListener("click", handleAutoplayStart.bind(null, dom, 5));
  dom.autoplayButtons[1].addEventListener("click", handleAutoplayStart.bind(null, dom, 10));
  dom.autoplayButtons[2].addEventListener("click", handleAutoplayStart.bind(null, dom, 25));
  dom.stopAutoplayButton.addEventListener("click", handleAutoplayStop.bind(null, dom, true));
  dom.paytableButton.addEventListener("click", handlePaytableOpen.bind(null, dom));
  dom.paytableCloseButton.addEventListener("click", handlePaytableClose.bind(null, dom));
  dom.paytableModalBackdrop.addEventListener("click", handlePaytableBackdropClick.bind(null, dom));
  dom.resetButton.addEventListener("click", handleReset.bind(null, dom));
  bindSpinShortcutEvents(dom);
  bindBetShortcutEvents(dom);
  bindPaytableShortcutEvents(dom);
}

/**
 * Shortcut binding logic: a single document-level keydown listener catches Space and Enter outside
 * interactive controls, prevents duplicate browser behavior, and delegates straight into `handleSpin`
 * so keyboard and button activation always share the same spin path.
 */

/**
 * Registers document-level keyboard shortcuts for spinning the machine.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function bindSpinShortcutEvents(dom) {
  document.addEventListener("keydown", handleSpinShortcutKeydown.bind(null, dom));
}

// Bet-shortcut binding logic: keyboard users should reach the existing bet-adjustment path without any
// special-case math, so ArrowUp and ArrowDown are attached directly to the current bet controls.

/**
 * Registers keyboard shortcuts for the bet controls.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function bindBetShortcutEvents(dom) {
  dom.betDisplay.setAttribute("tabindex", "0");
  dom.betDisplay.addEventListener("keydown", handleBetShortcutKeydown.bind(null, dom));
  dom.decreaseBetButton.addEventListener("keydown", handleBetShortcutKeydown.bind(null, dom));
  dom.increaseBetButton.addEventListener("keydown", handleBetShortcutKeydown.bind(null, dom));
}

// Paytable-shortcut binding logic: Escape closes the dialog and Tab stays trapped inside the generated
// modal so the paytable behaves like a proper accessible dialog without a larger framework.

/**
 * Registers keyboard shortcuts for the paytable dialog.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function bindPaytableShortcutEvents(dom) {
  document.addEventListener("keydown", handlePaytableKeydown.bind(null, dom));
}

/**
 * Spins the machine when an eligible Space or Enter key press occurs.
 * @param {DomCache} dom Cached DOM references.
 * @param {KeyboardEvent} event Keyboard event raised by the document.
 * @returns {void}
 */
function handleSpinShortcutKeydown(dom, event) {
  if (event.repeat || !isSpinShortcutKey(event.key) || isInteractiveShortcutTarget(event.target)) {
    return;
  }

  event.preventDefault();
  handleSpin(dom);
}

// Bet-keyboard routing logic: ArrowUp increments and ArrowDown decrements only when focus is already on a
// supported bet-control element, and both paths delegate straight into `handleBetAdjustment`.

/**
 * Adjusts the bet when an eligible ArrowUp or ArrowDown press occurs within the bet controls.
 * @param {DomCache} dom Cached DOM references.
 * @param {KeyboardEvent} event Keyboard event raised by a bet control.
 * @returns {void}
 */
function handleBetShortcutKeydown(dom, event) {
  const direction = resolveBetShortcutDirection(event.key);

  if (direction === 0 || !isBetShortcutTarget(event.currentTarget)) {
    return;
  }

  event.preventDefault();
  handleBetAdjustment(dom, direction);
}

/**
 * Resolves the bet-adjustment direction for one keyboard key.
 * @param {string} key KeyboardEvent key value.
 * @returns {-1 | 0 | 1} Bet-adjustment direction for the key.
 */
function resolveBetShortcutDirection(key) {
  if (typeof key !== "string") {
    throw new Error("Bet shortcut key must be provided as a string.");
  }

  if (key === "ArrowUp") {
    return 1;
  }

  if (key === "ArrowDown") {
    return -1;
  }

  return 0;
}

/**
 * Checks whether a keyboard event source is one of the supported bet controls.
 * @param {EventTarget | null} target Keyboard event target or currentTarget.
 * @returns {boolean} Whether the target can trigger arrow-key bet changes.
 */
function isBetShortcutTarget(target) {
  return target instanceof HTMLElement && target.closest(".bet-controls") !== null;
}

/**
 * Checks whether a keyboard key should trigger a spin.
 * @param {string} key KeyboardEvent key value.
 * @returns {boolean} Whether the key maps to the global spin shortcut.
 * @throws {Error} Throws when the provided key is not a string.
 */
function isSpinShortcutKey(key) {
  if (typeof key !== "string") {
    throw new Error("Spin shortcut key must be provided as a string.");
  }

  return key === " " || key === "Enter";
}

/**
 * Checks whether a key event target should keep its native keyboard behavior.
 * @param {EventTarget | null} target Keyboard event target.
 * @returns {boolean} Whether the target is an interactive element that should not trigger a global spin.
 */
function isInteractiveShortcutTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest(
      'button, input, select, textarea, a[href], [contenteditable="true"], [role="button"]'
    ) !== null
  );
}

// Dialog-keyboard logic: when the paytable is open, Escape closes it and Tab wraps focus around the
// generated dialog controls so users never fall through to the obscured game board.

/**
 * Handles keyboard interactions while the paytable dialog is open.
 * @param {DomCache} dom Cached DOM references.
 * @param {KeyboardEvent} event Keyboard event raised by the document.
 * @returns {void}
 */
function handlePaytableKeydown(dom, event) {
  if (!paytableRuntime.isOpen) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    handlePaytableClose(dom);
    return;
  }

  if (event.key === "Tab") {
    trapFocusInsideModal(dom.paytableModal, event);
  }
}

/**
 * Handles wallet mode switching.
 * @param {DomCache} dom Cached DOM references.
 * @param {CurrencyMode} currencyMode Target currency mode.
 * @returns {void}
 */
function handleCurrencyChange(dom, currencyMode) {
  if (state.isSpinning || state.isFreeSpinMode || state.isAutoplay || state.currencyMode === currencyMode) {
    return;
  }

  state.currencyMode = currencyMode;
  state.statusMessage = `${CURRENCIES[currencyMode].label} selected.`;
  render(dom);
}

// Paytable-open logic: opening the dialog preserves the prior focus target, reveals the generated modal,
// and moves focus to the close button so keyboard users land inside the dialog immediately.

/**
 * Opens the paytable dialog.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handlePaytableOpen(dom) {
  paytableRuntime.isOpen = true;
  paytableRuntime.previouslyFocusedElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dom.paytableModalBackdrop.hidden = false;
  dom.machine.setAttribute("aria-hidden", "true");
  dom.paytableCloseButton.focus();
}

// Paytable-close logic: closing the dialog hides the backdrop, restores the board to the accessibility
// tree, and returns focus to the trigger path the player came from.

/**
 * Closes the paytable dialog.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handlePaytableClose(dom) {
  paytableRuntime.isOpen = false;
  dom.paytableModalBackdrop.hidden = true;
  dom.machine.removeAttribute("aria-hidden");

  if (paytableRuntime.previouslyFocusedElement instanceof HTMLElement) {
    paytableRuntime.previouslyFocusedElement.focus();
    return;
  }

  dom.paytableButton.focus();
}

/**
 * Closes the paytable dialog when the backdrop itself is clicked.
 * @param {DomCache} dom Cached DOM references.
 * @param {MouseEvent} event Mouse event raised by the modal backdrop.
 * @returns {void}
 */
function handlePaytableBackdropClick(dom, event) {
  if (event.target === dom.paytableModalBackdrop) {
    handlePaytableClose(dom);
  }
}

/**
 * Handles bet adjustments.
 * @param {DomCache} dom Cached DOM references.
 * @param {number} direction Negative for decrement, positive for increment.
 * @returns {void}
 */
function handleBetAdjustment(dom, direction) {
  if (state.isSpinning || state.isFreeSpinMode || state.isAutoplay) {
    return;
  }

  primeAudioContextForInteraction();
  const activeWager = resolveActiveWager(state.currencyMode, state.balances, state.bets, CURRENCIES);
  const nextBet = resolveNextBetAmount(activeWager.currencyConfig.allowedBets, activeWager.betAmount, direction);

  if (nextBet === activeWager.betAmount) {
    state.statusMessage = `Bet already at ${direction > 0 ? "maximum" : "minimum"} for ${activeWager.currencyConfig.label}.`;
    render(dom);
    return;
  }

  state.bets[activeWager.currencyMode] = nextBet;
  state.statusMessage = `Bet set to ${formatAmount(nextBet, activeWager.currencyMode)}.`;
  playBetPlacementSound();
  render(dom);
}

/**
 * Handles the mute button.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleMuteToggle(dom) {
  state.isMuted = !state.isMuted;

  if (!state.isMuted) {
    primeAudioContextForInteraction();
  }

  state.statusMessage = state.isMuted ? "Audio muted." : "Audio enabled.";
  render(dom);
}

// Autoplay-start logic: the preset buttons only seed state and queue the first automatic spin so autoplay
// still flows through the same settled-spin path as manual and free-spin rounds.

/**
 * Starts autoplay with one validated preset spin count.
 * @param {DomCache} dom Cached DOM references.
 * @param {number} spinCount Number of autoplay spins requested.
 * @returns {void}
 */
function handleAutoplayStart(dom, spinCount) {
  if (state.isSpinning || state.isFreeSpinMode || state.isAutoplay) {
    return;
  }

  validateAutoplaySpinCount(spinCount);
  const activeWager = resolveActiveWager(state.currencyMode, state.balances, state.bets, CURRENCIES);

  if (!canAffordWager(activeWager.balanceAmount, activeWager.betAmount)) {
    state.statusMessage = `Not enough ${activeWager.currencyConfig.label.toLowerCase()} for that bet.`;
    render(dom);
    return;
  }

  clearQueuedAutoplay();
  state.isAutoplay = true;
  state.autoplaySpinsRemaining = spinCount;
  state.statusMessage = `Autoplay started for ${String(spinCount)} spins.`;
  render(dom);
  queueNextAutoplaySpinIfNeeded(dom);
}

// Autoplay-stop logic: stopping autoplay clears any queued timer immediately and zeroes the remaining
// counter so no later render can accidentally schedule another automatic paid spin.

/**
 * Stops autoplay immediately and optionally updates the visible status.
 * @param {DomCache} dom Cached DOM references.
 * @param {boolean} shouldUpdateStatus Whether the stop action should replace the current status text.
 * @returns {void}
 */
function handleAutoplayStop(dom, shouldUpdateStatus) {
  if (typeof shouldUpdateStatus !== "boolean") {
    throw new Error("Autoplay stop handling requires a boolean status-update flag.");
  }

  if (!state.isAutoplay && state.autoplaySpinsRemaining === 0 && queuedAutoplayTimeoutId === null) {
    return;
  }

  clearQueuedAutoplay();
  state.isAutoplay = false;
  state.autoplaySpinsRemaining = 0;

  if (shouldUpdateStatus) {
    state.statusMessage = state.isSpinning ? "Autoplay stopped after the current spin." : "Autoplay stopped.";
  }

  render(dom);
}

// Spin animation logic: a spin still settles through the existing pure math pipeline first, but the DOM does
// not commit the final matrix until a short reel-by-reel transition completes. That keeps RNG, paylines, and
// payouts deterministic while limiting animation code to a thin UI-only wrapper.

/**
 * Starts a spin when the machine is idle and the active wager is affordable.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleSpin(dom) {
  if (state.isSpinning) {
    return;
  }

  primeAudioContextForInteraction();
  const activeWager = resolveActiveWager(state.currencyMode, state.balances, state.bets, CURRENCIES);
  const shouldUseFreeSpin = state.isFreeSpinMode && state.freeSpinsRemaining > 0;
  const shouldUseAutoplaySpin = state.isAutoplay && !shouldUseFreeSpin;

  if (!shouldUseFreeSpin && !canAffordWager(activeWager.balanceAmount, activeWager.betAmount)) {
    state.statusMessage = `Not enough ${activeWager.currencyConfig.label.toLowerCase()} for that bet.`;
    render(dom);
    return;
  }

  clearQueuedFreeSpin();
  clearQueuedAutoplay();
  state.isSpinning = true;
  renderControls(dom);
  clearWinFeedback(dom);
  clearSlotHighlightState(dom.reelSlots);
  void performSpinWithAnimation(dom, activeWager, shouldUseFreeSpin, shouldUseAutoplaySpin);
}

// Bonus-spin orchestration logic: the existing spin animation path stays intact, while one boolean flag
// decides whether the wager is charged and whether another free spin should be queued after rendering.

/**
 * Resolves a spin through the existing math pipeline and then animates the DOM before committing the result.
 * @param {DomCache} dom Cached DOM references.
 * @param {ActiveWager} activeWager Validated active wager for the spin.
 * @param {boolean} shouldUseFreeSpin Whether the spin should consume a queued free spin instead of balance.
 * @param {boolean} shouldUseAutoplaySpin Whether the spin should count against autoplay.
 * @returns {Promise<void>} Promise resolved once the spin result has been rendered.
 */
async function performSpinWithAnimation(dom, activeWager, shouldUseFreeSpin, shouldUseAutoplaySpin) {
  const spinPlayResult = executeSpinPlay(
    activeWager.balanceAmount,
    activeWager.betAmount,
    REEL_COUNT,
    SLOTS_PER_REEL,
    PAYLINES,
    SYMBOL_PAYOUT_MULTIPLIERS,
    shouldUseFreeSpin,
    shouldUseAutoplaySpin
  );

  try {
    if (!shouldSkipSpinAnimation()) {
      await animateSpinResult(dom, spinPlayResult.reelMatrix);
    }
  } finally {
    applySpinPlayResult(activeWager.currencyMode, spinPlayResult);
    render(dom);
    queueNextAutomaticSpinIfNeeded(dom);
  }
}

// Bonus-state resolution logic: one helper calculates awards, decrements spent free spins, and flips the
// mode off exactly when the counter reaches zero so the rest of the state update remains deterministic.

/**
 * Commits a settled spin result into mutable game state.
 * @param {CurrencyMode} currencyMode Active currency mode used for the completed spin.
 * @param {SpinPlayResult} spinPlayResult Structured spin result produced by the existing logic pipeline.
 * @returns {void}
 */
function applySpinPlayResult(currencyMode, spinPlayResult) {
  validateSpinPlayResult(spinPlayResult);
  const freeSpinAwardCount = resolveFreeSpinAwardCount(spinPlayResult.paylineResults.scatterCount);
  const shouldStopAutoplay =
    freeSpinAwardCount > 0 ||
    (spinPlayResult.isAutoplaySpin && !canAffordWager(spinPlayResult.updatedBalance, spinPlayResult.betAmount));
  const freeSpinState = resolveNextFreeSpinState(
    state.isFreeSpinMode,
    state.freeSpinsRemaining,
    spinPlayResult.isFreeSpin,
    freeSpinAwardCount
  );
  const autoplayState = resolveNextAutoplayState(
    state.isAutoplay,
    state.autoplaySpinsRemaining,
    spinPlayResult.isAutoplaySpin,
    shouldStopAutoplay
  );
  state.reelMatrix = spinPlayResult.reelMatrix;
  state.paylineResults = spinPlayResult.paylineResults;
  state.payoutResults = spinPlayResult.payoutResults;
  state.balances[currencyMode] = spinPlayResult.updatedBalance;
  state.statusMessage = createSpinStatusMessage(
    currencyMode,
    spinPlayResult.betAmount,
    spinPlayResult.payoutResults.balanceDelta,
    spinPlayResult.isFreeSpin,
    freeSpinAwardCount,
    freeSpinState.freeSpinsRemaining
  );
  state.isFreeSpinMode = freeSpinState.isFreeSpinMode;
  state.freeSpinsRemaining = freeSpinState.freeSpinsRemaining;
  state.isAutoplay = autoplayState.isAutoplay;
  state.autoplaySpinsRemaining = autoplayState.autoplaySpinsRemaining;
  state.isSpinning = false;
  playSpinOutcomeSound(spinPlayResult);

  if (freeSpinAwardCount > 0) {
    playFreeSpinsAwardedSound();
  }
}

/**
 * Restores the initial machine state.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function handleReset(dom) {
  if (paytableRuntime.isOpen) {
    handlePaytableClose(dom);
  }

  const initialState = createInitialState();
  clearQueuedFreeSpin();
  clearQueuedAutoplay();
  state.currencyMode = initialState.currencyMode;
  state.balances = initialState.balances;
  state.bets = initialState.bets;
  state.isMuted = initialState.isMuted;
  state.isSpinning = initialState.isSpinning;
  state.isFreeSpinMode = initialState.isFreeSpinMode;
  state.freeSpinsRemaining = initialState.freeSpinsRemaining;
  state.isAutoplay = initialState.isAutoplay;
  state.autoplaySpinsRemaining = initialState.autoplaySpinsRemaining;
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
  renderAutoplayDisplay(dom);
  renderFreeSpinDisplay(dom);
  renderPaytableModal(dom);
  renderReels(dom);
  renderControls(dom);
  renderStatus(dom);
  renderReactiveVisualState(dom);
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
  dom.muteButton.setAttribute("aria-pressed", String(state.isMuted));
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

// Counter-rendering logic: autoplay keeps its own readout so the player can track queued automatic paid
// spins independently from the existing free-spin counter and status message.

/**
 * Renders the current autoplay counter.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderAutoplayDisplay(dom) {
  const autoplayLabel =
    state.isAutoplay && state.autoplaySpinsRemaining > 0
      ? `Autoplay: ${String(state.autoplaySpinsRemaining)}`
      : "Autoplay: Off";
  dom.autoplayDisplay.textContent = autoplayLabel;
  dom.autoplayDisplay.setAttribute(
    "aria-label",
    state.isAutoplay && state.autoplaySpinsRemaining > 0
      ? `Autoplay spins remaining ${String(state.autoplaySpinsRemaining)}`
      : "Autoplay off"
  );
}

// Counter-rendering logic: the visible free-spin count stays independent from the status message so bonus
// UI stays stable while the existing status region continues to describe the latest outcome.

/**
 * Renders the current free-spin counter.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderFreeSpinDisplay(dom) {
  const freeSpinLabel = `Free Spins: ${String(state.freeSpinsRemaining)}`;
  dom.freeSpinDisplay.textContent = freeSpinLabel;
  dom.freeSpinDisplay.setAttribute("aria-label", `Free spins remaining ${String(state.freeSpinsRemaining)}`);
}

// Paytable rendering logic: the dialog content is regenerated from shared config so the paytable never
// drifts from the current symbols, icons, or payout multipliers.

/**
 * Renders the generated paytable modal content from symbol configuration.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderPaytableModal(dom) {
  const paytableRows = createPaytableRowElements(SYMBOL_ORDER, SYMBOLS, SYMBOL_PAYOUT_MULTIPLIERS);
  dom.paytableModalContent.replaceChildren(...paytableRows);
}

/**
 * Renders the reel matrix into the existing DOM slots.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderReels(dom) {
  renderReelsFromMatrix(dom, state.reelMatrix);
}

/**
 * Renders any validated reel matrix into the existing slot grid.
 * @param {DomCache} dom Cached DOM references.
 * @param {readonly (readonly SymbolId[])[]} reelMatrix Matrix stored as `reelMatrix[reelIndex][slotIndex]`.
 * @returns {void}
 */
function renderReelsFromMatrix(dom, reelMatrix) {
  const reelSlotRenderInstructions = createReelSlotRenderInstructions(reelMatrix, dom.reelSlots);
  applyReelSlotRenderInstructions(reelSlotRenderInstructions);
}

/**
 * Removes transient visual win-state classes so a new spin starts from a neutral board.
 * @param {readonly ReelSlotElement[]} reelSlots Cached reel slot metadata from the DOM.
 * @returns {void}
 */
function clearSlotHighlightState(reelSlots) {
  validateReelSlotElements(reelSlots, REEL_COUNT, SLOTS_PER_REEL);
  reelSlots.forEach(
    /**
     * @param {ReelSlotElement} reelSlot Cached slot metadata.
     * @returns {void}
     */
    (reelSlot) => {
      reelSlot.element.classList.remove(
        MATCHED_SLOT_CLASS_NAME,
        WILD_MATCH_SLOT_CLASS_NAME,
        SCATTER_SLOT_CLASS_NAME,
        SLOT_WIN_HIGHLIGHT_CLASS_NAME
      );
    }
  );
}

/**
 * Renders button disabled states.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderControls(dom) {
  const canAffordPaidSpin = state.balances[state.currencyMode] >= state.bets[state.currencyMode];
  const isAutoFreeSpinSequenceActive =
    state.isFreeSpinMode && (state.isSpinning || state.freeSpinsRemaining > 0);
  const isAutoplaySequenceActive = state.isAutoplay || queuedAutoplayTimeoutId !== null;

  dom.spinButton.disabled =
    state.isSpinning ||
    isAutoFreeSpinSequenceActive ||
    isAutoplaySequenceActive ||
    (!state.isFreeSpinMode && !canAffordPaidSpin);
  dom.spinButton.textContent = isAutoFreeSpinSequenceActive
    ? "Free Spins Running"
    : isAutoplaySequenceActive
      ? "Autoplay Running"
      : "Spin";
  dom.autoplayButtons.forEach(
    /**
     * @param {HTMLButtonElement} autoplayButton Autoplay preset button.
     * @returns {void}
     */
    (autoplayButton) => {
      autoplayButton.disabled =
        state.isSpinning ||
        state.isFreeSpinMode ||
        state.isAutoplay ||
        !canAffordPaidSpin;
    }
  );
  dom.stopAutoplayButton.disabled = !state.isAutoplay;
  dom.paytableButton.disabled = state.isSpinning;
  dom.decreaseBetButton.disabled = state.isSpinning || state.isFreeSpinMode || state.isAutoplay;
  dom.increaseBetButton.disabled = state.isSpinning || state.isFreeSpinMode || state.isAutoplay;
  dom.realCurrencyButton.disabled = state.isSpinning || state.isFreeSpinMode || state.isAutoplay;
  dom.diningCurrencyButton.disabled = state.isSpinning || state.isFreeSpinMode || state.isAutoplay;
  dom.resetButton.disabled = state.isSpinning || state.isFreeSpinMode || state.isAutoplay;
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

// Reel transition logic: each reel keeps its existing DOM nodes, briefly slides the current icon content
// downward and out, swaps in the precomputed result symbols, and then slides the new icons downward into
// place. The animation is grouped by reel so the UI feels like a slot machine while all game math stays pure.

/**
 * Checks whether spin animation should be skipped for reduced-motion users or unsupported environments.
 * @returns {boolean} Whether the current environment should render spins instantly.
 */
function shouldSkipSpinAnimation() {
  return prefersReducedMotion();
}

// Reduced-motion logic: one helper centralizes the media-query check so spin transitions and the new
// celebratory feedback suite can honor the same accessibility gate without duplicating browser checks.

/**
 * Returns whether the current environment requests reduced motion.
 * @returns {boolean} Whether non-essential motion should be suppressed.
 */
function prefersReducedMotion() {
  if (typeof globalThis.matchMedia !== "function") {
    return false;
  }

  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Motion-suppression logic: one helper becomes the shared gate for all celebratory UI so reduced-motion
// users skip every legacy animation and transition path consistently.

/**
 * Returns whether motion-heavy UI effects should be suppressed.
 * @returns {boolean} Whether transitions and animations should be skipped.
 */
function shouldSuppressMotion() {
  return prefersReducedMotion();
}

/**
 * Animates the next spin result into the reel grid with a small per-reel stagger.
 * @param {DomCache} dom Cached DOM references.
 * @param {readonly (readonly SymbolId[])[]} nextReelMatrix Matrix that should appear after the spin settles.
 * @returns {Promise<void>} Promise resolved once all reel animations complete.
 */
async function animateSpinResult(dom, nextReelMatrix) {
  const reelInstructionsByReel = createReelInstructionGroups(
    createReelSlotRenderInstructions(nextReelMatrix, dom.reelSlots)
  );

  await Promise.all(
    reelInstructionsByReel.map(
      /**
       * @param {ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
       * @param {number} reelIndex Zero-based reel index.
       * @returns {Promise<void>} Promise resolved when the reel animation finishes.
       */
      (reelInstructions, reelIndex) =>
        animateSingleReelTransition(
          reelInstructions,
          reelIndex * SPIN_REEL_STAGGER_MS,
          SPIN_REEL_ANIMATION_DURATION_MS
        )
    )
  );
}

/**
 * Groups ordered slot render instructions into one array per reel.
 * @param {readonly ReelSlotRenderInstruction[]} reelSlotRenderInstructions Ordered slot render instructions.
 * @returns {ReelSlotRenderInstruction[][]} Render instructions grouped by reel index.
 */
function createReelInstructionGroups(reelSlotRenderInstructions) {
  validateReelSlotRenderInstructions(reelSlotRenderInstructions, REEL_COUNT, SLOTS_PER_REEL);

  /** @type {ReelSlotRenderInstruction[][]} */
  const groupedInstructions = Array.from({ length: REEL_COUNT }, () => []);

  reelSlotRenderInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelSlotRenderInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelSlotRenderInstruction) => {
      groupedInstructions[reelSlotRenderInstruction.reelIndex].push(reelSlotRenderInstruction);
    }
  );

  return groupedInstructions;
}

/**
 * Animates one reel by transitioning current symbols out, replacing them, and transitioning new symbols in.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @param {number} startDelayMs Delay before this reel begins animating.
 * @param {number} animationDurationMs Total animation duration for this reel.
 * @returns {Promise<void>} Promise resolved when the reel finishes animating.
 */
async function animateSingleReelTransition(reelInstructions, startDelayMs, animationDurationMs) {
  validateReelTransitionInputs(reelInstructions, startDelayMs, animationDurationMs);

  const phaseDurationMs = Math.max(Math.round(animationDurationMs / 2), 1);

  await waitForDelay(startDelayMs);
  setReelContentMotionState(reelInstructions, phaseDurationMs, SPIN_REEL_SYMBOL_OFFSET_PX, 0.24, 1.4);
  await waitForDelay(phaseDurationMs);
  applyReelInstructionGroup(reelInstructions);
  setReelContentMotionState(reelInstructions, 0, -SPIN_REEL_SYMBOL_OFFSET_PX, 0.18, 1.1);
  await waitForNextFrame();
  setReelContentMotionState(reelInstructions, phaseDurationMs, 0, 1, 0);
  await waitForDelay(phaseDurationMs);
  clearReelContentMotionState(reelInstructions);
}

/**
 * Validates one reel animation request before it touches the DOM.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @param {number} startDelayMs Delay before the reel starts animating.
 * @param {number} animationDurationMs Total animation duration for the reel.
 * @returns {void}
 * @throws {Error} Throws when the reel instructions or timing values are invalid.
 */
function validateReelTransitionInputs(reelInstructions, startDelayMs, animationDurationMs) {
  validateSingleReelInstructionGroup(reelInstructions);

  if (
    typeof startDelayMs !== "number" ||
    !Number.isFinite(startDelayMs) ||
    startDelayMs < 0
  ) {
    throw new Error(`Reel animation delay must be a non-negative finite number: ${String(startDelayMs)}.`);
  }

  if (
    typeof animationDurationMs !== "number" ||
    !Number.isFinite(animationDurationMs) ||
    animationDurationMs <= 0
  ) {
    throw new Error(
      `Reel animation duration must be a positive finite number: ${String(animationDurationMs)}.`
    );
  }

  const reelIndexes = new Set(reelInstructions.map((reelInstruction) => reelInstruction.reelIndex));

  if (reelIndexes.size !== 1) {
    throw new Error("Each reel animation request must contain instructions for exactly one reel.");
  }
}

/**
 * Validates one grouped reel-instruction set without requiring the full matrix worth of slots.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @returns {void}
 * @throws {Error} Throws when the reel instructions are incomplete or malformed.
 */
function validateSingleReelInstructionGroup(reelInstructions) {
  if (!Array.isArray(reelInstructions) || reelInstructions.length !== SLOTS_PER_REEL) {
    throw new Error(`Reel instruction groups must contain exactly ${SLOTS_PER_REEL} slots.`);
  }

  /** @type {Set<number>} */
  const seenSlotIndexes = new Set();

  reelInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelInstruction) => {
      validateReelSlotElement(
        {
          element: reelInstruction.element,
          reelIndex: reelInstruction.reelIndex,
          slotIndex: reelInstruction.slotIndex
        },
        REEL_COUNT,
        SLOTS_PER_REEL
      );

      if (seenSlotIndexes.has(reelInstruction.slotIndex)) {
        throw new Error(
          `Reel instruction group contains a duplicate slot index: ${String(reelInstruction.slotIndex)}.`
        );
      }

      seenSlotIndexes.add(reelInstruction.slotIndex);

      if (!Object.hasOwn(SYMBOLS, reelInstruction.symbolId)) {
        throw new Error(
          `Reel instruction group contains an unknown symbol: ${String(reelInstruction.symbolId)}.`
        );
      }

      if (
        typeof reelInstruction.symbolLabel !== "string" ||
        reelInstruction.symbolLabel.trim().length === 0
      ) {
        throw new Error("Reel instruction group must include non-empty symbol labels.");
      }

      if (
        typeof reelInstruction.symbolClassName !== "string" ||
        reelInstruction.symbolClassName.trim().length === 0
      ) {
        throw new Error("Reel instruction group must include non-empty symbol class names.");
      }

      if (
        typeof reelInstruction.symbolSvgMarkup !== "string" ||
        reelInstruction.symbolSvgMarkup.trim().length === 0
      ) {
        throw new Error("Reel instruction group must include non-empty symbol SVG markup.");
      }

      if (
        typeof reelInstruction.ariaLabel !== "string" ||
        reelInstruction.ariaLabel.trim().length === 0
      ) {
        throw new Error("Reel instruction group must include non-empty aria-label text.");
      }
    }
  );
}

/**
 * Applies one grouped reel-instruction set to its existing slot elements.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @returns {void}
 */
function applyReelInstructionGroup(reelInstructions) {
  validateSingleReelInstructionGroup(reelInstructions);
  reelInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelInstruction) => {
      applySingleReelSlotRenderInstruction(reelInstruction);
    }
  );
}

/**
 * Applies motion-related CSS custom properties to every visible content wrapper in one reel.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @param {number} durationMs Transition duration applied to each slot content wrapper.
 * @param {number} offsetPixels Vertical offset applied during the current animation phase.
 * @param {number} opacity Opacity applied during the current animation phase.
 * @param {number} blurPixels Blur amount applied during the current animation phase.
 * @returns {void}
 */
function setReelContentMotionState(reelInstructions, durationMs, offsetPixels, opacity, blurPixels) {
  reelInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelInstruction) => {
      const contentElement = getRequiredSlotContentElement(reelInstruction.element);
      contentElement.style.setProperty("--spin-translate-y", `${offsetPixels}px`);
      contentElement.style.setProperty("--spin-opacity", String(opacity));
      contentElement.style.setProperty("--spin-blur", `${blurPixels}px`);
      contentElement.style.setProperty("--spin-duration", `${durationMs}ms`);
    }
  );
}

/**
 * Clears motion-related CSS custom properties after a reel transition finishes.
 * @param {readonly ReelSlotRenderInstruction[]} reelInstructions Ordered render instructions for one reel.
 * @returns {void}
 */
function clearReelContentMotionState(reelInstructions) {
  reelInstructions.forEach(
    /**
     * @param {ReelSlotRenderInstruction} reelInstruction Render instruction for one slot.
     * @returns {void}
     */
    (reelInstruction) => {
      const contentElement = getRequiredSlotContentElement(reelInstruction.element);
      contentElement.style.removeProperty("--spin-translate-y");
      contentElement.style.removeProperty("--spin-opacity");
      contentElement.style.removeProperty("--spin-blur");
      contentElement.style.removeProperty("--spin-duration");
    }
  );
}

/**
 * Returns the visible content wrapper used for symbol icon animation.
 * @param {HTMLDivElement} slotElement Slot element containing animated symbol content.
 * @returns {HTMLElement} Visible slot content wrapper.
 * @throws {Error} Throws when the slot does not contain the expected content wrapper.
 */
function getRequiredSlotContentElement(slotElement) {
  const contentElement = slotElement.querySelector(".symbol-slot-content");

  if (!(contentElement instanceof HTMLElement)) {
    throw new Error("Symbol slot content wrapper is missing from the reel DOM.");
  }

  return contentElement;
}

/**
 * Waits one browser paint cycle so inline style changes transition cleanly.
 * @returns {Promise<void>} Promise resolved on the next animation frame.
 */
function waitForNextFrame() {
  if (typeof globalThis.requestAnimationFrame !== "function") {
    return waitForDelay(16);
  }

  return new Promise(
    /**
     * @param {() => void} resolve Promise resolver.
     * @returns {void}
     */
    (resolve) => {
      globalThis.requestAnimationFrame(() => {
        resolve();
      });
    }
  );
}

/**
 * Waits for a fixed number of milliseconds.
 * @param {number} delayMs Delay in milliseconds.
 * @returns {Promise<void>} Promise resolved after the requested delay.
 * @throws {Error} Throws when the delay is not a non-negative finite number.
 */
function waitForDelay(delayMs) {
  if (typeof delayMs !== "number" || !Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error(`Delay must be a non-negative finite number: ${String(delayMs)}.`);
  }

  return new Promise(
    /**
     * @param {() => void} resolve Promise resolver.
     * @returns {void}
     */
    (resolve) => {
      globalThis.setTimeout(resolve, delayMs);
    }
  );
}

// Reactive CSS logic: rendering derives a tiny visual snapshot from existing payout, payline, mute, and
// status data, then pushes that snapshot into DOM classes and data attributes. This keeps CSS reactions
// declarative while leaving weighted RNG, paylines, payouts, and spin settlement completely untouched.

// Live-region logic: the existing announcer node is turned into a screen-reader-only status region at
// startup, then each outcome announcement briefly clears and re-posts its text so repeated results such as
// consecutive losses are still announced reliably without changing the static HTML or CSS files.

// Symbol icon rendering logic: each reel slot still reads from the same `reelMatrix[reelIndex][slotIndex]`
// and keeps the same aria-label path, but DOM rendering now swaps the visible text for a small inline SVG
// plus visually hidden fallback text so the slot icons stay minimalist and the accessibility model remains
// explicit and easy to extend.

/**
 * Renders reactive CSS-facing state derived from the current game state.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function renderReactiveVisualState(dom) {
  const reactiveVisualState = createReactiveVisualState(state);
  applyMachineVisualState(dom, reactiveVisualState);
  applySlotHighlightState(dom.reelSlots, reactiveVisualState);
  renderWinFeedback(dom, reactiveVisualState);
  renderAnnouncement(dom.resultsAnnouncer, reactiveVisualState.announcementMessage);
}

/**
 * Ensures the minimalist reactive styles for Iteration 19 exist without modifying the static stylesheet.
 * @returns {void}
 * @throws {Error} Throws when the document head is unavailable.
 */
function ensureReactiveStateStyles() {
  if (document.getElementById(REACTIVE_STYLE_ELEMENT_ID) !== null) {
    return;
  }

  if (document.head === null) {
    throw new Error("Cannot attach reactive styles because document.head is unavailable.");
  }

  const styleElement = document.createElement("style");
  styleElement.id = REACTIVE_STYLE_ELEMENT_ID;
  styleElement.textContent = `
    .machine,
    .reel-frame,
    .symbol-slot,
    .stat-value,
    .status-text,
    .chip-wide {
      transition:
        border-color 140ms ease,
        box-shadow 140ms ease,
        color 140ms ease,
        filter 140ms ease,
        transform 140ms ease;
    }

    .machine[data-visual-tone="win"] .reel-frame {
      border-color: #ffe28a;
      box-shadow: inset 0 0 0 2px rgb(255 226 138 / 22%);
    }

    .machine[data-visual-tone="win"] .stat-value,
    .machine[data-visual-tone="win"] .status-text {
      color: #fff0b8;
    }

    .machine[data-visual-tone="loss"] .reel-frame {
      border-color: #b98955;
    }

    .machine[data-visual-tone="alert"] .status-text {
      color: #ffd1d1;
    }

    .machine[data-muted="true"] .chip-wide {
      filter: saturate(0.7);
    }

    .symbol-slot.${MATCHED_SLOT_CLASS_NAME} {
      border-color: #ff4b5c;
      box-shadow:
        inset 0 0 0 2px rgb(255 75 92 / 28%),
        0 0 0 1px rgb(255 75 92 / 72%);
      transform: translateY(-1px);
    }

    .symbol-slot {
      overflow: hidden;
    }

    .symbol-slot .symbol-slot-content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition:
        transform var(--spin-duration, 0ms) ease,
        opacity var(--spin-duration, 0ms) ease,
        filter var(--spin-duration, 0ms) ease;
      transform: translateY(var(--spin-translate-y, 0));
      opacity: var(--spin-opacity, 1);
      filter: blur(var(--spin-blur, 0));
      will-change: transform, opacity, filter;
    }

    .symbol-slot .symbol-icon-shell {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.9rem;
      height: 2.9rem;
      border-radius: 999px;
      background: rgb(255 248 234 / 30%);
      box-shadow: inset 0 0 0 1px rgb(61 32 17 / 10%);
    }

    .symbol-slot .symbol-icon-svg {
      width: 2.15rem;
      height: 2.15rem;
      display: block;
    }

    .symbol-slot .symbol-icon-stroke {
      fill: none;
      stroke: #4a2714;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.8;
    }

    .symbol-slot .symbol-icon-fill {
      fill: #4a2714;
    }

    .symbol-slot.${WILD_MATCH_SLOT_CLASS_NAME} {
      border-color: #f3ab26;
    }

    .symbol-slot.${SCATTER_SLOT_CLASS_NAME} {
      box-shadow: inset 0 0 0 3px rgb(154 163 243 / 35%);
    }

    .symbol-slot.${SLOT_WIN_HIGHLIGHT_CLASS_NAME} {
      animation: slot-win-pulse 720ms ease-in-out infinite alternate;
    }

    .win-amount-overlay,
    .coin-shower-layer {
      position: absolute;
      pointer-events: none;
      opacity: 0;
      z-index: 3;
    }

    .win-amount-overlay {
      display: grid;
      place-items: center;
      padding: 1rem;
      border-radius: 1rem;
      background: linear-gradient(180deg, rgb(37 17 8 / 20%), rgb(37 17 8 / 52%));
      color: #fff4c2;
      font: 800 clamp(1.6rem, 4vw, 2.7rem) / 1 "Trebuchet MS", "Arial Black", sans-serif;
      letter-spacing: 0.08em;
      text-align: center;
      text-shadow: 0 0.1rem 0.35rem rgb(37 17 8 / 55%);
      transition: opacity 180ms ease, transform 180ms ease;
      transform: scale(0.94);
    }

    .win-amount-overlay.is-visible {
      opacity: 1;
      transform: scale(1);
    }

    .coin-shower-layer {
      overflow: hidden;
    }

    .coin-shower-layer.is-visible {
      opacity: 1;
    }

    .coin-particle {
      position: absolute;
      top: -1.75rem;
      width: var(--coin-size, 1rem);
      height: var(--coin-size, 1rem);
      border-radius: 999px;
      background: radial-gradient(circle at 35% 35%, #fff7b0 0 22%, #ffd75a 22% 68%, #c68412 68% 100%);
      box-shadow:
        inset 0 0 0 1px rgb(255 248 234 / 48%),
        0 0.15rem 0.45rem rgb(37 17 8 / 28%);
      opacity: 0;
      animation:
        coin-fall var(--coin-duration, 900ms) cubic-bezier(0.2, 0.8, 0.3, 1) forwards,
        coin-spin var(--coin-duration, 900ms) linear forwards;
      animation-delay: var(--coin-delay, 0ms);
      transform: translate3d(0, 0, 0) rotate(0deg);
    }

    @keyframes slot-win-pulse {
      from {
        transform: translateY(-1px) scale(1);
        box-shadow:
          inset 0 0 0 2px rgb(255 75 92 / 28%),
          0 0 0 1px rgb(255 75 92 / 72%);
      }

      to {
        transform: translateY(-2px) scale(1.03);
        box-shadow:
          inset 0 0 0 2px rgb(255 75 92 / 34%),
          0 0 0 1px rgb(255 75 92 / 72%),
          0 0 0.9rem rgb(255 75 92 / 34%);
      }
    }

    @keyframes coin-fall {
      0% {
        opacity: 0;
        transform: translate3d(0, -0.5rem, 0) rotate(0deg);
      }

      10% {
        opacity: 1;
      }

      100% {
        opacity: 0;
        transform: translate3d(var(--coin-drift-x, 0px), var(--coin-fall-distance, 0px), 0)
          rotate(var(--coin-rotation, 540deg));
      }
    }

    @keyframes coin-spin {
      from {
        filter: brightness(1);
      }

      50% {
        filter: brightness(1.15);
      }

      to {
        filter: brightness(0.95);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .machine,
      .reel-frame,
      .symbol-slot,
      .stat-value,
      .status-text,
      .chip-wide,
      .symbol-slot .symbol-slot-content,
      .win-amount-overlay,
      .coin-particle {
        transition: none !important;
        animation: none !important;
      }
    }
  `;
  document.head.append(styleElement);
}

/**
 * Configures the existing live region as visually hidden while keeping it available to assistive tech.
 * @param {HTMLElement} resultsAnnouncer Live region element used for outcome announcements.
 * @returns {void}
 * @throws {Error} Throws when the provided announcer element is invalid.
 */
function configureResultsAnnouncer(resultsAnnouncer) {
  if (!(resultsAnnouncer instanceof HTMLElement)) {
    throw new Error("Results announcer must be a valid HTMLElement.");
  }

  resultsAnnouncer.classList.add("visually-hidden");
  resultsAnnouncer.setAttribute("role", "status");
  resultsAnnouncer.setAttribute("aria-live", "polite");
  resultsAnnouncer.setAttribute("aria-atomic", "true");
}

/**
 * Derives the current reactive visual state from the existing game state.
 * @param {GameState} gameState Current mutable game state.
 * @returns {ReactiveVisualState} Visual state used to drive CSS-facing DOM state.
 */
function createReactiveVisualState(gameState) {
  const payoutAmount = gameState.payoutResults.balanceDelta;
  const shouldAnimateWinFeedback =
    payoutAmount > 0 &&
    (gameState.statusMessage.includes("Spent ") ||
      gameState.statusMessage.includes("Free spin complete")) &&
    !shouldSuppressMotion();

  return {
    tone: resolveVisualTone(gameState.statusMessage, payoutAmount),
    isMuted: gameState.isMuted,
    matchedCoordinateKeys: createCoordinateKeySetFromMatches(gameState.paylineResults.matches),
    wildCoordinateKeys: createCoordinateKeySet(
      gameState.paylineResults.matches.flatMap(
        /**
         * @param {PaylineMatch} match Winning payline match.
         * @returns {PaylineCoordinate[]} Wild coordinates that contributed to the match.
         */
        (match) => match.wildCoordinates
      )
    ),
    scatterCoordinateKeys: createCoordinateKeySet(
      gameState.paylineResults.scatterEvaluation.coordinates
    ),
    winningReelIndexes: createWinningReelIndexes(gameState.paylineResults.matches),
    isFreeSpinMode: gameState.isFreeSpinMode,
    isAutoplay: gameState.isAutoplay,
    shouldAnimateWinFeedback,
    winAmountText: shouldAnimateWinFeedback
      ? formatAmount(payoutAmount, gameState.currencyMode)
      : "",
    announcementMessage: createAnnouncementMessage(
      gameState.statusMessage,
      payoutAmount,
      gameState.paylineResults.matches.length,
      gameState.paylineResults.scatterCount
    )
  };
}

/**
 * Resolves the current high-level visual tone from the latest status and payout.
 * @param {string} statusMessage Latest user-facing status message.
 * @param {number} payoutAmount Latest applied payout amount.
 * @returns {VisualTone} Visual tone for the machine container.
 * @throws {Error} Throws when the inputs are invalid.
 */
function resolveVisualTone(statusMessage, payoutAmount) {
  if (typeof statusMessage !== "string" || statusMessage.trim().length === 0) {
    throw new Error("Visual tone resolution requires a non-empty status message.");
  }

  if (typeof payoutAmount !== "number" || !Number.isFinite(payoutAmount) || payoutAmount < 0) {
    throw new Error(
      `Visual tone payout amount must be a non-negative finite number: ${String(payoutAmount)}.`
    );
  }

  if (statusMessage.startsWith("Not enough ")) {
    return "alert";
  }

  if (statusMessage.includes("Spent ") || statusMessage.includes("Free spin complete")) {
    return payoutAmount > 0 ? "win" : "loss";
  }

  return "neutral";
}

/**
 * Applies the derived machine-level CSS state to existing DOM nodes.
 * @param {DomCache} dom Cached DOM references.
 * @param {ReactiveVisualState} reactiveVisualState Derived visual state.
 * @returns {void}
 */
function applyMachineVisualState(dom, reactiveVisualState) {
  dom.machine.dataset.visualTone = reactiveVisualState.tone;
  dom.machine.dataset.muted = String(reactiveVisualState.isMuted);
  dom.reelFrame.dataset.visualTone = reactiveVisualState.tone;
  dom.machine.classList.toggle("is-free-spin-mode", reactiveVisualState.isFreeSpinMode);
  dom.machine.classList.toggle("is-autoplay-mode", reactiveVisualState.isAutoplay);
}

/**
 * Applies payline, Wild, and Scatter highlight classes to the rendered slot grid.
 * @param {readonly ReelSlotElement[]} reelSlots Cached reel slot metadata from the DOM.
 * @param {ReactiveVisualState} reactiveVisualState Derived visual state.
 * @returns {void}
 */
function applySlotHighlightState(reelSlots, reactiveVisualState) {
  validateReelSlotElements(reelSlots, REEL_COUNT, SLOTS_PER_REEL);

  reelSlots.forEach(
    /**
     * @param {ReelSlotElement} reelSlot Cached slot metadata.
     * @returns {void}
     */
    (reelSlot) => {
      const coordinateKey = createCoordinateKey(reelSlot.reelIndex, reelSlot.slotIndex);
      reelSlot.element.classList.toggle(
        MATCHED_SLOT_CLASS_NAME,
        reactiveVisualState.matchedCoordinateKeys.has(coordinateKey)
      );
      reelSlot.element.classList.toggle(
        WILD_MATCH_SLOT_CLASS_NAME,
        reactiveVisualState.wildCoordinateKeys.has(coordinateKey)
      );
      reelSlot.element.classList.toggle(
        SCATTER_SLOT_CLASS_NAME,
        reactiveVisualState.scatterCoordinateKeys.has(coordinateKey)
      );
      reelSlot.element.classList.toggle(
        SLOT_WIN_HIGHLIGHT_CLASS_NAME,
        reactiveVisualState.shouldAnimateWinFeedback &&
          reactiveVisualState.matchedCoordinateKeys.has(coordinateKey)
      );
    }
  );
}

// Win-feedback rendering logic: the celebratory suite reads the same derived reactive state as the existing
// highlights, then positions a lightweight overlay over the reel grid and spawns short-lived particles only
// for genuine wins so the animation remains UI-only and easy to clear before the next spin.

/**
 * Renders the Iteration 19 win feedback suite for the latest reactive state.
 * @param {DomCache} dom Cached DOM references.
 * @param {ReactiveVisualState} reactiveVisualState Derived visual state for the current frame.
 * @returns {void}
 */
function renderWinFeedback(dom, reactiveVisualState) {
  if (!reactiveVisualState.shouldAnimateWinFeedback || shouldSuppressMotion()) {
    clearWinFeedback(dom);
    return;
  }

  updateWinFeedbackBounds(dom.reelFrame, dom.reelGrid, [
    dom.winAmountOverlay,
    dom.coinShowerLayer
  ]);
  showWinAmountOverlay(dom.winAmountOverlay, reactiveVisualState.winAmountText);
  launchCoinShower(dom.coinShowerLayer, dom.reelGrid, reactiveVisualState.winningReelIndexes);
}

// Win-feedback cleanup logic: the next spin and any non-winning render path both use one clear helper so
// the overlay text, particles, and pulse classes never linger between state transitions.

/**
 * Clears the transient win feedback visuals from the reel frame.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function clearWinFeedback(dom) {
  clearCoinShower(dom.coinShowerLayer);
  hideWinAmountOverlay(dom.winAmountOverlay);
}

// Win-overlay layout logic: the injected feedback nodes stay inside the reel frame, but their bounds are
// synchronized to the live reel grid so they continue to align on both desktop and mobile layouts.

/**
 * Positions feedback elements so they match the current reel grid bounds.
 * @param {HTMLElement} reelFrame Reel frame that owns the feedback elements.
 * @param {HTMLElement} reelGrid Reel grid whose box should be mirrored.
 * @param {readonly HTMLElement[]} feedbackElements Elements that should overlay the reel grid.
 * @returns {void}
 * @throws {Error} Throws when the reel frame, reel grid, or feedback elements are invalid.
 */
function updateWinFeedbackBounds(reelFrame, reelGrid, feedbackElements) {
  if (!(reelFrame instanceof HTMLElement) || !(reelGrid instanceof HTMLElement)) {
    throw new Error("Win feedback bounds require valid reel frame and reel grid elements.");
  }

  if (!Array.isArray(feedbackElements) || feedbackElements.length === 0) {
    throw new Error("Win feedback bounds require at least one overlay element.");
  }

  const reelFrameRect = reelFrame.getBoundingClientRect();
  const reelGridRect = reelGrid.getBoundingClientRect();
  const top = reelGridRect.top - reelFrameRect.top;
  const left = reelGridRect.left - reelFrameRect.left;
  const width = reelGridRect.width;
  const height = reelGridRect.height;

  feedbackElements.forEach(
    /**
     * @param {HTMLElement} feedbackElement Overlay element aligned to the reel grid.
     * @returns {void}
     */
    (feedbackElement) => {
      if (!(feedbackElement instanceof HTMLElement)) {
        throw new Error("Win feedback bounds received an invalid overlay element.");
      }

      feedbackElement.style.top = `${top}px`;
      feedbackElement.style.left = `${left}px`;
      feedbackElement.style.width = `${width}px`;
      feedbackElement.style.height = `${height}px`;
    }
  );
}

// Win-overlay text logic: the overlay only reflects validated payout text, making the celebratory copy
// deterministic and preventing stale win amounts from surviving later state changes.

/**
 * Shows the visual overlay for the latest win amount.
 * @param {HTMLElement} winAmountOverlay Overlay element that displays the payout text.
 * @param {string} winAmountText Formatted payout amount to display.
 * @returns {void}
 * @throws {Error} Throws when the overlay element or amount text is invalid.
 */
function showWinAmountOverlay(winAmountOverlay, winAmountText) {
  if (!(winAmountOverlay instanceof HTMLElement)) {
    throw new Error("Win amount overlay must be a valid HTMLElement.");
  }

  if (typeof winAmountText !== "string" || winAmountText.trim().length === 0) {
    throw new Error("Win amount overlay requires a non-empty formatted amount.");
  }

  winAmountOverlay.textContent = `Won ${winAmountText}`;
  winAmountOverlay.classList.add("is-visible");
}

/**
 * Hides the visual win amount overlay and clears any stale text.
 * @param {HTMLElement} winAmountOverlay Overlay element that displays the payout text.
 * @returns {void}
 * @throws {Error} Throws when the overlay element is invalid.
 */
function hideWinAmountOverlay(winAmountOverlay) {
  if (!(winAmountOverlay instanceof HTMLElement)) {
    throw new Error("Win amount overlay must be a valid HTMLElement.");
  }

  winAmountOverlay.classList.remove("is-visible");
  winAmountOverlay.textContent = "";
}

// Coin-particle logic: JavaScript chooses which reel columns should celebrate, computes their live screen
// positions, and creates short-lived particle nodes so the shower tracks actual winning reels instead of
// being a fixed decorative background.

/**
 * Launches a coin shower over the reels that participated in a winning payline.
 * @param {HTMLElement} coinShowerLayer Particle host element.
 * @param {HTMLElement} reelGrid Reel grid containing the visible reels.
 * @param {readonly number[]} winningReelIndexes Reel indexes that should receive particle effects.
 * @returns {void}
 */
function launchCoinShower(coinShowerLayer, reelGrid, winningReelIndexes) {
  if (shouldSuppressMotion()) {
    clearCoinShower(coinShowerLayer);
    return;
  }

  validateWinningReelIndexes(winningReelIndexes);
  clearCoinShower(coinShowerLayer);

  if (winningReelIndexes.length === 0) {
    return;
  }

  coinShowerLayer.classList.add("is-visible");
  const reelRects = getWinningReelRects(reelGrid, winningReelIndexes);
  const layerHeight = coinShowerLayer.getBoundingClientRect().height;

  reelRects.forEach(
    /**
     * @param {{ left: number, width: number }} reelRect Relative reel rectangle inside the particle layer.
     * @returns {void}
     */
    (reelRect) => {
      for (let coinIndex = 0; coinIndex < COIN_PARTICLES_PER_REEL; coinIndex += 1) {
        coinShowerLayer.append(createCoinParticle(reelRect, layerHeight, coinIndex));
      }
    }
  );
}

/**
 * Removes any existing temporary coin particles from the particle layer.
 * @param {HTMLElement} coinShowerLayer Particle host element.
 * @returns {void}
 * @throws {Error} Throws when the particle host is invalid.
 */
function clearCoinShower(coinShowerLayer) {
  if (!(coinShowerLayer instanceof HTMLElement)) {
    throw new Error("Coin shower layer must be a valid HTMLElement.");
  }

  coinShowerLayer.classList.remove("is-visible");
  coinShowerLayer.replaceChildren();
}

/**
 * Resolves winning reel rectangles relative to the reel grid overlay.
 * @param {HTMLElement} reelGrid Reel grid containing the visible reels.
 * @param {readonly number[]} winningReelIndexes Reel indexes that should receive particles.
 * @returns {{ left: number, width: number }[]} Relative reel rectangles for particle placement.
 * @throws {Error} Throws when the reel DOM is incomplete.
 */
function getWinningReelRects(reelGrid, winningReelIndexes) {
  const reelElements = getReelElements(reelGrid);
  const reelGridRect = reelGrid.getBoundingClientRect();

  return winningReelIndexes.map(
    /**
     * @param {number} reelIndex Reel index that won.
     * @returns {{ left: number, width: number }} Relative reel placement data.
     */
    (reelIndex) => {
      const reelElement = reelElements[reelIndex];
      const reelRect = reelElement.getBoundingClientRect();

      return {
        left: reelRect.left - reelGridRect.left,
        width: reelRect.width
      };
    }
  );
}

/**
 * Returns the rendered reel column elements from the reel grid.
 * @param {HTMLElement} reelGrid Reel grid containing the visible reels.
 * @returns {HTMLElement[]} Ordered reel column elements.
 * @throws {Error} Throws when the reel grid is invalid or incomplete.
 */
function getReelElements(reelGrid) {
  if (!(reelGrid instanceof HTMLElement)) {
    throw new Error("Reel element lookup requires a valid reel grid.");
  }

  const reelElements = Array.from(reelGrid.querySelectorAll(".reel")).filter(
    /**
     * @param {Element} element Candidate reel node.
     * @returns {element is HTMLElement} Whether the node is a reel element.
     */
    (element) => element instanceof HTMLElement
  );

  if (reelElements.length !== REEL_COUNT) {
    throw new Error("Unexpected reel count while building win feedback effects.");
  }

  return reelElements;
}

/**
 * Creates one temporary coin particle for the JavaScript-driven win effect.
 * @param {{ left: number, width: number }} reelRect Relative reel rectangle for particle placement.
 * @param {number} fallDistance Distance the particle should travel before fading out.
 * @param {number} coinIndex Zero-based coin index within the reel burst.
 * @returns {HTMLElement} Configured coin particle element.
 * @throws {Error} Throws when the reel geometry or fall distance is invalid.
 */
function createCoinParticle(reelRect, fallDistance, coinIndex) {
  if (
    typeof reelRect !== "object" ||
    reelRect === null ||
    typeof reelRect.left !== "number" ||
    typeof reelRect.width !== "number"
  ) {
    throw new Error("Coin particle creation requires reel placement data.");
  }

  if (
    typeof fallDistance !== "number" ||
    !Number.isFinite(fallDistance) ||
    fallDistance <= 0 ||
    !Number.isInteger(coinIndex) ||
    coinIndex < 0
  ) {
    throw new Error("Coin particle creation requires a positive fall distance and valid index.");
  }

  const particle = document.createElement("span");
  const randomOffset = Math.random();
  const randomDrift = Math.random();
  const randomDuration = Math.random();
  const randomSize = Math.random();
  const durationMs = 820 + randomDuration * 280;
  const delayMs = coinIndex * 45;

  particle.className = "coin-particle";
  particle.style.left = `${reelRect.left + reelRect.width * randomOffset}px`;
  particle.style.setProperty("--coin-size", `${0.7 + randomSize * 0.45}rem`);
  particle.style.setProperty("--coin-delay", `${delayMs}ms`);
  particle.style.setProperty("--coin-duration", `${durationMs}ms`);
  particle.style.setProperty("--coin-drift-x", `${(randomDrift - 0.5) * 38}px`);
  particle.style.setProperty("--coin-fall-distance", `${fallDistance + 32}px`);
  particle.style.setProperty("--coin-rotation", `${360 + randomDuration * 540}deg`);

  const removalDelayMs = delayMs + durationMs + 120;
  globalThis.setTimeout(
    /**
     * @returns {void}
     */
    () => {
      particle.remove();
    },
    removalDelayMs
  );

  return particle;
}

/**
 * Renders the live-region announcement for the latest state transition.
 * @param {HTMLElement} resultsAnnouncer Live region element.
 * @param {string} announcementMessage Latest announcement message.
 * @returns {void}
 * @throws {Error} Throws when the announcement message is invalid.
 */
function renderAnnouncement(resultsAnnouncer, announcementMessage) {
  if (!(resultsAnnouncer instanceof HTMLElement)) {
    throw new Error("Results announcer must be a valid HTMLElement.");
  }

  if (typeof announcementMessage !== "string" || announcementMessage.trim().length === 0) {
    throw new Error("Announcement message must be a non-empty string.");
  }

  const pendingTimeoutId = liveRegionTimeoutByElement.get(resultsAnnouncer);

  if (pendingTimeoutId !== undefined) {
    globalThis.clearTimeout(pendingTimeoutId);
  }

  resultsAnnouncer.textContent = "";

  const timeoutId = globalThis.setTimeout(
    /**
     * @returns {void}
     */
    () => {
      resultsAnnouncer.textContent = announcementMessage;
      liveRegionTimeoutByElement.delete(resultsAnnouncer);
    },
    LIVE_REGION_RESET_DELAY_MS
  );

  liveRegionTimeoutByElement.set(resultsAnnouncer, timeoutId);
}

/**
 * Builds the live-region announcement from the latest outcome data.
 * @param {string} statusMessage Latest user-facing status message.
 * @param {number} payoutAmount Latest payout amount applied to balance.
 * @param {number} matchedPaylineCount Number of paylines that matched on the latest result.
 * @param {number} scatterCount Number of Scatter symbols currently visible.
 * @returns {string} Concise live-region announcement.
 * @throws {Error} Throws when the provided counts or payout amount are invalid.
 */
function createAnnouncementMessage(statusMessage, payoutAmount, matchedPaylineCount, scatterCount) {
  if (typeof statusMessage !== "string" || statusMessage.trim().length === 0) {
    throw new Error("Announcement message requires a non-empty status message.");
  }

  if (typeof payoutAmount !== "number" || !Number.isFinite(payoutAmount) || payoutAmount < 0) {
    throw new Error(
      `Announcement payout amount must be a non-negative finite number: ${String(payoutAmount)}.`
    );
  }

  if (!Number.isInteger(matchedPaylineCount) || matchedPaylineCount < 0) {
    throw new Error(
      `Matched payline count must be a non-negative integer: ${String(matchedPaylineCount)}.`
    );
  }

  if (!Number.isInteger(scatterCount) || scatterCount < 0) {
    throw new Error(`Scatter count must be a non-negative integer: ${String(scatterCount)}.`);
  }

  if (!statusMessage.startsWith("Spent ")) {
    return statusMessage;
  }

  if (payoutAmount > 0) {
    return `Spin complete. You won ${extractAnnouncementAmount(statusMessage, payoutAmount)} on ${matchedPaylineCount} payline${matchedPaylineCount === 1 ? "" : "s"}.`;
  }

  if (scatterCount > 0) {
    return `Try again. ${scatterCount} Scatter symbol${scatterCount === 1 ? "" : "s"} landed, but no paylines matched.`;
  }

  return "Try again. No paylines matched.";
}

// Bonus-counter math: the scatter trigger always awards a fixed block of ten spins, and free-spin results
// consume exactly one queued spin before any new award is added back into the counter.

/**
 * Returns the fixed free-spin award for the latest scatter count.
 * @param {number} scatterCount Number of Scatter symbols on the settled matrix.
 * @returns {number} Free spins awarded by the result.
 */
function resolveFreeSpinAwardCount(scatterCount) {
  if (!Number.isInteger(scatterCount) || scatterCount < 0) {
    throw new Error(`Free-spin award resolution requires a non-negative integer scatter count: ${String(scatterCount)}.`);
  }

  return scatterCount >= FREE_SPIN_TRIGGER_SCATTER_COUNT ? FREE_SPIN_AWARD_COUNT : 0;
}

// Bonus-mode transitions stay in one helper so paid spins, free spins, and retriggers all update the
// counter consistently without scattering arithmetic across render and event code.

/**
 * Resolves the next free-spin mode state after a spin settles.
 * @param {boolean} isFreeSpinMode Whether the bonus loop was active before the spin.
 * @param {number} freeSpinsRemaining Number of queued free spins before the spin settled.
 * @param {boolean} wasFreeSpin Whether the completed spin consumed a free spin.
 * @param {number} freeSpinAwardCount Number of new free spins awarded by the result.
 * @returns {{ isFreeSpinMode: boolean, freeSpinsRemaining: number }} Updated bonus mode state.
 */
function resolveNextFreeSpinState(
  isFreeSpinMode,
  freeSpinsRemaining,
  wasFreeSpin,
  freeSpinAwardCount
) {
  if (typeof isFreeSpinMode !== "boolean") {
    throw new Error("Free-spin mode flag must be a boolean.");
  }

  if (!Number.isInteger(freeSpinsRemaining) || freeSpinsRemaining < 0) {
    throw new Error(`Free spins remaining must be a non-negative integer: ${String(freeSpinsRemaining)}.`);
  }

  if (typeof wasFreeSpin !== "boolean") {
    throw new Error("Completed free-spin flag must be a boolean.");
  }

  if (!Number.isInteger(freeSpinAwardCount) || freeSpinAwardCount < 0) {
    throw new Error(`Free-spin award count must be a non-negative integer: ${String(freeSpinAwardCount)}.`);
  }

  const spinsAfterConsumption = wasFreeSpin ? Math.max(freeSpinsRemaining - 1, 0) : freeSpinsRemaining;
  const nextFreeSpinsRemaining = spinsAfterConsumption + freeSpinAwardCount;

  return {
    isFreeSpinMode: nextFreeSpinsRemaining > 0 || (isFreeSpinMode && spinsAfterConsumption > 0),
    freeSpinsRemaining: nextFreeSpinsRemaining
  };
}

// Autoplay-counter math: each autoplay-paid spin consumes one queued count, and any stop condition zeros
// the autoplay state immediately so the scheduler cannot enqueue another paid spin.

/**
 * Resolves the next autoplay state after one spin settles.
 * @param {boolean} isAutoplay Whether autoplay was active before the spin settled.
 * @param {number} autoplaySpinsRemaining Number of queued autoplay spins before settlement.
 * @param {boolean} wasAutoplaySpin Whether the completed spin was started by autoplay.
 * @param {boolean} shouldStopAutoplay Whether autoplay should terminate immediately after this result.
 * @returns {{ isAutoplay: boolean, autoplaySpinsRemaining: number }} Updated autoplay state.
 */
function resolveNextAutoplayState(
  isAutoplay,
  autoplaySpinsRemaining,
  wasAutoplaySpin,
  shouldStopAutoplay
) {
  if (typeof isAutoplay !== "boolean") {
    throw new Error("Autoplay mode flag must be a boolean.");
  }

  if (!Number.isInteger(autoplaySpinsRemaining) || autoplaySpinsRemaining < 0) {
    throw new Error(`Autoplay spins remaining must be a non-negative integer: ${String(autoplaySpinsRemaining)}.`);
  }

  if (typeof wasAutoplaySpin !== "boolean" || typeof shouldStopAutoplay !== "boolean") {
    throw new Error("Autoplay state resolution requires boolean control flags.");
  }

  const spinsAfterConsumption =
    wasAutoplaySpin ? Math.max(autoplaySpinsRemaining - 1, 0) : autoplaySpinsRemaining;
  const nextIsAutoplay = isAutoplay && !shouldStopAutoplay && spinsAfterConsumption > 0;

  return {
    isAutoplay: nextIsAutoplay,
    autoplaySpinsRemaining: nextIsAutoplay ? spinsAfterConsumption : 0
  };
}

// Automatic-spin scheduling logic: the post-spin scheduler always gives free spins first priority, then
// falls back to autoplay only when no bonus spins are waiting.

/**
 * Queues the next eligible automatic spin after a result render completes.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function queueNextAutomaticSpinIfNeeded(dom) {
  if (state.isFreeSpinMode && state.freeSpinsRemaining > 0) {
    clearQueuedAutoplay();
    queueNextFreeSpinIfNeeded(dom);
    return;
  }

  clearQueuedFreeSpin();
  queueNextAutoplaySpinIfNeeded(dom);
}

// Auto-bonus scheduling logic: free spins should continue without another click, so one queued timeout
// starts the next spin after the current result has rendered and announced itself.

/**
 * Queues the next automatic free spin when the bonus loop should continue.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function queueNextFreeSpinIfNeeded(dom) {
  if (!state.isFreeSpinMode || state.freeSpinsRemaining <= 0) {
    clearQueuedFreeSpin();
    return;
  }

  clearQueuedFreeSpin();
  queuedFreeSpinTimeoutId = globalThis.setTimeout(
    /**
     * @returns {void}
     */
    () => {
      queuedFreeSpinTimeoutId = null;
      handleSpin(dom);
    },
    AUTO_FREE_SPIN_DELAY_MS
  );
}

// Autoplay scheduling logic: autoplay uses the same delayed queue pattern as free spins, but it only
// schedules another paid spin when autoplay is still active and no higher-priority free-spin mode exists.

/**
 * Queues the next automatic paid spin when autoplay should continue.
 * @param {DomCache} dom Cached DOM references.
 * @returns {void}
 */
function queueNextAutoplaySpinIfNeeded(dom) {
  if (!state.isAutoplay || state.autoplaySpinsRemaining <= 0 || state.isFreeSpinMode) {
    clearQueuedAutoplay();
    return;
  }

  clearQueuedAutoplay();
  queuedAutoplayTimeoutId = globalThis.setTimeout(
    /**
     * @returns {void}
     */
    () => {
      queuedAutoplayTimeoutId = null;
      handleSpin(dom);
    },
    AUTOPLAY_SPIN_DELAY_MS
  );
}

// Timeout cleanup logic: reset and new manual spins both clear any queued automatic bonus spin so stale
// timers never fire against a newer machine state.

/**
 * Clears any queued automatic free-spin timeout.
 * @returns {void}
 */
function clearQueuedFreeSpin() {
  if (queuedFreeSpinTimeoutId === null) {
    return;
  }

  globalThis.clearTimeout(queuedFreeSpinTimeoutId);
  queuedFreeSpinTimeoutId = null;
}

// Timer cleanup logic: autoplay uses its own queue so stopping autoplay or switching to free spins can
// cancel only the pending paid-spin timer without disturbing the bonus-spin queue.

/**
 * Clears any queued autoplay timeout.
 * @returns {void}
 */
function clearQueuedAutoplay() {
  if (queuedAutoplayTimeoutId === null) {
    return;
  }

  globalThis.clearTimeout(queuedAutoplayTimeoutId);
  queuedAutoplayTimeoutId = null;
}

/**
 * Builds a formatted amount string for live-region outcome announcements.
 * @param {string} statusMessage Latest user-facing status message used to infer the active currency mode.
 * @param {number} payoutAmount Latest payout amount applied to balance.
 * @returns {string} Formatted payout amount for the accessible announcement.
 * @throws {Error} Throws when the status message or payout amount is invalid.
 */
function extractAnnouncementAmount(statusMessage, payoutAmount) {
  if (typeof statusMessage !== "string" || statusMessage.trim().length === 0) {
    throw new Error("Announcement amount extraction requires a non-empty status message.");
  }

  if (typeof payoutAmount !== "number" || !Number.isFinite(payoutAmount) || payoutAmount < 0) {
    throw new Error(
      `Announcement amount must be a non-negative finite number: ${String(payoutAmount)}.`
    );
  }

  return formatAmount(
    payoutAmount,
    statusMessage.includes("DD ") ? "dining" : "real"
  );
}

// Winning-reel derivation logic: the coin shower only needs reel columns, so matches are normalized down to
// unique reel indexes once and then reused by the rendering layer.

/**
 * Creates a sorted list of reel indexes that participated in winning paylines.
 * @param {readonly PaylineMatch[]} matches Winning payline matches.
 * @returns {number[]} Unique winning reel indexes in ascending order.
 */
function createWinningReelIndexes(matches) {
  if (!Array.isArray(matches)) {
    throw new Error("Winning reel derivation requires an array of payline matches.");
  }

  const winningReelIndexes = new Set();

  matches.forEach(
    /**
     * @param {PaylineMatch} match Winning payline match.
     * @returns {void}
     */
    (match) => {
      match.coordinates.forEach(
        /**
         * @param {PaylineCoordinate} coordinate Winning payline coordinate.
         * @returns {void}
         */
        (coordinate) => {
          validatePaylineCoordinate(
            coordinate,
            REEL_COUNT,
            SLOTS_PER_REEL,
            match.paylineId,
            coordinate.reelIndex
          );
          winningReelIndexes.add(coordinate.reelIndex);
        }
      );
    }
  );

  return Array.from(winningReelIndexes).sort(
    /**
     * @param {number} left Left reel index.
     * @param {number} right Right reel index.
     * @returns {number} Numeric sort order.
     */
    (left, right) => left - right
  );
}

/**
 * Creates a coordinate key set from payline matches.
 * @param {readonly PaylineMatch[]} matches Winning payline matches.
 * @returns {Set<string>} Set of coordinate keys used for CSS state mapping.
 */
function createCoordinateKeySetFromMatches(matches) {
  return createCoordinateKeySet(
    matches.flatMap(
      /**
       * @param {PaylineMatch} match Winning payline match.
       * @returns {PaylineCoordinate[]} Coordinates included in the match.
       */
      (match) => match.coordinates
    )
  );
}

/**
 * Creates a unique coordinate key set from a coordinate list.
 * @param {readonly PaylineCoordinate[]} coordinates Ordered coordinates to normalize.
 * @returns {Set<string>} Unique coordinate keys.
 */
function createCoordinateKeySet(coordinates) {
  if (!Array.isArray(coordinates)) {
    throw new Error("Coordinate key creation requires an array of coordinates.");
  }

  return new Set(
    coordinates.map(
      /**
       * @param {PaylineCoordinate} coordinate Coordinate to normalize.
       * @returns {string} Stable coordinate key.
       */
      (coordinate) => createCoordinateKeyFromCoordinate(coordinate)
    )
  );
}

/**
 * Creates a stable coordinate key from one payline coordinate.
 * @param {PaylineCoordinate} coordinate Coordinate to normalize.
 * @returns {string} Stable coordinate key.
 */
function createCoordinateKeyFromCoordinate(coordinate) {
  validatePaylineCoordinate(coordinate, REEL_COUNT, SLOTS_PER_REEL, "reactive-visual-state", 0);
  return createCoordinateKey(coordinate.reelIndex, coordinate.slotIndex);
}

/**
 * Creates a stable coordinate key from raw reel and slot indexes.
 * @param {number} reelIndex Zero-based reel index.
 * @param {number} slotIndex Zero-based slot index.
 * @returns {string} Stable coordinate key.
 */
function createCoordinateKey(reelIndex, slotIndex) {
  validateReelSlotCoordinate(reelIndex, slotIndex, REEL_COUNT, SLOTS_PER_REEL);
  return `${String(reelIndex)}:${String(slotIndex)}`;
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
 * Creates the inline SVG markup for one symbol icon using a shared minimalist visual language.
 * @param {SymbolId} symbolId Symbol identifier to render.
 * @param {string} symbolLabel Human-readable label used for validation and fallback metadata.
 * @returns {string} Inline SVG markup string for the symbol.
 * @throws {Error} Throws when the symbol id or label is invalid.
 */
function createSymbolSvgMarkup(symbolId, symbolLabel) {
  if (!Object.hasOwn(SYMBOLS, symbolId)) {
    throw new Error(`Cannot create SVG markup for unknown symbol: ${String(symbolId)}.`);
  }

  if (typeof symbolLabel !== "string" || symbolLabel.trim().length === 0) {
    throw new Error("Symbol SVG markup requires a non-empty symbol label.");
  }

  const svgViewBox = "0 0 32 32";

  switch (symbolId) {
    case "ramen":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <path class="symbol-icon-stroke" d="M7 11h18a6 6 0 0 1-6 6H13a6 6 0 0 1-6-6Z" />
          <path class="symbol-icon-stroke" d="M10 19h12" />
          <path class="symbol-icon-stroke" d="M12 8v4" />
          <path class="symbol-icon-stroke" d="M16 7v4" />
          <path class="symbol-icon-stroke" d="M20 8v4" />
          <path class="symbol-icon-stroke" d="M11 21v3" />
          <path class="symbol-icon-stroke" d="M21 21v3" />
        </svg>
      `.trim();
    case "energy":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <rect class="symbol-icon-stroke" x="10" y="6.5" width="12" height="19" rx="3" />
          <path class="symbol-icon-fill" d="M16.8 10.5h-3.4l1.5 4.2H12l3.5 6.8-.8-4.8h3.2l-1.1-6.2Z" />
        </svg>
      `.trim();
    case "book":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <path class="symbol-icon-stroke" d="M8 8.5h7a4 4 0 0 1 4 4v11H12a4 4 0 0 0-4 4Z" />
          <path class="symbol-icon-stroke" d="M24 8.5h-7a4 4 0 0 0-4 4v11h7a4 4 0 0 1 4 4Z" />
          <path class="symbol-icon-stroke" d="M16 11.5v12" />
        </svg>
      `.trim();
    case "change":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <circle class="symbol-icon-stroke" cx="16" cy="16" r="8.5" />
          <circle class="symbol-icon-stroke" cx="16" cy="16" r="4.5" />
          <path class="symbol-icon-stroke" d="M16 10.5v11" />
          <path class="symbol-icon-stroke" d="M10.5 16h11" />
        </svg>
      `.trim();
    case "wild":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <path class="symbol-icon-stroke" d="M16 6.5 9 11v7.5c0 4.1 2.8 6.4 7 8 4.2-1.6 7-3.9 7-8V11Z" />
          <path class="symbol-icon-stroke" d="M12.5 16.5h7" />
          <path class="symbol-icon-stroke" d="M16 13v7" />
        </svg>
      `.trim();
    case "scatter":
      return `
        <svg class="symbol-icon-svg" viewBox="${svgViewBox}" aria-hidden="true" focusable="false">
          <circle class="symbol-icon-stroke" cx="16" cy="16" r="5.5" />
          <path class="symbol-icon-stroke" d="M16 6v3.5" />
          <path class="symbol-icon-stroke" d="M16 22.5V26" />
          <path class="symbol-icon-stroke" d="M6 16h3.5" />
          <path class="symbol-icon-stroke" d="M22.5 16H26" />
          <path class="symbol-icon-stroke" d="m9.4 9.4 2.5 2.5" />
          <path class="symbol-icon-stroke" d="m20.1 20.1 2.5 2.5" />
          <path class="symbol-icon-stroke" d="m22.6 9.4-2.5 2.5" />
          <path class="symbol-icon-stroke" d="m11.9 20.1-2.5 2.5" />
        </svg>
      `.trim();
    default:
      throw new Error(`Unhandled symbol icon renderer for symbol: ${String(symbolId)}.`);
  }
}

/**
 * Builds the accessible DOM content for one symbol slot.
 * @param {string} symbolSvgMarkup Inline SVG markup used for the visible icon.
 * @param {string} symbolLabel Human-readable symbol label preserved for assistive technology.
 * @returns {DocumentFragment} Accessible fragment containing the visible icon and screen-reader text.
 * @throws {Error} Throws when the SVG markup or label is invalid.
 */
function createSymbolSlotContent(symbolSvgMarkup, symbolLabel) {
  if (typeof symbolSvgMarkup !== "string" || symbolSvgMarkup.trim().length === 0) {
    throw new Error("Symbol slot content requires non-empty SVG markup.");
  }

  if (typeof symbolLabel !== "string" || symbolLabel.trim().length === 0) {
    throw new Error("Symbol slot content requires a non-empty symbol label.");
  }

  const slotContent = document.createDocumentFragment();
  const visibleContent = document.createElement("span");
  const iconShell = document.createElement("span");
  const screenReaderLabel = document.createElement("span");

  visibleContent.className = "symbol-slot-content";
  iconShell.className = "symbol-icon-shell";
  iconShell.setAttribute("aria-hidden", "true");
  iconShell.insertAdjacentHTML("beforeend", symbolSvgMarkup);

  screenReaderLabel.className = "visually-hidden";
  screenReaderLabel.textContent = symbolLabel;

  visibleContent.append(iconShell);
  slotContent.append(visibleContent, screenReaderLabel);
  return slotContent;
}

// Paytable-row generation logic: the modal rows come directly from shared symbol configuration and payout
// multipliers so the paytable stays fully data-driven and free of duplicated static markup.

/**
 * Creates the generated paytable rows for every configured symbol.
 * @param {readonly SymbolId[]} symbolOrder Ordered symbol ids to render.
 * @param {Readonly<Record<SymbolId, SymbolConfig>>} symbols Symbol configuration lookup.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup.
 * @returns {HTMLElement[]} Generated paytable row elements.
 */
function createPaytableRowElements(symbolOrder, symbols, payoutMultipliers) {
  return symbolOrder.map(
    /**
     * @param {SymbolId} symbolId Configured symbol identifier.
     * @returns {HTMLElement} Generated paytable row element.
     */
    (symbolId) => createPaytableRowElement(symbolId, symbols, payoutMultipliers)
  );
}

/**
 * Creates one generated paytable row.
 * @param {SymbolId} symbolId Configured symbol identifier.
 * @param {Readonly<Record<SymbolId, SymbolConfig>>} symbols Symbol configuration lookup.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup.
 * @returns {HTMLElement} Generated paytable row element.
 */
function createPaytableRowElement(symbolId, symbols, payoutMultipliers) {
  if (!Object.hasOwn(symbols, symbolId)) {
    throw new Error(`Paytable row creation requires a configured symbol: ${String(symbolId)}.`);
  }

  if (!Object.hasOwn(payoutMultipliers, symbolId)) {
    throw new Error(`Paytable row creation requires a payout multiplier for symbol: ${String(symbolId)}.`);
  }

  const symbol = symbols[symbolId];
  const rowElement = document.createElement("div");
  const symbolElement = document.createElement("span");
  const iconElement = document.createElement("span");
  const labelElement = document.createElement("span");
  const payoutElement = document.createElement("span");

  rowElement.className = "paytable-row";
  symbolElement.className = "paytable-symbol";
  iconElement.className = "paytable-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.insertAdjacentHTML("beforeend", createSymbolSvgMarkup(symbolId, symbol.label));
  labelElement.textContent = symbol.label;
  payoutElement.className = "paytable-payout";
  payoutElement.textContent = createPaytablePayoutText(symbolId, payoutMultipliers[symbolId]);

  symbolElement.append(iconElement, labelElement);
  rowElement.append(symbolElement, payoutElement);
  return rowElement;
}

/**
 * Creates the paytable payout copy for one symbol.
 * @param {SymbolId} symbolId Configured symbol identifier.
 * @param {number} multiplier Payout multiplier associated with the symbol.
 * @returns {string} User-facing payout description.
 */
function createPaytablePayoutText(symbolId, multiplier) {
  if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier < 0) {
    throw new Error(`Paytable payout text requires a non-negative finite multiplier: ${String(multiplier)}.`);
  }

  if (symbolId === WILD_SYMBOL_ID) {
    return "Substitutes all";
  }

  if (symbolId === SCATTER_SYMBOL_ID) {
    return `${String(FREE_SPIN_TRIGGER_SCATTER_COUNT)}+ awards ${String(FREE_SPIN_AWARD_COUNT)} free spins`;
  }

  return `3x pays ${String(multiplier)}x bet`;
}

// Focus-trap logic: the paytable modal keeps keyboard focus inside the dialog until it closes so the
// obscured game board never receives accidental tab focus.

/**
 * Traps Tab focus navigation inside one modal element.
 * @param {HTMLElement} modalElement Modal element that owns the focusable controls.
 * @param {KeyboardEvent} event Keyboard event for the current Tab press.
 * @returns {void}
 */
function trapFocusInsideModal(modalElement, event) {
  const focusableElements = getFocusableElements(modalElement);

  if (focusableElements.length === 0) {
    event.preventDefault();
    modalElement.focus();
    return;
  }

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstFocusableElement) {
    event.preventDefault();
    lastFocusableElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastFocusableElement) {
    event.preventDefault();
    firstFocusableElement.focus();
  }
}

/**
 * Returns the currently focusable elements inside one container.
 * @param {HTMLElement} containerElement Container element to scan for focusable descendants.
 * @returns {HTMLElement[]} Ordered list of focusable elements.
 */
function getFocusableElements(containerElement) {
  if (!(containerElement instanceof HTMLElement)) {
    throw new Error("Focusable-element lookup requires a valid container element.");
  }

  return Array.from(
    containerElement.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    /**
     * @param {Element} element Candidate focusable descendant.
     * @returns {element is HTMLElement} Whether the descendant is a visible HTMLElement.
     */
    (element) => element instanceof HTMLElement && !element.hasAttribute("hidden")
  );
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
    symbolSvgMarkup: createSymbolSvgMarkup(symbolId, symbol.label),
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
      applySingleReelSlotRenderInstruction(reelSlotRenderInstruction);
    }
  );
}

/**
 * Validates a list of unique winning reel indexes.
 * @param {readonly number[]} winningReelIndexes Reel indexes derived from winning paylines.
 * @returns {void}
 * @throws {Error} Throws when a reel index is invalid or duplicated.
 */
function validateWinningReelIndexes(winningReelIndexes) {
  if (!Array.isArray(winningReelIndexes)) {
    throw new Error("Winning reel indexes must be provided as an array.");
  }

  /** @type {Set<number>} */
  const seenReelIndexes = new Set();

  winningReelIndexes.forEach(
    /**
     * @param {number} reelIndex Reel index to validate.
     * @returns {void}
     */
    (reelIndex) => {
      if (!Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex >= REEL_COUNT) {
        throw new Error(`Winning reel index is out of bounds: ${String(reelIndex)}.`);
      }

      if (seenReelIndexes.has(reelIndex)) {
        throw new Error(`Winning reel index is duplicated: ${String(reelIndex)}.`);
      }

      seenReelIndexes.add(reelIndex);
    }
  );
}

/**
 * Applies one validated slot render instruction to its existing DOM node.
 * @param {ReelSlotRenderInstruction} reelSlotRenderInstruction Render instruction for one slot.
 * @returns {void}
 */
function applySingleReelSlotRenderInstruction(reelSlotRenderInstruction) {
  resetSymbolClasses(reelSlotRenderInstruction.element);
  reelSlotRenderInstruction.element.classList.add(reelSlotRenderInstruction.symbolClassName);
  reelSlotRenderInstruction.element.replaceChildren(
    createSymbolSlotContent(
      reelSlotRenderInstruction.symbolSvgMarkup,
      reelSlotRenderInstruction.symbolLabel
    )
  );
  reelSlotRenderInstruction.element.setAttribute("aria-label", reelSlotRenderInstruction.ariaLabel);
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

// Bet-to-spin connection logic: first resolve one validated active wager from the current currency,
// balance, and bet tables, then feed that exact wager into a pure spin settlement helper. This keeps the
// click handlers thin while guaranteeing the most recent bet amount is the single source of truth for both
// bet adjustment and spin payout calculations.

/**
 * Resolves the active wager from the current currency, balance table, and bet table.
 * @param {CurrencyMode} currencyMode Active currency mode.
 * @param {Record<CurrencyMode, number>} balances Current balances by currency.
 * @param {Record<CurrencyMode, number>} bets Current bets by currency.
 * @param {Readonly<Record<CurrencyMode, CurrencyConfig>>} currencies Currency configuration lookup.
 * @returns {ActiveWager} Validated active wager data.
 * @throws {Error} Throws when the currency mode, balance, or bet configuration is invalid.
 */
function resolveActiveWager(currencyMode, balances, bets, currencies) {
  validateCurrencyMode(currencyMode, currencies);
  validateCurrencyAmountRecord(balances, currencies, "Balance");
  validateCurrencyAmountRecord(bets, currencies, "Bet");

  const currencyConfig = currencies[currencyMode];
  const balanceAmount = balances[currencyMode];
  const betAmount = bets[currencyMode];

  validateAllowedBetAmount(betAmount, currencyConfig);

  return {
    currencyMode,
    balanceAmount,
    betAmount,
    currencyConfig
  };
}

/**
 * Resolves the next allowed bet amount from the configured bet ladder.
 * @param {readonly number[]} allowedBets Ordered allowed bet amounts for the active currency.
 * @param {number} currentBet Current bet amount for the active currency.
 * @param {number} direction Negative for decrement and positive for increment.
 * @returns {number} Next bet amount clamped to the configured range.
 * @throws {Error} Throws when the allowed bet ladder, current bet, or direction is invalid.
 */
function resolveNextBetAmount(allowedBets, currentBet, direction) {
  validateAllowedBetList(allowedBets);
  validatePayoutBetAmount(currentBet);

  if (!Number.isInteger(direction) || direction === 0) {
    throw new Error(`Bet adjustment direction must be a non-zero integer: ${String(direction)}.`);
  }

  const currentIndex = allowedBets.indexOf(currentBet);

  if (currentIndex === -1) {
    throw new Error(`Current bet is not part of the allowed bet list: ${String(currentBet)}.`);
  }

  const nextIndex = clampNumber(currentIndex + direction, 0, allowedBets.length - 1);
  return allowedBets[nextIndex];
}

/**
 * Returns whether the current balance can cover the active wager.
 * @param {number} balanceAmount Current balance for the active currency.
 * @param {number} betAmount Current bet for the active currency.
 * @returns {boolean} Whether the wager is affordable.
 * @throws {Error} Throws when the balance or bet amount is invalid.
 */
function canAffordWager(balanceAmount, betAmount) {
  validateBalanceAmount(balanceAmount);
  validatePayoutBetAmount(betAmount);
  return balanceAmount >= betAmount;
}

/**
 * Executes one complete spin using the provided wager and returns the full outcome without mutating state.
 * @param {number} currentBalance Balance before the wager is deducted.
 * @param {number} betAmount Bet amount to use for the full spin transaction.
 * @param {number} reelCount Number of reels to generate.
 * @param {number} slotsPerReel Number of slots per reel.
 * @param {readonly PaylineDefinition[]} paylines Paylines used to evaluate the final matrix.
 * @param {Readonly<Record<SymbolId, number>>} payoutMultipliers Payout multiplier lookup by symbol.
 * @param {boolean} [isFreeSpin=false] Whether the spin should skip deducting the wager from the balance.
 * @param {boolean} [isAutoplaySpin=false] Whether the spin should count against autoplay.
 * @returns {SpinPlayResult} Pure spin settlement output.
 * @throws {Error} Throws when the balance, bet, reel dimensions, paylines, or payout configuration is invalid.
 */
function executeSpinPlay(
  currentBalance,
  betAmount,
  reelCount,
  slotsPerReel,
  paylines,
  payoutMultipliers,
  isFreeSpin = false,
  isAutoplaySpin = false
) {
  validateBalanceAmount(currentBalance);
  validatePayoutBetAmount(betAmount);
  validateSpinDimensions(reelCount, slotsPerReel);
  validatePaylineDefinitions(paylines, reelCount, slotsPerReel);
  validatePayoutMultipliers(payoutMultipliers);

  if (typeof isFreeSpin !== "boolean" || typeof isAutoplaySpin !== "boolean") {
    throw new Error("Spin execution requires boolean free-spin and autoplay flags.");
  }

  if (!isFreeSpin && !canAffordWager(currentBalance, betAmount)) {
    throw new Error(
      `Cannot execute spin because the balance ${String(currentBalance)} is lower than the bet ${String(betAmount)}.`
    );
  }

  const wagerCost = isFreeSpin ? 0 : betAmount;
  const balanceAfterBet = roundToCurrencyPrecision(currentBalance - wagerCost);
  const spinResult = createSpinResult(reelCount, slotsPerReel);
  const reelMatrix = createReelMatrixFromSpinResult(spinResult);
  const paylineResults = evaluateAllPaylines(reelMatrix, paylines);
  const payoutSummary = calculateTotalPayout(
    paylineResults.matches,
    betAmount,
    payoutMultipliers
  );
  const payoutResults = applyPayoutToBalance(balanceAfterBet, payoutSummary);

  return {
    betAmount,
    wagerCost,
    isFreeSpin,
    isAutoplaySpin,
    balanceBeforeSpin: currentBalance,
    balanceAfterBet,
    updatedBalance: payoutResults.updatedBalance,
    reelMatrix,
    paylineResults,
    payoutResults
  };
}

/**
 * Builds the status message shown after a completed spin.
 * @param {CurrencyMode} currencyMode Active currency mode used for formatting.
 * @param {number} betAmount Bet amount configured for the spin.
 * @param {number} payoutAmount Payout amount won on the spin.
 * @param {boolean} isFreeSpin Whether the completed spin was free.
 * @param {number} freeSpinAwardCount Number of free spins awarded by the result.
 * @param {number} freeSpinsRemaining Number of free spins remaining after the result is applied.
 * @returns {string} User-facing spin completion message.
 * @throws {Error} Throws when the currency mode, amounts, or free-spin metadata is invalid.
 */
function createSpinStatusMessage(
  currencyMode,
  betAmount,
  payoutAmount,
  isFreeSpin,
  freeSpinAwardCount,
  freeSpinsRemaining
) {
  validateCurrencyMode(currencyMode, CURRENCIES);
  validatePayoutBetAmount(betAmount);

  if (typeof payoutAmount !== "number" || !Number.isFinite(payoutAmount) || payoutAmount < 0) {
    throw new Error(`Spin payout amount must be a non-negative finite number: ${String(payoutAmount)}.`);
  }

  if (typeof isFreeSpin !== "boolean") {
    throw new Error("Spin status message requires a boolean free-spin flag.");
  }

  if (!Number.isInteger(freeSpinAwardCount) || freeSpinAwardCount < 0) {
    throw new Error(`Free-spin award count must be a non-negative integer: ${String(freeSpinAwardCount)}.`);
  }

  if (!Number.isInteger(freeSpinsRemaining) || freeSpinsRemaining < 0) {
    throw new Error(`Free spins remaining must be a non-negative integer: ${String(freeSpinsRemaining)}.`);
  }

  const spinPrefix = isFreeSpin ? "Free spin complete" : `Spent ${formatAmount(betAmount, currencyMode)}`;
  const payoutMessage =
    payoutAmount > 0
      ? `${spinPrefix} and won ${formatAmount(payoutAmount, currencyMode)}.`
      : `${spinPrefix}. No paylines matched.`;

  if (freeSpinAwardCount > 0) {
    return `${String(freeSpinAwardCount)} Free Spins Awarded! ${payoutMessage} Free Spins: ${String(freeSpinsRemaining)}.`;
  }

  if (isFreeSpin) {
    if (freeSpinsRemaining > 0) {
      return `${payoutMessage} Free Spins: ${String(freeSpinsRemaining)} remaining.`;
    }

    return `${payoutMessage} Free spins complete. Returning to normal play.`;
  }

  return payoutMessage;
}

// Preset validation logic: autoplay only supports the three requested counts, so one helper keeps button
// handlers and future callers aligned on the same allowed values.

/**
 * Validates one autoplay preset count.
 * @param {number} spinCount Autoplay preset count to validate.
 * @returns {void}
 */
function validateAutoplaySpinCount(spinCount) {
  if (!Number.isInteger(spinCount) || !AUTOPLAY_OPTIONS.includes(spinCount)) {
    throw new Error(`Autoplay spin count must be one of ${AUTOPLAY_OPTIONS.join(", ")}: ${String(spinCount)}.`);
  }
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
 * Validates that a currency mode exists in the shared currency configuration.
 * @param {CurrencyMode} currencyMode Currency mode to validate.
 * @param {Readonly<Record<CurrencyMode, CurrencyConfig>>} currencies Currency configuration lookup.
 * @returns {void}
 * @throws {Error} Throws when the currency mode is not configured.
 */
function validateCurrencyMode(currencyMode, currencies) {
  if (!Object.hasOwn(currencies, currencyMode)) {
    throw new Error(`Currency mode must be configured: ${String(currencyMode)}.`);
  }
}

/**
 * Validates a currency-keyed amount record such as balances or bets.
 * @param {Record<CurrencyMode, number>} amountRecord Currency-keyed numeric record.
 * @param {Readonly<Record<CurrencyMode, CurrencyConfig>>} currencies Currency configuration lookup.
 * @param {string} label Human-readable label used in error messages.
 * @returns {void}
 * @throws {Error} Throws when a configured currency amount is missing or invalid.
 */
function validateCurrencyAmountRecord(amountRecord, currencies, label) {
  if (typeof amountRecord !== "object" || amountRecord === null) {
    throw new Error(`${label} record must be a non-null object.`);
  }

  Object.keys(currencies).forEach(
    /**
     * @param {string} configuredCurrencyMode Configured currency mode key.
     * @returns {void}
     */
    (configuredCurrencyMode) => {
      if (!Object.hasOwn(amountRecord, configuredCurrencyMode)) {
        throw new Error(`${label} record is missing currency mode: ${configuredCurrencyMode}.`);
      }

      const amount = amountRecord[/** @type {CurrencyMode} */ (configuredCurrencyMode)];

      if (label === "Balance") {
        validateBalanceAmount(amount);
        return;
      }

      validatePayoutBetAmount(amount);
    }
  );
}

/**
 * Validates the ordered allowed bet ladder for one currency.
 * @param {readonly number[]} allowedBets Ordered allowed bet amounts.
 * @returns {void}
 * @throws {Error} Throws when the bet ladder is missing, non-numeric, or empty.
 */
function validateAllowedBetList(allowedBets) {
  if (!Array.isArray(allowedBets) || allowedBets.length === 0) {
    throw new Error("Allowed bet amounts must be provided as a non-empty array.");
  }

  allowedBets.forEach(
    /**
     * @param {number} allowedBet Allowed bet amount.
     * @param {number} index Bet index.
     * @returns {void}
     */
    (allowedBet, index) => {
      validatePayoutBetAmount(allowedBet);

      if (index > 0 && allowedBet <= allowedBets[index - 1]) {
        throw new Error("Allowed bet amounts must be in strictly increasing order.");
      }
    }
  );
}

/**
 * Validates that the current bet amount belongs to the configured allowed bet ladder.
 * @param {number} betAmount Bet amount to validate.
 * @param {Readonly<CurrencyConfig>} currencyConfig Currency metadata containing the allowed bet ladder.
 * @returns {void}
 * @throws {Error} Throws when the bet amount is not allowed for the currency.
 */
function validateAllowedBetAmount(betAmount, currencyConfig) {
  validatePayoutBetAmount(betAmount);
  validateAllowedBetList(currencyConfig.allowedBets);

  if (!currencyConfig.allowedBets.includes(betAmount)) {
    throw new Error(
      `Bet amount ${String(betAmount)} is not allowed for currency ${currencyConfig.id}.`
    );
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
 * Validates the structured spin-play result returned by the pure spin settlement pipeline.
 * @param {SpinPlayResult} spinPlayResult Spin result to validate.
 * @returns {void}
 * @throws {Error} Throws when the spin result is missing required payout, matrix, or payline data.
 */
function validateSpinPlayResult(spinPlayResult) {
  if (typeof spinPlayResult !== "object" || spinPlayResult === null) {
    throw new Error("Spin play result must be a non-null object.");
  }

  validatePayoutBetAmount(spinPlayResult.betAmount);
  validateBalanceAmount(spinPlayResult.balanceBeforeSpin);
  validateBalanceAmount(spinPlayResult.balanceAfterBet);
  validateBalanceAmount(spinPlayResult.updatedBalance);
  validateReelMatrix(spinPlayResult.reelMatrix, REEL_COUNT, SLOTS_PER_REEL);

  if (typeof spinPlayResult.paylineResults !== "object" || spinPlayResult.paylineResults === null) {
    throw new Error("Spin play result paylineResults must be a non-null object.");
  }

  if (!Array.isArray(spinPlayResult.paylineResults.matches)) {
    throw new Error("Spin play result paylineResults.matches must be an array.");
  }

  if (typeof spinPlayResult.payoutResults !== "object" || spinPlayResult.payoutResults === null) {
    throw new Error("Spin play result payoutResults must be a non-null object.");
  }

  validateBalanceAmount(spinPlayResult.payoutResults.balanceDelta);
  validateBalanceAmount(spinPlayResult.payoutResults.updatedBalance);
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
        typeof reelSlotRenderInstruction.symbolSvgMarkup !== "string" ||
        reelSlotRenderInstruction.symbolSvgMarkup.trim().length === 0
      ) {
        throw new Error("Reel slot render instruction must include non-empty symbol SVG markup.");
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
