const express = require("express");
const movieRouter = express.Router();

const {
  getAllMovies,
  saveMovie,
  createMovie,
  getMovieById,
  getMovieByName,
  searchMovieHash,
  deleteMovie
} = require("./model/movies.js");
const { renderExistMovie, render } = require("./view/index.js");

movieRouter.get("/", (req, res) => {
  const listagem = getAllMovies();
  const formattedHtml = render("/view/index.html", { listagem, result: "" })
  res.send(formattedHtml);
})

movieRouter.post("/search", (req, res) => {
  const param = req.body.searchInput;

  const callMovieHash = searchMovieHash(param);
  if(callMovieHash) {
    const filme = getMovieById(callMovieHash);

    const formattedHtml = render("/view/movie.html", filme);
    res.send(formattedHtml);
  } else {
    const listagem = getAllMovies();

    const formattedHtml = render("/view/index.html", { 
      listagem, 
      result: 'O filme "' + param + '" não existe em nossa biblioteca' 
    });
    res.send(formattedHtml);
  }
})

movieRouter.get("/movie/new", (req, res) => {
  const formattedHtml = render("/view/newMovie.html", "");
  res.send(formattedHtml);
})

movieRouter.post("/movie/new", (req, res) => {
  const movie = req.body;

  const savedMovie = getMovieByName(movie.nameMovie)
  if (savedMovie && savedMovie.id != movie.idMovie) {
    res.send(renderExistMovie());
    return;
  }

  const toEditMovie = getMovieById(movie.idMovie);
  if (toEditMovie) {
    saveMovie(movie)
    res.redirect("/")
  } else {
    createMovie(movie);
    res.redirect("/");
  }
})

movieRouter.get("/movie/:slug", (req, res) => {
  const filme = getMovieById(req.params.slug);

  if (!filme) {
    const formattedHtml = render("/view/movieNotFound.html", slug)
    res.status(404).send(formattedHtml);
  } else {
    const formattedHtml = render("/view/movie.html", { ...filme, slug })
    res.send(formattedHtml)
  }
});

movieRouter.get("/movie/:slug/edit", (req, res) => {
  const filme = getMovieById(req.params.slug)
  const formattedHtml = render("/view/editMovie.html", { ...filme, slug, feedback: "" });
  res.send(formattedHtml);
})

movieRouter.get("/movie/:slug/delete", (req, res) => {
  const slug = req.params.slug;
  deleteMovie(slug)
  res.redirect("/");
})

movieRouter.get("/movie-not-found", (req, res) => {
  const formattedHtml = render("/view/newMovie.html")
  res.send(formattedHtml);
})

module.exports = { 
  movieRouter
}