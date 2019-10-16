const { endpointLog, log } = require("./log");
const express = require("express");
const server = express();

const PER_PAGE = 10;

const db = require("./db.json");
const { populars, movies } = db;

server.listen(3000, () => {
  console.log("JSON Server is running on 3000");
});

/**
 * type Movie = {
 *    "id": string,
      "name": string,
      "description": string,
      "thumbnail": string (url),
      "rating": float,
      "ratingBase": integer,
      "reviewsCount": integer,
      "duration": integer (seconds),
      "genres": string[],
      "releasedAt": string (ISO 8601 in UTC time),
    }

    type Review = {
        "id": string,
        "title": string,
        "author": string,
        "score": number | null,
        "content": string; 
    }
 */

/**
 * @api {get} /movies List of movies
 * @apiVersion 1.0.0
 * @apiGroup Movies
 * @apiName getMovies
 * @apiDescription Fetch a paginated list of movies
 * @apiParam {Number} [page = 1] current page in pagination
 * @apiParam {Number} [perPage = 10] items to fetch per page
 * @apiSuccess (200) {Number} page current fetched page
 * @apiSuccess (200) {Number} total total count of items
 * @apiSuccess (200) {Movie[]} movies list of movies
 */
server.get("/movies", (req, res) => {
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

  return res.json({
    page,
    total: movies.length,
    movies: movies.slice(page * perPage - perPage, page * perPage).map(m => {
      // Strip out reviews from movies endpoint
      const { reviews, ...rest } = m;
      return rest;
    })
  });
});

/**
 * @api {get} /movies/:id Movie details
 * @apiVersion 1.0.0
 * @apiGroup Movies
 * @apiName getMovieById
 * @apiDescription Fetch details of a single movie
 * @apiParam {Number} [id] movie id
 * @apiSuccess (200) {Movie} . movie object
 * @apiError (404) {Null} .
 */
server.get("/movies/:id", (req, res) => {
  let { id } = req.params;

  endpointLog("GET", `/movies/${id}`);

  const movie = movies.find(m => m.id === id);

  //   Not found movie
  if (!movie) {
    return res.status(404).send();
  }

  //   Strip out reviews from the movie
  const { reviews, ...restMovie } = movie;

  return res.json(restMovie);
});

/**
 * @api {get} /movies/:id/reviews Reviews of a movie
 * @apiVersion 1.0.0
 * @apiGroup Movies
 * @apiName getMovieReviews
 * @apiDescription Fetch reviews of a movie
 * @apiParam {Number} [id] movie id
 * @apiSuccess (200) {Number} page current fetched page
 * @apiSuccess (200) {Number} total total count of items
 * @apiSuccess (200) {Review[]} list of reviews of a movie
 * @apiError (404) {Null} .
 */
server.get("/movies/:id/reviews", (req, res) => {
  let { page, perPage = PER_PAGE } = req.query;
  let { id } = req.params;
  page = Number(page);

  //   invalid page, return the first page
  if (!page) {
    log(`invalid page, page is reset to 1`);
    page = 1;
  }

  endpointLog("GET", `/movies/${id}/reviews?page=${page}&perPage=${perPage}`);

  const movie = movies.find(m => m.id === id);

  //   Not found movie
  if (!movie) {
    return res.status(404).send();
  }

  const { reviews } = movie;

  const pageCount = Math.ceil(reviews.length / perPage);

  //   pages over the last page, return the last page
  if (page > pageCount) {
    log(`page over the last page, page is reset to the last page ${pageCount}`);
    page = pageCount;
  }

  return res.json({
    page,
    total: reviews.length,
    reviews: reviews.slice(page * perPage - perPage, page * perPage)
  });
});

/**
 * @api {get} /populars/ Popular movies
 * @apiVersion 1.0.0
 * @apiGroup Movies
 * @apiName getPopularMovies
 * @apiDescription Fetch popular movies
 * @apiSuccess (200) {Movie[]} . list of popular movies
 */
server.get("/populars", (req, res) => {
  endpointLog("GET", "/populars");
  return res.json(populars);
});
