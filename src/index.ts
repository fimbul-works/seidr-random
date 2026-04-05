import { getAppState, isClient, isHydrating, useScope } from "@fimbul-works/seidr";
import { DATA_KEY_RANDOM } from "./constant.js";

/** 2^-32 - the smallest possible decimal number (1 / 4294967296) */
const FRAC = 2 ** -32;

/** Linear Congruential Generator constant for state initialization */
const LCG_M = 4022871197;

/** Multiplier for the Alea generation step */
const ALEA_M = 2091639;

/**
 * Deterministic random number generator for Seidr using the Alea algorithm.
 *
 * This function maintains state within the current AppState to provide
 * a sequence of high-entropy pseudo-random numbers that is deterministic
 * across the SSR/Hydration boundary.
 *
 * Original work copyright © 2010 Johannes Baagøe, under MIT license.
 *
 * @returns {number} A random float between 0 and 1
 */
export const random = (): number => {
  const appState = getAppState();
  let rngState = appState.getData<Map<number, [number, number, number, number]>>(DATA_KEY_RANDOM);

  // Initialize RNG state if not present
  if (!rngState) {
    rngState = new Map<number, [number, number, number, number]>();
    appState.setData(DATA_KEY_RANDOM, rngState);
  }

  // Get component ID
  let componentId: number = isClient() && !isHydrating() ? Date.now() : ALEA_M;
  try {
    const scope = useScope();
    componentId = scope.numericId;
    scope.onUnmount(() => rngState.delete(componentId));
  } catch {
    // useScope() throws outside component hierarchy — use fallback seed
  }

  // Seed component RNG state
  if (!rngState.has(componentId)) {
    const seed = ((appState.ctxID + componentId) ^ LCG_M) >>> 0;
    const s0 = (seed * LCG_M + 1) >>> 0;
    const s1 = (s0 * LCG_M + 1) >>> 0;
    const s2 = (s1 * LCG_M + 1) >>> 0;
    rngState.set(componentId, [s0 * FRAC, s1 * FRAC, s2 * FRAC, 1]);
  }

  // Generate next number using the stored state
  let [r0, r1, r2, i] = rngState.get(componentId)!;
  const t = ALEA_M * r0 + i * FRAC;
  r0 = r1;
  r1 = r2;
  i = t | 0;
  r2 = t - i;

  // Save component RNG state
  rngState.set(componentId, [r0, r1, r2, i]);

  return r2;
};
