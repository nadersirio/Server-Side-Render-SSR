const jetpack = require("fs-jetpack");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const tokenPassword = '1309';

const databaseDIR = "./database.json";
function getDatabase() {
  return JSON.parse(jetpack.read(databaseDIR))
}

function saveDatabase(database) {
  return jetpack.write(databaseDIR, database);
}

function createAccount(database) {
  database.accounts = {}
  return saveDatabase(database);
}

function createPoster(database) {
  database.poster = {}
  return saveDatabase(database);
}

function getCookie(userCookie) {
  const database = getDatabase();
  for (let account in database.accounts) {
    if(userCookie == account) {
      let userEmailDecoded = false;
      jwt.verify(database.accounts[account].user, tokenPassword, function(err, decoded) {
        userEmailDecoded = decoded.email;
      });
      return userEmailDecoded;
    }
  }
}

function searchMovie(param) {
  const database = getDatabase();
  for (let movieHash in database.poster) {
    if(database.poster[movieHash].title.toLowerCase() == param.toLowerCase()) {
      return movieHash;
    }
  }
}

function titleCheckDataBase(newMovie) {
  const database = getDatabase();
  for(let movie in database.poster) {
    if(database.poster[movie].title.toLowerCase() === newMovie.title.toLowerCase()) {
      return database.poster[movie].title;
    }
  }
}

function getAllMovies() {
  const cartaz = getDatabase().poster;

  const movies = []
  for (slug in cartaz) {
    const movie = cartaz[slug];
    movies.push({ ...movie, slug });
  }
  return movies;
}

function saveMovie(newMovie) {
  const id = uuidv4();
  const database = getDatabase() || {}

  const movie = {
    title: newMovie.title,
    url: newMovie.url,
    release: newMovie.release,
  };

  database.poster[id] = movie; 
  saveDatabase(database);

  return { ...movie, id };
}

function editMovie(newMovie){
  const database = getDatabase();
  const currentPoster = database.poster[newMovie.idMovie] = {}

  database.poster[newMovie.idMovie] = {
    ...currentPoster,
    title: newMovie.nameMovie,
    url: newMovie.imageMovie,
    release: newMovie.ageMovie,
  }
  return saveDatabase(database);
}

function checkPassword(userData) {
  return userData.passwordUser1 === userData.passwordUser2;
}

function checkAccountExist(userData) {
  let userEmailDecoded = false;
  const database = getDatabase();
  for (let account in database.accounts) {
    jwt.verify(database.accounts[account].user, tokenPassword, function(err, decoded) {
      userEmailDecoded = decoded.email;
    });
    return userEmailDecoded === userData.emailUser
  }
}

function newAccount(userData) {
  const token = jwt.sign({ email: userData.emailUser, password: userData.passwordUser2 }, tokenPassword);
  const hash = uuidv4();

  const database = getDatabase() || {};
  const currentAccount = database.accounts[hash] || {}

  database.accounts[hash] = {
    ...currentAccount,
    user: token,
  }
  saveDatabase(database);
  return hash;
}

function validAccount(loginData) {
  const database = getDatabase();
  for (let account in database.accounts) {
    let email = false;
    let password = false;
    jwt.verify(database.accounts[account].user, tokenPassword, function(err, decoded) {
      password = validPasswordLog(decoded.password, loginData.password);
      email = validEmailLog(decoded.email, loginData.email);
    });
    if (email && password === true) {
      return account;
    }
  }
}

function validEmailLog(email, loginData){
  return email === loginData;
}

function validPasswordLog(password, loginData){
  return password === loginData;
}

module.exports = {
  saveDatabase,
  createAccount,
  createPoster,
  getDatabase,
  searchMovie,
  titleCheckDataBase,
  getAllMovies,
  saveMovie,
  editMovie,
  checkPassword,
  checkAccountExist,
  newAccount,
  getCookie,
  validAccount,
}