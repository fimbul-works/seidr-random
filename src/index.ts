import { getAppState, getRootComponent, isClient, isHydrating } from "@fimbul-works/seidr";
import { ALEA_M, DATA_KEY_RANDOM, FRAC, LCG_M } from "./constant";

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
  const state = getAppState();
  let rngState = state.getData<[number, number, number, number]>(DATA_KEY_RANDOM);

  // Initialize state if not present
  if (!rngState) {
    const seed =
      (isClient() && !isHydrating()
        ? Date.now()
        : (state.ctxID * 43 + (getRootComponent()?.numericId || ALEA_M)) ^ LCG_M) >>> 0;
    const s0 = (seed * LCG_M + 1) >>> 0;
    const s1 = (s0 * LCG_M + 1) >>> 0;
    const s2 = (s1 * LCG_M + 1) >>> 0;
    rngState = [s0 * FRAC, s1 * FRAC, s2 * FRAC, 1];
  }

  // Generate next number using the stored state
  let [r0, r1, r2, i] = rngState;
  const t = ALEA_M * r0 + i * FRAC;
  r0 = r1;
  r1 = r2;
  i = t | 0;
  r2 = t - i;

  // Save the state back to context
  state.setData(DATA_KEY_RANDOM, [r0, r1, r2, i]);

  return r2;
};
