const base = require("./mocharc");

module.exports = (dir) => {
  return {
    ...base,
    reporter: "mochawesome",
    reporterOptions: [`reportDir=${dir}`, "reportFilename=index"]
  };
};
