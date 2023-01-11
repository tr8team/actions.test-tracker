const nyc = require("../base/nyc.cli.config");
const { coverage } = require("./base");

module.exports = {
  ...nyc,
  ...coverage,
};
