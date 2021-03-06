const express = require("express");
const serverlessHTTP = require("serverless-http");
const cors = require("cors");
const { endpointLog, log } = require("../log");
const db = require("../db.json");

const server = express();
const apiRouter = express.Router();

const PER_PAGE = 10;

const { populars, movies } = db;

apiRouter.get("/", (_, res) => {
  res.send(
    "Nothing on this endpoint! Checkout docs: https://movies-mock-api.netlify.app/"
  );
});

apiRouter.get("/movies", (req, res) => {
  let { page, perPage = PER_PAGE } = req.query;

  endpointLog("GET", `/movies?page=${page}&perPage=${perPage}`);

  const pageCount = Math.ceil(movies.length / perPage);
  page = Number(page);

  //   invalid page, return the first page
  if (!page) {
    log(`invalid page, page is reset to 1`);
    page = 1;
  }

  //   pages over the last page, return the last page
  if (page > pageCount) {
    log(`page over the last page, page is reset to the last page ${pageCount}`);
    page = pageCount;
  }

  return responseDecorator(res).json({
    page,
    total: movies.length,
    movies: movies.slice(page * perPage - perPage, page * perPage).map((m) => {
      // Strip out reviews from movies endpoint
      const { reviews, ...rest } = m;
      return rest;
    }),
  });
});

apiRouter.get("/movies/:id", (req, res) => {
  let { id } = req.params;

  endpointLog("GET", `/movies/${id}`);

  const movie = movies.find((m) => m.id === id);

  //   Not found movie
  if (!movie) {
    return responseDecorator(res).status(404).send();
  }

  //   Strip out reviews from the movie
  const { reviews, ...restMovie } = movie;

  return responseDecorator(res).json(restMovie);
});

apiRouter.get("/movies/:id/reviews", (req, res) => {
  let { page, perPage = PER_PAGE } = req.query;
  let { id } = req.params;
  page = Number(page);

  //   invalid page, return the first page
  if (!page) {
    log(`invalid page, page is reset to 1`);
    page = 1;
  }

  endpointLog("GET", `/movies/${id}/reviews?page=${page}&perPage=${perPage}`);

  const movie = movies.find((m) => m.id === id);

  //   Not found movie
  if (!movie) {
    return responseDecorator(res).status(404).send();
  }

  const { reviews } = movie;

  const pageCount = Math.ceil(reviews.length / perPage);

  //   pages over the last page, return the last page
  if (page > pageCount) {
    log(`page over the last page, page is reset to the last page ${pageCount}`);
    page = pageCount;
  }

  return responseDecorator(res).json({
    page,
    total: reviews.length,
    reviews: reviews.slice(page * perPage - perPage, page * perPage),
  });
});

apiRouter.get("/populars", (_, res) => {
  endpointLog("GET", "/populars");
  return responseDecorator(res).json(populars);
});

server.use(cors());
server.use("/.netlify/functions/api", apiRouter);
server.set("etag", false);

// No idea why a middleware didn't work!
function responseDecorator(res) {
  // new Date().toISOString()
  res.setHeader("x-last-modified", "Sat, 5 Sep 2020 19:40:00 GMT");
  // Disable caching
  res.set("Cache-Control", "no-store");
  return res;
}

module.exports.handler = serverlessHTTP(server);
