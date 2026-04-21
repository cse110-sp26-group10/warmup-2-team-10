/**
 * Weighted probability approach:
 * Each symbol gets a positive numeric weight. Higher weights occupy more of the
 * total probability range, so common symbols are selected more often while rare
 * symbols still remain possible without hardcoding repeated array entries.
 */

/**
 * @module slot-rng
 * @description Pure JavaScript RNG model for weighted slot symbol selection.
 */

/**
 * @typedef {"ramen" | "energy" | "book" | "change" | "wild"} SymbolId
 */

/**
 * @typedef {object} WeightedSymbolConfig
 * @property {SymbolId} id Internal symbol identifier.
 * @property {string} label Human-readable symbol label.
 * @property {number} weight Relative probability weight. Must be positive.
 */

/**
 * @typedef {() => number} RandomNumberGenerator
 */

/**
 * @typedef {object} GridSize
 * @property {number} rows Number of grid rows.
 * @property {number} columns Number of grid columns.
 */

/** @type {Readonly<GridSize>} */
const DEFAULT_GRID_SIZE = Object.freeze({
  rows: 3,
  columns: 5
});

/** @type {Readonly<Record<SymbolId, WeightedSymbolConfig>>} */
const SYMBOLS = Object.freeze({
  ramen: Object.freeze({ id: "ramen", label: "Ramen", weight: 35 }),
  change: Object.freeze({ id: "change", label: "Change", weight: 30 }),
  energy: Object.freeze({ id: "energy", label: "Energy Drink", weight: 20 }),
  book: Object.freeze({ id: "book", label: "Textbook", weight: 10 }),
  wild: Object.freeze({ id: "wild", label: "Diploma Wild", weight: 5 })
});

/** @type {Readonly<WeightedSymbolConfig[]>} */
const DEFAULT_WEIGHTED_SYMBOLS = Object.freeze(Object.values(SYMBOLS));

/**
 * Selects one symbol id from a weighted symbol table.
 * @param {readonly WeightedSymbolConfig[]} [weightedSymbols=DEFAULT_WEIGHTED_SYMBOLS] Weighted symbol table.
 * @param {RandomNumberGenerator} [randomNumberGenerator=Math.random] Source of random numbers in the range [0, 1).
 * @returns {SymbolId} Selected symbol id.
 * @throws {Error} Throws when weights or random input are invalid.
 */
function selectWeightedSymbol(
  weightedSymbols = DEFAULT_WEIGHTED_SYMBOLS,
  randomNumberGenerator = Math.random
) {
  validateWeightedSymbols(weightedSymbols);
  validateRandomNumberGenerator(randomNumberGenerator);

  const totalWeight = getTotalWeight(weightedSymbols);
  const targetWeight = randomNumberGenerator() * totalWeight;

  validateRandomTarget(targetWeight, totalWeight);

  return findSymbolByWeightTarget(weightedSymbols, targetWeight);
}

/**
 * Creates a 3x5-compatible grid of weighted random symbol ids.
 * @param {number} [rows=DEFAULT_GRID_SIZE.rows] Number of rows to generate.
 * @param {number} [columns=DEFAULT_GRID_SIZE.columns] Number of columns to generate.
 * @param {readonly WeightedSymbolConfig[]} [weightedSymbols=DEFAULT_WEIGHTED_SYMBOLS] Weighted symbol table.
 * @param {RandomNumberGenerator} [randomNumberGenerator=Math.random] Source of random numbers in the range [0, 1).
 * @returns {SymbolId[][]} Randomized symbol grid.
 * @throws {Error} Throws when dimensions, weights, or random input are invalid.
 */
function createWeightedSymbolGrid(
  rows = DEFAULT_GRID_SIZE.rows,
  columns = DEFAULT_GRID_SIZE.columns,
  weightedSymbols = DEFAULT_WEIGHTED_SYMBOLS,
  randomNumberGenerator = Math.random
) {
  validatePositiveInteger(rows, "rows");
  validatePositiveInteger(columns, "columns");
  validateWeightedSymbols(weightedSymbols);
  validateRandomNumberGenerator(randomNumberGenerator);

  return Array.from(
    { length: rows },
    /**
     * @returns {SymbolId[]} One generated grid row.
     */
    () => createWeightedSymbolRow(columns, weightedSymbols, randomNumberGenerator)
  );
}

/**
 * Creates one row of weighted random symbol ids.
 * @param {number} columns Number of columns to generate.
 * @param {readonly WeightedSymbolConfig[]} weightedSymbols Weighted symbol table.
 * @param {RandomNumberGenerator} randomNumberGenerator Source of random numbers in the range [0, 1).
 * @returns {SymbolId[]} Randomized symbol row.
 */
