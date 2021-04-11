

// applicationCache.get('/yelp',yelpHandler);

// function yelpHandler(req,res){
//     let city = req.query.search_query;
//     const page = req.query.page;
//     getYelp(city,page)
//         .then(yelpData => {
//             res.status(200).json(yelpData);
//         });
// }

// let start = 1
// function getYelp(city,page){
//     let key = process.env.YELP_API_KEY;
//     const numPerPage = 5;
//     const start ((page-1)*numPerPage+1);
//     const url = `https://api.yelp.com/v3/business/search?location=${city}&limit=${numPerPage}&offset=${start}`;


// return superAgent.get(url)
//     .set('Authorization', `Bearer ${key}` )
//     .then(yelpVal => {
//         let yelpDaily = yelpVal.body.businesses.map(val=>{
//             return new yelpDaily(val);
//         });
//         return yelpDaily;
//     })
//     .catch(e =>{
//         console.log('YELP ERROR', e);
//     })
// }

// // const { request } = require("express");
// let start =1;
// function getYelp(city, page) {
// let key = process.env.YELP_API_KEY;
// const numPerPage =5;
// const start = ((page -1) * numPerPage +1);
// const url = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=${numPerPage}&offset=${start}`;

// }


// const yelp = require('yelp-fusion');

// function getYelp(city, page) {
//     const api_key = "";
//     const numPerPage = 5;
//     const start = ((page - 1) * numPerPage + 1);
//     const client = yelp.client(api_key);
//     client.search({
//         location: city,
//         limit: 5,
//         offset: start
//     }).then(response => {
//         let AllArray = response.jsonBody.businesses
//         console.log(AllArray)

//     }).catch(e => {
//         console.log(e);
//     });

// }