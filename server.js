'use strict';

// DOTENV (read our environment variable)
require('dotenv').config();

// Application Dependencies
const express = require('express');

//CORS = Cross Origin Resource Sharing
const cors = require('cors');

// client-side HTTP request library
const superAgent = require('superagent');

// pg library
const pg = require('pg');

// yelp library





// Application Setup
const PORT = process.env.PORT || 4000;
const server = express();
server.use(cors());

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
  // , ssl: { rejectUnauthorized: false }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Routes:

server.get('/', homeRouteHandler); // home
server.get('/location', locationHandler); // location
server.get('/weather', weatherHandler); // weather
server.get('/parks', parksHandler); // parks
server.get('/movies', moviesHandler); // movies
server.get('/yelp', yelpHandler); // yelp
server.get('*', notFoundHandler); // error

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Routes Handles:

function homeRouteHandler(req, res) { // home
  res.send('Your server is working');
}

function locationHandler(req, res) { // location DB
  let GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
  let cityName = req.query.city;
  let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`;
  let SQL = `SELECT * FROM locations WHERE search_query=$1`;
  client.query(SQL, [cityName])
    .then(geoData => {
      if (geoData.rowCount > 0) {
        res.send(geoData.rows[0]);
      }
      else {
        superAgent.get(locationURL)
          .then(getData => {
            let gotData = getData.body;
            let locationData = new Location(cityName, gotData);
            let search_query = cityName;
            let formatted_query = gotData[0].display_name;
            let latitude = gotData[0].lat;
            let longitude = gotData[0].lon;

            let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
            let safeValues = [search_query, formatted_query, latitude, longitude];
            client.query(SQL, safeValues);
            res.send(locationData)
              .catch(error => {
                res.send(error);
              });
          })
          .catch(error => {
            res.send(error);
          });

      }

    });
}

function weatherHandler(req, res) { // weather
  let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  let cityName = req.query.search_query;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${WEATHER_API_KEY}`;
  superAgent.get(weatherURL)
    .then((getData) => {
      let gotData = getData.body.data.map((item) => {
        return new Weather(item);
      });
      res.send(gotData);
    })
    .catch(error => {
      res.send(error);
    });
}

function parksHandler(req, res) { // parks
  let PARKS_API_KEY = process.env.PARKS_API_KEY;
  let cityName = req.query.search_query;
  let parksURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${PARKS_API_KEY}`;
  superAgent.get(parksURL)
    .then(getData => {
      let parksData = getData.body.data;
      let gotData = parksData.map((items) => {
        return new Park(items);
      });
      res.send(gotData);
    })
    .catch(error => {
      res.send(error);
    });
}

function moviesHandler(req, res) { // movies
  let MOVIE_API_KEY = process.env.MOVIE_API_KEY;
  let cityName = req.query.search_query;
  let movieURL = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${cityName}`;
  superAgent.get(movieURL)
    .then(getData => {
      let moviesData = getData.body;
      // console.log(getData.body.results[0].poster_path);
      let gotData = moviesData.results.map((items) => {
        return new Movies(items);
      })
      res.send(gotData);
      // console.log(`aaaaaaaa`,gotData);
    })
    .catch(error => {
      res.send(error);
    });
}

function yelpHandler(req, res) { // yelp
  const yelp = require('yelp-fusion');
  let YELP_API_KEY = process.env.YELP_API_KEY;
  const clientYelp = yelp.client(YELP_API_KEY);
  console.log('aaaaaaaaaaa');
  clientYelp.search({
    term: 'Four Barrel Coffee',
    location: 'san francisco, ca',
  }).then(allData => {
    console.log(allData);
    let gotData = allData.jsonBody.businesses.map((items) => {
      return new Yelp (items)
    })
    res.send(gotData);
  }).catch(e => {
    console.log(e);
  });
}

function notFoundHandler(req, res) { //error
  let errorObject = {
    status: 500,
    responseText: 'Sorry, something went wrong'
  };
  res.status(500).send(errorObject);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions, Constructors:

function Location(cityName, locationData) { // location
  this.search_query = cityName;
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}

function Weather(weatherData) { // weather
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

function Park(parkData) { // parks
  this.name = parkData.fullName;
  this.address = `${parkData.addresses[0].line1}, ${parkData.addresses[0].city}, ${parkData.addresses[0].stateCode} ${parkData.addresses[0].postalCode}`;
  this.fee = parkData.entranceFees[0].cost;
  this.description = parkData.description;
  this.url = parkData.url;
}

function Movies(moviesData) { // movies
  this.title = moviesData.title;
  this.overview = moviesData.overview;
  this.average_votes = moviesData.vote_average;
  this.total_votes = moviesData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${moviesData.poster_path}`;
  this.popularity = moviesData.popularity;
  this.released_on = moviesData.release_date;

}

function Yelp(yelpData) { // yelp
  // {
  //   "name": "Pike Place Chowder",
  //   "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
  //   "price": "$$   ",
  //   "rating": "4.5",
  //   "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
  // },
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// PORT

client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening to PORT ${PORT}`);
    });
  })