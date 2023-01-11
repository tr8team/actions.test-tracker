const mocha = require("../base/mocharc.js");
const {test} = require("./base");

module.exports = {
  ...mocha,
  ...test,
};
