const json = require("../base/mocharc.json.js");
const { test, outputDir } = require("./base");

module.exports = {
  ...test,
  ...json(outputDir)
};
