'use strict';

//DOTENV (read our environment variable)
require( 'dotenv' ).config();

// Application Dependencies
const express = require( 'express' );

//CORS = Cross Origin Resource Sharing
const cors = require( 'cors' );

// client-side HTTP request library
const superAgent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 4000;
const server = express();
server.use( cors() );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Routes:

server.get('/', homeRouteHandler); // home
server.get('/location', locationHandler); // location
server.get('/weather', weatherHandler); // weather
server.get('/parks', parksHandler); // parks
server.get('*', notFoundHandler); // error

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Routes Handles:

function homeRouteHandler(req,res) { // home
  res.send( 'Your server is working' );
}

function locationHandler(req,res) { // location
  console.log(req.query.city);
  let GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
  let cityName = req.query.city;
  let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`
  superAgent.get(locationURL)
  .then(geoData=>{
    console.log(geoData);
    let gData = geoData.body;
    const locationData = new Location (gData);
    res.send(locationData);
  })
}

function weatherHandler(req,res) { // weather
  let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  let cityName = req.query.search_query;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${WEATHER_API_KEY}`;
  console.log(req.query);
  superAgent.get(weatherURL)
    .then((getData) => {
      console.log(getData.body);
      let gettedData  = getData.body.data.map((item) => {
        return new Weather (item);
      });
      res.send(gettedData);
    })
    .catch(error => {
      res.send(error);
    });
}

function parksHandler (req,res){ //parks
  let PARKS_API_KEY = process.env.PARKS_API_KEY;
  let cityName = req.query.search_query;
  let parksURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${PARKS_API_KEY}`;
  superAgent.get(parksURL)
    .then(getData => {
      let parksData = getData.body.data;
      let data = parksData.map((items) => {
        return new Park (items);
      });
      res.send(data);
    })
    .catch(error => {
      res.send(error);
    });
}

function notFoundHandler(req,res) { //error
  let errorObject = {
    status: 500,
    responseText: 'Sorry, something went wrong'
  };
  res.status( 500 ).send( errorObject );
} 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions, Constructors:

function Location( locationData ){ // location
  this.search_query = 'Seattle';
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}

function Weather (weatherData) { // weather
  this.forecast = weatherData.weather.description ;
  this.time = weatherData.valid_date ;
}

function Park (parkData) {
  this.name = parkData.fullName ;
  this.address = `${parkData.addresses[0].line1}, ${parkData.addresses[0].city}, ${parkData.addresses[0].stateCode} ${parkData.addresses[0].postalCode}`;
  this.fee = parkData.entranceFees[0].cost;
  this.description = parkData.description;
  this.url = parkData.url;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// PORT
server.listen( PORT, ()=>{
  console.log( `Listening to PORT ${PORT}` );
} );

