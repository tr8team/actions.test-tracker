const coverage = require("./coverage.json");
// const typescript = require("@istanbuljs/nyc-config-typescript")

module.exports = {
  ...coverage.goal,
  extends: "@istanbuljs/nyc-config-typescript",
  "check-coverage": true,
  "all": true,
};
