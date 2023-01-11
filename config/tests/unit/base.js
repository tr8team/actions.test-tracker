module.exports = {
  test: {
    spec: ["tests/unit/**/*.spec.ts"],
  },
  coverage: {
    include: ["src/lib/**/*.[tj]s?(x)"],
    "report-dir": "./coverage/unit",
  },
  outputDir: "test-results/unit",
};
