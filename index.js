const express = require("express");
const cookieParser = require('cookie-parser');
const server = express();

const { serverRoute } = require("./controller/movie.js");
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser())
server.use(serverRoute);
//server.use('/favicon.ico', express.static('images/favicon.ico'));

server.listen(3000, () => {
});