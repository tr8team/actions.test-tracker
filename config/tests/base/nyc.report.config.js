const nyc = require("./nyc.config");

module.exports = {
  ...nyc,
  "reporter": ["html", "lcov", "json-summary"],
};
