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
      include: ["src/**/*.[tj]s?(x)"],
      provider: "istanbul",
      reporter: ["text"]
    }
  }
});
