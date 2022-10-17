const express = require("express");
const cookieParser = require('cookie-parser');
const server = express();

const { movieRouter } = require('./controller/movie.js');

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser())
server.use(movieRouter);

server.listen(3000, () => {
  console.log("server up", __dirname)
});