function createWeightedSymbolRow(columns, weightedSymbols, randomNumberGenerator) {
  return Array.from(
    { length: columns },
    /**
     * @returns {SymbolId} One generated symbol id.
     */
    () => selectWeightedSymbol(weightedSymbols, randomNumberGenerator)
  );
}

/**
 * Calculates the total probability weight for a symbol table.
 * @param {readonly WeightedSymbolConfig[]} weightedSymbols Weighted symbol table.
 * @returns {number} Sum of all symbol weights.
 */
function getTotalWeight(weightedSymbols) {
  return weightedSymbols.reduce(
    /**
     * @param {number} total Running weight total.
     * @param {WeightedSymbolConfig} symbol Current weighted symbol.
     * @returns {number} Updated weight total.
     */
    (total, symbol) => total + symbol.weight,
    0
  );
}

/**
 * Finds the symbol that owns a target point in the cumulative weight range.
 * @param {readonly WeightedSymbolConfig[]} weightedSymbols Weighted symbol table.
 * @param {number} targetWeight Target value in the range [0, totalWeight).
 * @returns {SymbolId} Matching symbol id.
 * @throws {Error} Throws when no symbol matches the target.
 */
function findSymbolByWeightTarget(weightedSymbols, targetWeight) {
  let cumulativeWeight = 0;

  for (const symbol of weightedSymbols) {
    cumulativeWeight += symbol.weight;

    if (targetWeight < cumulativeWeight) {
      return symbol.id;
    }
  }

  throw new Error("Unable to select a weighted symbol from the provided table.");
}

/**
 * Validates a weighted symbol table before random selection.
 * @param {readonly WeightedSymbolConfig[]} weightedSymbols Weighted symbol table.
 * @returns {void}
 * @throws {Error} Throws when the table is empty or contains invalid entries.
 */
function validateWeightedSymbols(weightedSymbols) {
  if (!Array.isArray(weightedSymbols) || weightedSymbols.length === 0) {
    throw new Error("Weighted symbol table must be a non-empty array.");
  }

  weightedSymbols.forEach(validateWeightedSymbol);
}

/**
 * Validates one weighted symbol entry.
 * @param {WeightedSymbolConfig} symbol Weighted symbol entry.
 * @param {number} index Entry index for error reporting.
 * @returns {void}
 * @throws {Error} Throws when the symbol id, label, or weight is invalid.
 */
function validateWeightedSymbol(symbol, index) {
  if (!symbol || typeof symbol !== "object") {
    throw new Error(`Weighted symbol at index ${index} must be an object.`);
  }

  if (typeof symbol.id !== "string" || symbol.id.length === 0) {
    throw new Error(`Weighted symbol at index ${index} must include an id.`);
  }

  if (typeof symbol.label !== "string" || symbol.label.length === 0) {
    throw new Error(`Weighted symbol ${symbol.id} must include a label.`);
  }

  if (!Number.isFinite(symbol.weight) || symbol.weight <= 0) {
    throw new Error(`Weighted symbol ${symbol.id} must include a positive weight.`);
  }
}

/**
 * Validates a requested grid dimension.
 * @param {number} value Requested dimension value.
 * @param {string} name Dimension name for error reporting.
 * @returns {void}
 * @throws {Error} Throws when the dimension is not a positive integer.
 */
function validatePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

/**
 * Validates an injected random number generator.
 * @param {RandomNumberGenerator} randomNumberGenerator Source of random numbers.
 * @returns {void}
 * @throws {Error} Throws when the random source is not callable.
 */
function validateRandomNumberGenerator(randomNumberGenerator) {
  if (typeof randomNumberGenerator !== "function") {
    throw new Error("Random number generator must be a function.");
  }
}

/**
 * Validates the scaled random target produced by the random number generator.
 * @param {number} targetWeight Random target after scaling by total weight.
 * @param {number} totalWeight Sum of all configured symbol weights.
 * @returns {void}
 * @throws {Error} Throws when the random target is outside the valid range.
 */
function validateRandomTarget(targetWeight, totalWeight) {
  if (!Number.isFinite(targetWeight) || targetWeight < 0 || targetWeight >= totalWeight) {
    throw new Error("Random number generator must return a number from 0 inclusive to 1 exclusive.");
  }
}

export {
  DEFAULT_GRID_SIZE,
  DEFAULT_WEIGHTED_SYMBOLS,
  SYMBOLS,
  createWeightedSymbolGrid,
  selectWeightedSymbol,
  validateWeightedSymbols
};
