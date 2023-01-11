const nyc = require("../base/nyc.report.config");
const { coverage } = require("./base");

module.exports = {
  ...nyc,
  ...coverage,
};
