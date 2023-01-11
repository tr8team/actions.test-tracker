module.exports = {
  test: {
    spec: ["tests/integration/**/*.spec.ts"],
  },
  coverage: {
    include: ["src/**/*.[tj]s?(x)"],
    "report-dir": "./coverage/integration",
  },
  outputDir: "test-results/integration",
};
