const nyc = require("./nyc.config");

module.exports = {
  ...nyc,
  "reporter": ["text", "text-summary"],
};
