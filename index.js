const express = require("express");
const cookieParser = require('cookie-parser');
const server = express();

const { movieRouter } = require("./controller/movie.js");
server.use(express.json());
server.use(cookieParser())
server.use(movieRouter);

server.listen(3000, () => {
});