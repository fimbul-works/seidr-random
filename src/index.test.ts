import type { CleanupFunction } from "@fimbul-works/seidr";
import {
  enableClientMode,
  enableSSRMode,
  getAppState,
  resetNextId,
  resetRequestIdCounter,
  runWithAppState,
  setupAppState,
} from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DATA_KEY_RANDOM } from "./constant";
import { random } from "./index";

describe("random", () => {
  let cleanup: CleanupFunction;
  const deleteRandomData = () => getAppState().deleteData(DATA_KEY_RANDOM);

  beforeEach(() => {
    setupAppState();
    resetRequestIdCounter();
  });

  afterEach(() => {
    cleanup();
    deleteRandomData();
    resetNextId();
  });

  it("should return a number between 0 and 1", async () => {
    cleanup = enableClientMode();
    const val = random();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
    cleanup();
  });

  it("should produce different values on subsequent calls in same context", async () => {
    enableSSRMode();

    await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      expect(r1).not.toBe(r2);
      return [];
    });

    enableClientMode();
  });

  it("should produce different values on subsequent calls in different contexts", async () => {
    enableSSRMode();

    const results1 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    const results2 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    expect(results1).not.toEqual(results2);

    enableClientMode();
  });

  it("should match values between SSR and hydration when IDs match", async () => {
    resetRequestIdCounter();
    // 1. "Server" render
    enableSSRMode();
    const serverValues = await runWithAppState(async () => {
      return [random(), random()];
    });
    enableClientMode();

    resetRequestIdCounter();
    deleteRandomData();

    const clientValues = [random(), random()];

    expect(clientValues).toEqual(serverValues);
  });
});
