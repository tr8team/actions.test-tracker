const base = require("./mocharc");

module.exports = (dir) => {
  return {
    ...base,
    reporter: "json",
    "reporter-option": [`output=${dir}/mocha-report.json`]
  };
};
