import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Integration Test",
    dir: "tests/integration",
    include: ["**/*.spec.ts"],
    reporters: ["html", "json"],
    testTimeout: 30000,
    outputFile: {
      html: "test-results/int/html/index.html",
      json: "test-results/int/result.json"
    },
    coverage: {
      all: true,
      include: ["src/**/*.?([mc])[tj]s?(x)"],
      exclude: ["**/interface/*.*"],
      provider: "istanbul",
      reporter: ["html", "json-summary"],
      reportsDirectory: "./test-results/int/coverage"
    }
  }
});
