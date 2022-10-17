const jetpack = require("fs-jetpack");
const express = require("express");
const Eta = require('eta');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const { res } = require("express");
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser())

function render(htmlPath, values = {}) {
  const html = jetpack.read(__dirname+htmlPath);
  return Eta.render(html, values);
}

server.get("/", (req, res) => {
  const listagem = getAllMovies();
  const formattedHtml = render("/view/index.html", { listagem, result: "" })
  res.send(formattedHtml);
})

server.post("/search", (req, res) => {
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

server.get("/movie/new", (req, res) => {
  const formattedHtml = render("/view/newMovie.html", "");
  res.send(formattedHtml);
})

server.post("/movie/new", (req, res) => {
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

server.get("/movie/:slug", (req, res) => {
  const filme = getMovieById(req.params.slug);

  if (!filme) {
    const formattedHtml = render("/view/movieNotFound.html", slug)
    res.status(404).send(formattedHtml);
  } else {
    const formattedHtml = render("/view/movie.html", { ...filme, slug })
    res.send(formattedHtml)
  }
});

server.get("/movie/:slug/edit", (req, res) => {
  const filme = getMovieById(req.params.slug)
  const formattedHtml = render("/view/editMovie.html", { ...filme, slug, feedback: "" });
  res.send(formattedHtml);
})

server.get("/movie/:slug/delete", (req, res) => {
  const slug = req.params.slug;
  const database = JSON.parse(jetpack.read('./database.json'));

  delete database.cartaz[slug];
  jetpack.write("./database.json", database);
  res.redirect("/");
})

server.get("/movie-not-found", (req, res) => {
  const formattedHtml = render("/view/newMovie.html")
  res.send(formattedHtml);
})

function saveMovie(movie) {
  const database = JSON.parse(jetpack.read("./database.json"));
  database.cartaz[movie.idMovie] = {
    title: movie.nameMovie,
    url: movie.imageMovie,
    release: movie.ageMovie,
    id: movie.idMovie,
  }
  jetpack.write("./database.json", database);
}

function createMovie(movie) {
  const id = uuidv4();
  const database = JSON.parse(jetpack.read("./database.json"));
  database.cartaz[id] = {
    title: movie.nameMovie,
    url: movie.imageMovie,
    release: movie.ageMovie,
    id,
  }
  jetpack.write("./database.json", database);
} 

function renderExistMovie() {
  return render("/view/newMovie.html", 'O filme "' + movie.nameMovie + '" ja existe em nossa biblioteca.')
}

function searchMovieHash(param) {
  const database = JSON.parse(jetpack.read("./database.json"));
  for (let filme in database.cartaz) {
    if (database.cartaz[filme].title.toLowerCase() == param.toLowerCase()) {
      return filme;
    }
  }
}

function getAllMovies() {
  const database = JSON.parse(jetpack.read("./database.json"));
  const cartaz = database.cartaz;

  const movies = []
  for (slug in cartaz) {
    const movie = cartaz[slug];
    movies.push({ ...movie, slug });
  }
  return movies;
}

function getMovieByName(name) {
  const database = JSON.parse(jetpack.read("./database.json"));
  for(let hash in database.cartaz) {
    if (database.cartaz[hash].title.toLowerCase() === name.toLowerCase()) {
      return database.cartaz[hash]
    }
  }
  return null;
}

function getMovieById(idMovie) {
  const database = JSON.parse(jetpack.read("./database.json"));
  return database.cartaz[idMovie];
}

server.listen(3000, () => {
  console.log("server up", __dirname)
});