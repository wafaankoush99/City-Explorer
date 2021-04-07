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

// yelp pachage
const yelp = require('yelp-fusion');
// const client = yelp.client('0qEAC7QerPY1EhpfM_X3iw1AfxHGOsMg6-0vVEWJ67g3w_pmL0FUHrDwNoOx9V_1pD3P6HUgHyXnopfjIzBVa4YYH2SCniWhUso79QCuOZbyY3iz2iR83yCqQsptYHYx');
 
// client.search({
//   term: 'Four Barrel Coffee',
//   location: 'san francisco, ca',
// }).then(response => {
//   console.log(response.jsonBody.businesses[0].name);
// }).catch(e => {
//   console.log(e);
// });
//  npm install yelp-fusion --save

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

function parksHandler(req, res) { //parks
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
      let parksData = getData.body.results;
      let gotData = parksData.map((items) => {
        return new Park(items);
      });
      res.send(gotData);
    })
    .catch(error => {
      res.send(error);
    });
}
/*
function yelpHandler(req, res) { // yelp

}*/



function yelpHandler(req, res) { // yelp

  //const yelpURL = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=${numberPerPage}&offset=${start}`;
  const yelpURL = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=${numberPerPage}&offset=${start}`;

  const client = yelp.client('0qEAC7QerPY1EhpfM_X3iw1AfxHGOsMg6-0vVEWJ67g3w_pmL0FUHrDwNoOx9V_1pD3P6HUgHyXnopfjIzBVa4YYH2SCniWhUso79QCuOZbyY3iz2iR83yCqQsptYHYx');

//  
  client.search({
    term: 'Four Barrel Coffee',
    location: 'san francisco, ca',
  }).then(response => {
    console.log(response.jsonBody.businesses[0].name);
  }).catch(e => {
    console.log(e);
  });
  function getYelp(city, page) {
    let YELP_API_KEY = process.env.YELP_API_KEY;
    const pages = 5;
    const start = ((page - 1) * numberPerPage + 1);
    const yelpURL = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=${numberPerPage}&offset=${start}`;
  }

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
  // {
  //   "title": "Love Happens",
  //   "overview": "Dr. Burke Ryan is a successful self-help author and motivational speaker with a secret. While he helps thousands of people cope with tragedy and personal loss, he secretly is unable to overcome the death of his late wife. It's not until Burke meets a fiercely independent florist named Eloise that he is forced to face his past and overcome his demons.",
  //   "average_votes": "5.80",
  //   "total_votes": "282",
  //   "image_url": "https://image.tmdb.org/t/p/w500/pN51u0l8oSEsxAYiHUzzbMrMXH7.jpg",
  //   "popularity": "15.7500",
  //   "released_on": "2009-09-18"
  // },

  this.title = moviesData.results[0].title;
  this.overview = moviesData.results[0].overview;
  this.average_votes = moviesData.results[0].vote_average;
  this.total_votes = moviesData.results[0].vote_count;
  this.image_url = moviesData.results[0].poster_path;
  this.popularity = moviesData.results[0].popularity;
  this.released_on = moviesData.results[0].release_date;

}

function Yelp(yelpData) {
  // [
  //   {
  //     "name": "Pike Place Chowder",
  //     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
  //     "price": "$$   ",
  //     "rating": "4.5",
  //     "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
  //   },
  // ]
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// PORT

client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening to PORT ${PORT}`);
    });
  })
