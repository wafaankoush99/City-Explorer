function Park (parkData) {
    this.name = parkData.fullName ;
    this.address = `${parkData.addresses[0].line1}, ${parkData.addresses[0].city}, ${parkData.addresses[0].stateCode} ${parkData.addresses[0].postalCode}`;
    this.fee = parkData.entranceFees[0].cost;
    this.description = parkData.description;
    this.url = parkData.url;
  }
  server.get('/parks',handPark);
  function handPark (req,res){
    let PARKS_API_KEY = process.env.PARKS_API_KEY;
    let cityName = req.query.search_query;
    let parksURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${PARKS_API_KEY}`;
    superagent.get(parksURL)
      .then(getData => {
        let gettedData = getData.body.data;
        let data = gettedData.map((items) => {
          return new Park (items);
        });
        res.send(data);
      })
      .catch(error => {
        res.send(error);
      });
  }