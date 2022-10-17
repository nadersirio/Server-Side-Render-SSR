const jetpack = require("fs-jetpack");
const Eta = require('eta');

function render(htmlPath, values = {}) {
  const html = jetpack.read(__dirname+htmlPath);
  return Eta.render(html, values);
}

function renderExistMovie() {
  return render("/view/newMovie.html", 'O filme "' + movie.nameMovie + '" ja existe em nossa biblioteca.')
}

module.exports = {
  renderExistMovie,
  render
}