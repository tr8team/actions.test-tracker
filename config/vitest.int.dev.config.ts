import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Integration Test",
    dir: "tests/integration",
    include: ["**/*.spec.ts"],
    reporters: ["default"],
    testTimeout: 30000,
    coverage: {
      all: true,
      include: ["src/**/*.?([mc])[tj]s?(x)"],
      exclude: ["**/interface/*.*"],
      provider: "istanbul",
      reporter: ["text"]
    }
  }
});
