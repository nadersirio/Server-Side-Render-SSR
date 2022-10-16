const jetpack = require("fs-jetpack");
const express = require("express");
const Eta = require('eta');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const { res } = require("express");
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser())

server.get("/", (req, res) => {
  const html = jetpack.read(__dirname+"/view/index.html");
  const database = JSON.parse(jetpack.read("./database.json"));
  const cartaz = database.cartaz;
  let result = "";

  const listagem = []
  for (slug in cartaz) {
  const filme = cartaz[slug];
  listagem.push({ ...filme, slug });
  }
  const formattedHtml = Eta.render(html, { listagem, result });
  res.send(formattedHtml);
})

server.post("/search", (req, res) => {
  const html = jetpack.read(__dirname+"/view/movie.html");
  const htmlHomePage = jetpack.read(__dirname+"/view/index.html");
  const database = JSON.parse(jetpack.read("./database.json"));
  const param = req.body.searchInput;

  let callMovie = searchMovie(param, database);

  if(callMovie) {
    const hash = callMovie;
    const filme = database.cartaz[hash];

    const formattedHtml = Eta.render( html, filme );
    res.send(formattedHtml);
  } else {
    const cartaz = database.cartaz;
    const listagem = []
    for (slug in cartaz) {
    const filme = cartaz[slug];
    listagem.push({ ...filme, slug });
    }

    var result = 'O filme "' + param + '" não existe em nossa biblioteca';
    const formattedHtml = Eta.render( htmlHomePage, { listagem, result });
    res.send(formattedHtml);
  }
})

server.get("/newMovie", (req, res) => {
  const html = jetpack.read(__dirname+"/view/newMovie.html");
  const feedback = "";
  const formattedHtml = Eta.render( html, feedback);
  res.send(formattedHtml);
})

server.post("/newMovie", (req, res) => {
  const html = jetpack.read(__dirname+"/view/newMovie.html");
  const database = JSON.parse(jetpack.read("./database.json"));
  const movie = req.body;

  let feedback = titleCheckDataBase(database, movie);

  if(database.cartaz[movie.idMovie]) {
    if(feedback) {
      if(feedback === true) {
        database.cartaz[movie.idMovie] = {
          title: movie.nameMovie,
          url: movie.imageMovie,
          release: movie.ageMovie,
          id: movie.idMovie,
        }
        jetpack.write("./database.json", database);
        res.redirect("/")
      } else {
        feedback = 'O filme "' + movie.nameMovie + '" ja existe em nossa biblioteca.';
        const formattedHtml = Eta.render( html, feedback);
        res.send(formattedHtml);
      }
    } else {
      database.cartaz[movie.idMovie] = {
        title: movie.nameMovie,
        url: movie.imageMovie,
        release: movie.ageMovie,
        id: movie.idMovie,
      }
      jetpack.write("./database.json", database);
      res.redirect("/")
  }
  } else if(feedback) {
    feedback = 'O filme "' + feedback + '" ja existe em nossa biblioteca.';
    const formattedHtml = Eta.render( html, feedback);
    res.send(formattedHtml);
  } else {
  req.body.idMovie = uuidv4();
  const id = req.body.idMovie;
  const databaseMovie = database.cartaz[id] || {}
  database.cartaz[id] = {
    ...databaseMovie,
    title: movie.nameMovie,
    url: movie.imageMovie,
    release: movie.ageMovie,
    id,
  }
  jetpack.write("./database.json", database);

  res.redirect("/");
}
})

server.get("/movie/:slug", (req, res) => {
  const database = JSON.parse(jetpack.read("./database.json"));
  const html = jetpack.read(__dirname+"/view/movie.html");
  const slug = req.params.slug;
  const filme = database.cartaz[slug];

  if (!filme) {
    const htmlNotFound = jetpack.read(__dirname+"/view/movieNotFound.html");
    const formattedHtml = Eta.render(htmlNotFound, slug)
    res.status(404).send(formattedHtml);
  } else if (req.headers.accept === "application/json") {
    res.json({ ...filme, slug });
  } else {
    const formattedHtml = Eta.render(html, { ...filme, slug });
    res.send(formattedHtml)
  }
});

server.get("/newMovie/:slug", (req, res) => {
  const slug = req.params.slug;
  const database = JSON.parse(jetpack.read('./database.json'));
  const filme = database.cartaz[slug];
  const html = jetpack.read(__dirname+"/view/editMovie.html");
  let feedback = "";
  const formattedHtml = Eta.render( html, { ...filme, slug, feedback });

  res.send(formattedHtml);
})

server.get("/movieDelete/:slug", (req, res) => {
  const slug = req.params.slug;
  const database = JSON.parse(jetpack.read('./database.json'));

  delete database.cartaz[slug];
  jetpack.write("./database.json", database);
  res.redirect("/");
})

server.get("/movieNotFound", (req, res) => {
  const html = jetpack.read(__dirname+"/view/newMovie.html");
  const formattedHtml = Eta.render( html );
  res.send(formattedHtml);
})

function searchMovie(param, database) {
  for (let filme in database.cartaz) {
    if(database.cartaz[filme].title.toLowerCase() == param.toLowerCase()) {
      return filme;
    }
  }
}

function titleCheckDataBase(database, movie) {
  for(let filme in database.cartaz) {
    if(database.cartaz[filme].title.toLowerCase() === movie.nameMovie.toLowerCase()) {
      if(filme === movie.idMovie) {
        return true;
      } else {
        return database.cartaz[filme].title
      };
    }
  }
}

server.listen(3000, () => {
});