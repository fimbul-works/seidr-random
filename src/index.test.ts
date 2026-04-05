import { type CleanupFunction, hydrate } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { renderToString } from "@fimbul-works/seidr/ssr";
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

  it("should return a number between 0 and 1", () => {
    cleanup = enableClientMode();

    for (let i = 0; i < 1000; i++) {
      const val = random();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }

    cleanup();
  });

  it("should produce different values on subsequent calls in same context", async () => {
    cleanup = enableSSRMode();

    await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      expect(r1).not.toBe(r2);
      return [];
    });

    cleanup();
  });

  it("should produce different values on subsequent calls in different contexts", async () => {
    cleanup = enableSSRMode();

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

    cleanup();
  });

  it("should match values between SSR and hydration when IDs match", async () => {
    // Server render
    cleanup = enableSSRMode();
    let serverResults: number[] = [];

    const { hydrationData } = await renderToString(() => {
      serverResults = [random(), random()];
      return $div({});
    });

    cleanup();

    // Client render
    cleanup = enableClientMode();
    let clientResults: number[] = [];

    hydrate(
      () => {
        clientResults = [random(), random()];
        return $div({});
      },
      document.body,
      hydrationData,
    );

    cleanup();

    expect(clientResults).toEqual(serverResults);
  });
});
