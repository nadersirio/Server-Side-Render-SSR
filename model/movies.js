const jetpack = require("fs-jetpack");
const { v4: uuidv4 } = require('uuid');

const DATABASE_DIR = "../database.json";
function getDatabase() {
  return JSON.parse(jetpack.read(DATABASE_DIR));
}

function saveDatabase(database) {
  jetpack.write(DATABASE_DIR, database);
}

function getAllMovies() {
  const cartaz = getDatabase().cartaz;

  const movies = []
  for (slug in cartaz) {
    const movie = cartaz[slug];
    movies.push({ ...movie, slug });
  }
  return movies;
}

function searchMovieHash(param) {
  const database = getDatabase();
  for (let filme in database.cartaz) {
    if (database.cartaz[filme].title.toLowerCase() == param.toLowerCase()) {
      return filme;
    }
  }
}

function getMovieByName(name) {
  const database = getDatabase();
  for(let hash in database.cartaz) {
    if (database.cartaz[hash].title.toLowerCase() === name.toLowerCase()) {
      return database.cartaz[hash]
    }
  }
  return null;
}

function getMovieById(idMovie) {
  return getDatabase().cartaz[idMovie];
}

function saveMovie(movie) {
  const database = getDatabase();
  database.cartaz[movie.idMovie] = {
    title: movie.nameMovie,
    url: movie.imageMovie,
    release: movie.ageMovie,
    id: movie.idMovie,
  }
  saveDatabase(database)
}

function createMovie(movie) {
  const id = uuidv4();
  const database = getDatabase();
  database.cartaz[id] = {
    title: movie.nameMovie,
    url: movie.imageMovie,
    release: movie.ageMovie,
    id,
  }
  saveDatabase(database)
} 

function deleteMovie(movieId) {
  const database = getDatabase();
  delete database.cartaz[movieId];
  saveDatabase(database)
}


module.exports = {
  getAllMovies,
  saveMovie,
  createMovie,
  getMovieById,
  getMovieByName,
  searchMovieHash,
  deleteMovie,
}