const { request } = require("express");
const express = require("express");
const movieRouter = express.Router();

const {
  createPoster,
  getDatabase,
  searchMovie,
  titleCheckDataBase,
  getAllMovies,
  saveMovie,
} = require("../model/movie.js");

movieRouter.get("/movies", (req, res) => {
  const listMovies = getAllMovies();
  res.json(listMovies);
});

movieRouter.get("/movies/:search", (req, res) => {
  const search = req.params.search;
  const getMovieHash = searchMovie(search);

  if (getMovieHash) {
    const slug = getMovieHash;
    const movie = getDatabase().poster[slug];
    return res.json({ movie, slug});
  }

  res.status(404).json({});
});

movieRouter.post("/movies", (req, res) => {
  const newMovie = req.body;

  if(!req.cookies.user) {
    return res.status(401).json({});
  }

  const database = getDatabase();
  if(!database.poster) {
    createPoster(database);
  }

  const titleExist = titleCheckDataBase(newMovie);
  if(titleExist) {
    return res.status(400).json({
      error: 'title exists'
    });
  }

  const createdMovie = saveMovie(newMovie);
  res.setHeader('id', createdMovie.slug);
  res.status(201).json(createdMovie);
});

module.exports = {
  movieRouter,
}