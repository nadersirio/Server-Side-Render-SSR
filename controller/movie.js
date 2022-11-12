const { request } = require("express");
const express = require("express");
const serverRoute = express.Router();


const {
  saveDatabase,
  createAccount,
  createPoster,
  getDatabase,
  searchMovie,
  hashCheckDatabase,
  titleCheckDataBase,
  getAllMovies,
  saveMovie,
  editMovie,
  checkPassword,
  checkAccountExist,
  newAccount,
  renderRegisterFeedback,
  getCookie,
  validAccount,
} = require("../model/movie.js");
const { render } = require("../view/movie.js");

serverRoute.get("/", (req, res) => {
  let userLogged = "";
  const userCookie = req.cookies.user;
  if(userCookie) {
    userLogged = "A conta de '" + getCookie(userCookie) + "' esta logado na sessão atual.";
  }
  const listMovies = getAllMovies();
  const formattedHtml = render("/index.html", { listMovies, result: "", userLogged });
  res.send(formattedHtml);
})

serverRoute.post("/search-movie", (req, res) => {
  const param = req.body.searchInput;
  const getMovieHash = searchMovie(param);

  if(getMovieHash) {
    const slug = getMovieHash;
    const movie = getDatabase().poster[slug];
    const formattedHtml = render("/movie.html", { movie, slug });
    return res.send(formattedHtml);
  }
  const poster = getDatabase().poster;
  const listMovies = getAllMovies()
  const formattedHtml = render("/index.html", { listMovies, result: 'O filme "' + param + '" não existe em nossa biblioteca' });
  res.send(formattedHtml);
})

serverRoute.get("/new-movie", (req, res) => {
  const formattedHtml = render("/new-movie.html", { feedback: "" });
  res.send(formattedHtml);
})

serverRoute.post("/new-movie", (req, res) => {
  const newMovie = req.body;

  if(!req.cookies.user) {
    return res.redirect("/register-user");
  }

  const database = getDatabase();
  if(!database.poster) {
    createPoster(database);
  }

  const hashExist = hashCheckDatabase(newMovie);
  const titleExist = titleCheckDataBase(newMovie);
  if(hashExist) {
    if(hashExist.title === titleExist || !titleExist) {
      editMovie(newMovie);
      return res.redirect("/");
    }
    if(!hashExist[titleExist]) {
      const formattedHtml = render("/new-movie.html", { feedback: 'O filme "' + titleExist + '" ja existe em nossa biblioteca.' });
      return res.send(formattedHtml);
    }
  }
  if(titleExist) {
    const formattedHtml = render("/new-movie.html", { feedback: 'O filme "' + newMovie.nameMovie + '" ja exite em nossa biblioteca.'});
    return res.send(formattedHtml);
  }
  saveMovie(newMovie);
  res.redirect("/");
})

serverRoute.get("/movie/:slug", (req, res) => {
  const slug = req.params.slug;
  const movie = getDatabase().poster[slug];
  if (!movie) {
    const formattedHtml = render("/movie-not-found.html", slug);
    return res.status(404).send(formattedHtml);
  }
  const formattedHtml = render("/movie.html", { movie, slug });
  res.send(formattedHtml)
});

serverRoute.get("/new-movie/:slug", (req, res) => {
  const slug = req.params.slug;
  const movie = getDatabase().poster[slug];

  const formattedHtml = render("/edit-movie.html", { ...movie, slug, feedback: "" });
  res.send(formattedHtml);
})

serverRoute.get("/delet-movie/:slug", (req, res) => {
  const slug = req.params.slug;
  const database = getDatabase();
  delete database.poster[slug];
  saveDatabase(database);
  res.redirect("/");
})

serverRoute.get("/movie-not-found", (req, res) => {
  const formattedHtml = render( "/new-movie.html" );
  res.send(formattedHtml);
})

serverRoute.get("/register-user", (req, res) => {
  const formattedHtml = render( "/register-user.html", { feedback: ""} );
  res.send(formattedHtml);
})

serverRoute.post("/register-user", (req, res) => {
  const userData = req.body;

  const database = getDatabase();
  if(!database.accounts) {
    createAccount(database);
  }

  const passwordCheck = checkPassword(userData);
  const accountExist = checkAccountExist(userData);
  if(userData.passwordUser1.length < 4) {
    return res.send(renderRegisterFeedback("Sua senha deve possuir no mínimo 4 caractéres!"));
  }
  if(!accountExist && passwordCheck) {
    const createAccount = newAccount(userData);
    const hashAccount = createAccount;
    return res.cookie('user', hashAccount).redirect("/");
  }
  if(!passwordCheck) {
    return res.send(renderRegisterFeedback("As senhas não coincidem!"));
  }
  res.send(renderRegisterFeedback("Email ja em uso!"));
})

serverRoute.get("/login-user", (req, res) => {
  const formattedHtml = render( "/login-user.html", { feedback: "" });
  res.send(formattedHtml);
})

serverRoute.post("/login-user", (req, res) => {
  const loginData = req.body;
  const validAccountLogin = validAccount(loginData);
  const hashUser = validAccountLogin;
  if(validAccountLogin) {
    return res.cookie('user', hashUser).redirect("/");
  }
  const formattedHtml = render( "/login-user.html", { feedback: "Credenciais incorretas." });
  res.send(formattedHtml);
})

serverRoute.get("/log-out-user", (req, res) => {
  res.clearCookie("user").redirect("/");
})

serverRoute.get("/:name", (req, res) => {
  const name = req.params.name;
  const formattedHtml = render( "/static/"+name );
  res.send(formattedHtml);
})

module.exports = {
  serverRoute,
}