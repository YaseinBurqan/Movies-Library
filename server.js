"use strict";

// Declare Variables:
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const apiKey = "218da8bf22c684d6bae14c5df2c30224";
//const apiUrl = `https:api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
const databaseUrl = `postgres://yaseinburqan:6437@localhost:5432/moviedatabase`;
const { Client } = require("pg");
const client = new Client(databaseUrl);
const moviesData = require("./movie_data/data.json");
const dotenv = require("dotenv");

// Create app:
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 5000;
dotenv.config();

// end points
app.get("/", homeHandler);
app.get("/favorite", favoriteHandler);
app.post("/addMovie", addMovieHandler);
app.put("/updateMovie/:id", updateMovieHandler);
app.get("/trending", trendingPageHandler);
app.get("/getMovie", getHandler);
app.get("/getMovie/:id", getMovieByIdHandler);
app.get("/search/:name", searchMovieByNameHandler);
app.delete("/delete/:id", deleteMovieHandler);
app.get("/image", imageHandler);
app.get("/topRated", topRatedHandler);
app.get("*", errorHandler);

function MoviesLibrary(id, title, releaseDate, posterPath, overview) {
  this.id = id;
  this.title = title;
  this.releaseDate = releaseDate;
  this.posterPath = posterPath;
  this.overview = overview;
}

// end points handling functions

async function homeHandler(req, res) {
  const apiUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`;
  https: await axios
    .get(apiUrl)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function favoriteHandler(req, res) {
  return res.status(200).send("Favorite Page");
}

function addMovieHandler(req, res) {
  let { name, time, summary, image, comment } = req.body;

  let sql = "INSERT INTO movie(name,time,summary,image,comment) VALUES($1, $2, $3, $4, $5) RETURNING *;";
  let values = [name, time, summary, image, comment];
  client
    .query(sql, values)
    .then((result) => {
      return res.status(201).json(result.rows[0]);
    })
    .catch();
}

function updateMovieHandler(req, res) {
  const { name, time, summary, image } = req.body;
  const { id } = req.params;
  let sql = `UPDATE movie SET name=$1, time=$2, summary=$3, image=$4 WHERE id = $5 RETURNING *;`; // sql query
  let values = [name, time, summary, image, id];
  client
    .query(sql, values)
    .then((result) => {
      return res.status(200).json(result.rows);
    })
    .catch((error) => {
      console.log(error);
      res.send("Inside catch");
    });
}

function trendingPageHandler(req, res) {
  const apiUrl = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;

  axios;
  axios
    .get(apiUrl)
    .then((value) => {
      let trendingMovies = value.data.results.map((movie) => {
        return new MoviesLibrary(movie.id, movie.title, movie.releaseDate, movie.posterPath, movie.overview);
      });
      return res.status(200).json(trendingMovies);
    })
    .catch((error) => {
      console.log(error);
      res.send("Inside catch");
    });
}

function getHandler(req, res) {
  let sql = "SELECT * from movie;";
  client
    .query(sql)
    .then((result) => {
      res.json(result.rows);
    })
    .catch();
}

function getMovieByIdHandler(req, res) {
  let id = req.params.id;
  let sql = `SELECT * FROM movie WHERE id=${id};`;

  client
    .query(sql)
    .then((result) => {
      res.status(200).json(result.rows);
    })
    .catch();
}

function searchMovieByNameHandler(req, res) {
  let movieName = req.query.movieName;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieName}&page=2`;
  // axios.get().then().catch()
  axios
    .get(url)
    .then((result) => {
      // console.log(result.data.results);
      res.json(result.data.results);
    })
    .catch((error) => {
      console.log(error);
      res.send("Searching for data");
    });
}

function deleteMovieHandler(req, res) {
  const id = req.query.id;
  let sql = "DELETE FROM movie WHERE id=$1;";
  let value = [id];
  client
    .query(sql, value)
    .then((result) => {
      console.log(result);
      res.send("deleted");
    })
    .catch();
}

function imageHandler(req, res) {
  let movieId = req.query.movieId;
  let url = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}`;
  axios
    .get(url)
    .then((result) => {
      res.json(result.data);
    })
    .catch((error) => {
      console.log(error);
      res.send("Error searching");
    });
}

function topRatedHandler(req, res) {
  let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`;
  axios
    .get(url)
    .then((result) => {
      res.json(result.data.results);
    })
    .catch((error) => {
      console.log(error);
      res.send("Searching for data");
    });
}

function errorHandler(req, res) {
  return res.status(404).send("Error : page not found");
}

// after connection to db, start the server
client.connect().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening ${port}`);
  });
});
