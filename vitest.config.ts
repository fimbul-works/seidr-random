import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/test-setup/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
