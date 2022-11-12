const jetpack = require("fs-jetpack");
const Eta = require('eta');

function render(htmlpath, value = {}) {
  const html = jetpack.read(__dirname+htmlpath);
  return Eta.render(html, value);
}

module.exports = {
  render,
}