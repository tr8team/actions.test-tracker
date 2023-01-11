const html = require("../base/mocharc.html");
const { test, outputDir } = require("./base")

module.exports = {
  ...test,
  ...html(outputDir),
};
