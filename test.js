let start =1;
function getYelp(city, page) {
let key = process.env.YELP_API_KEY;
const numPerPage =5;
const start = ((page -1) * numPerPage +1);
const url = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=${numPerPage}&offset=${start}`;

}


const yelp = require('yelp-fusion');

function getYelp(city, page) {
    const api_key = "";
    const numPerPage = 5;
    const start = ((page - 1) * numPerPage + 1);
    const client = yelp.client(api_key);
    client.search({
        location: city,
        limit: 5,
        offset: start
    }).then(response => {
        let AllArray = response.jsonBody.businesses
        console.log(AllArray)

    }).catch(e => {
        console.log(e);
    });

}