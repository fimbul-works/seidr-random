/** AppState key for storing random number generator state */
export const DATA_KEY_RANDOM = "seidr.random";

/** 2^-32 - the smallest possible decimal number (1 / 4294967296) */
export const FRAC = 2 ** -32;

/** Linear Congruential Generator constant for state initialization */
export const LCG_M = 4022871197;

/** Multiplier for the Alea generation step */
export const ALEA_M = 2091639;
