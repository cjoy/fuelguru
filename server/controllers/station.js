const async = require('async');
const waterfall = require('async-waterfall');
const http = require('http');
const request = require('request');
const uuid = require('uuid');
const Station = require('../models/Station');
const Price = require('../models/Price');



/**
 * SEED STATIONS
 *
 * Generate Fresh Station Models
 */
exports.seedStations = function (req, res) {
  // Asyncronous Waterfall function in order to structure API request data flow
  waterfall([
    // GET NSW GOV ACCESS TOKEN
    function (callback) {
      var options = {
        url: 'https://api.onegov.nsw.gov.au/oauth/client_credential/accesstoken?grant_type=client_credentials',
        headers: {
          'Authorization': 'Basic ' + process.env.NSWFUEL_TOKEN,
          'dataType': 'json'
        }
      };
      // execute GET request with given options
      request(options, function(err, res, body) {
        if (err) {
          callback(err, null)
        } else {
          var data = JSON.parse(res.body);
          var token = data.access_token;
          callback(null, token);
        }
      });
    },

    // GET ALL FUEL STATIONS
    function (token, callback) {
      var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

      var options = {
        url: 'https://api.onegov.nsw.gov.au/FuelPriceCheck/v1/fuel/prices',
        headers: {
          'apikey': process.env.NSWFUEL_KEY,
          'transactionid': uuid.v1(),
          'requesttimestamp': timeStamp,
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + token,
        }
      };
      // execute GET request with given options
      request(options, function(err, res, body) {
        if (err) {
          callback(err, null)
        } else {
          var data = JSON.parse(res.body);
          var stations = data.stations;
          callback(null, stations);
        }
      });
     },

     // STORE STATIONS INTO DATABASE
     // by using Async.Map we can allocate each station object a thread
     // making the save process a lot quicker.
     function (stations, callback) {
      // async map - parallel db requests
      async.map(stations, function(station, callback) {
        var entity = new Station(station);

        // try and see if the station already exists
        Station.findOne({
          code: entity.code,
        }, function (err, foundstat) {
          if (!foundstat) {
            entity.save(function (err) {
              if (err) {
                callback(err, null);
              } else {
                callback(null, station)
              }
            });
          } else {
            console.log('Station '+station.name+' already exists.');
          }
        });

      }, function(err, results) {
        callback(null, stations);
      });
     },
  ], function (err, result) {
    if (err) {
      return res.send({
        err: err,
      });
    } else if (result) {
      return res.send({
        success: true,
        message: 'Seed DB with ' + result.length + ' stations'
      });
    }
  });

  res.send({
    success: true,
    message: 'Seed Complete'
  });

};




/**
 * UPDATE PRICES
 *
 * Generate Fresh Station Models
 */

exports.updatePrices = function (req, res) {
  waterfall([
    // GET NSW GOV ACCESS TOKEN
    function (callback) {
      var options = {
        url: 'https://api.onegov.nsw.gov.au/oauth/client_credential/accesstoken?grant_type=client_credentials',
        headers: {
          'Authorization': 'Basic ' + process.env.NSWFUEL_TOKEN,
          'dataType': 'json'
        }
      };
      // execute GET request with given options
      request(options, function(err, res, body) {
        if (err) {
          callback(err, null)
        } else {
          var data = JSON.parse(res.body);
          var token = data.access_token;
          callback(null, token);
        }
      });
    },

    // GET ALL FUEL PRICES
    function (token, callback) {
      var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      var options = {
        url: 'https://api.onegov.nsw.gov.au/FuelPriceCheck/v1/fuel/prices/new',
        headers: {
          'apikey': process.env.NSWFUEL_KEY,
          'transactionid': uuid.v1(),
          'requesttimestamp': timeStamp,
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + token,
        }
      };
      // execute GET request with given options
      request(options, function(err, res, body) {
        if (err) {
          callback(err, null)
        } else {
          var data = JSON.parse(res.body);
          var prices = data.prices;
          callback(null, prices);
        }
      });
    },


    // SAVE ALL PRICES
    function (prices, callback) {
      async.map(prices, function(price, callback) {
        // only add a new price entry if the price is different
        console.log("Station Code: " + price.stationcode + " price update.");

        var entity = new Price(price);
        entity.save(function (err) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, price)
          }
        });

        // Price.findOne({
        //   stationcode: price.stationcode
        // }, function(err, result) {
        //   if (err) {
        //     callback(err, null);
        //   } else {
        //     console.log("nope")
        //     try {
        //       if (result.price != price.price) {
        //       }
        //     } catch (err) {
        //       callback(err, null);
        //     }
        //   }
        // });

      });
    },
  ], function (err, results) {
    if (err) {
      res.send({
        err: err,
      });
    } else if (!results) {
      res.send({
        success: false,
        message: 'No prices fetched found.',
      });
    } else {
      res.send({
        success: true,
        prices: "Price data " + results.length + " prices recieved and updated.",
      });
    }
  })

}


exports.getPrices = function(req, res){
  var l = req.params;
  var q = req.query;
  lat = q.lat;
  lon = q.lon;
  console.log("GET PRICES")
  console.log(q)
  console.log(lat)
  console.log(lon)
  var range = 0.03


  lat_min = Number(lat) - range;
  lat_max = Number(lat) + range;
  lon_min = Number(lon) - range;
  lon_max = Number(lon) + range;

  waterfall([
    function (callback) {
      Station.find({
        "location.latitude" : {$lte: lat_max, $gte: lat_min },
        "location.longitude" : {$lte: lon_max, $gte: lon_min}
      }, function (err, stations){
        if(err){
          console.log("error in finding a stations ")
          callback(err, null)
        }else{
          console.log("FOUND A STATION")
          callback(null, stations)
        }
      })
    },
    function (stations, callback) {
      async.map(stations, function(station, callback) {
        //need to change this to find and then organise by code
        Price.aggregate(
            { $match: {stationcode : station.code} },
            { $sort: { fueltype: 1, timestamps: 1 } },
            {$group:
              {
                _id: '$fueltype',
                fueltype : { $last: '$fueltype' },
                price : { $last: '$price' },
                createdAt : { $last: '$createdAt' }

              }
            },
            function(err, prices){
            if(err){
              console.log("error in finding a price")
              callback(err, null)

            } else {

              if(prices != null){
                data = {stationcode: station.code,
                        prices: prices,
                        name: station.name,
                        brand: station.brand,
                        address: station.address,
                        location: station.location,
                      };
                console.log(data)
                callback(null, data)
              } else {
                data = {stationcode: station.code,
                        prices: null,
                        name: station.name,
                        brand: station.brand,
                        address: station.address,
                        location: station.location,
                        distance : this_distance
                      };
                console.log(data)
                callback(null, data);
              }
            }
          }
       );
      },function(err, results) {
        if(err){
          res.send(err)
        } else {
          res.send(results)
        }
      });
    }
  ])
}

exports.getPricesTrip = function(req, res){
  var l = req.params;
  var q = req.query;
  lat = q.lat;
  lon = q.lon;
  lat1 = q.lat1;
  lon1 = q.lon1;
  console.log("GETPRICESTRIP");
  console.log(q)
  console.log(lat)
  console.log(lon)
  console.log(lat1)
  console.log(lon1)
  var range = 0.017

  waterfall([
    function (callback) {
      var options = {
        url: 'https://maps.googleapis.com/maps/api/directions/json',
        headers: {
          //change to our google_api key
          'key': 'AIzaSyB_Jepe-4UCHaRnOVkBTdAqnkUEW9Ui3mk',
        },
        qs: {
          'origin': lat + ',' + lon,
          'destination': lat1 + ',' + lon1,
          'mode': 'driving',
        }
      };
      setTimeout(function () {
        // execute GET request with given options
        request(options, function(err, res, body) {
          if (err) {
            callback(err, null)
          } else {
            //console.log(res.body);
            var data = JSON.parse(res.body);
            //console.log(data);
            var routes = data.routes[0].legs[0].steps;

            callback(null, routes);
          }
        });
      }, 100)

    },
    function (routes, callback) {
      //console.log(routes);
      var distance = 1000;
      async.concat(routes, function(point, callback) {
        distance += point.distance.value;
        console.log(distance);
        if (distance > 1000) {
          distance = 0;
          console.log(point);
          var latq = point.end_location.lat;
          var lonq = point.end_location.lng;
          console.log(latq);
          console.log(lonq);
          lat_min = Number(latq) - range;
          lat_max = Number(latq) + range;
          lon_min = Number(lonq) - range;
          lon_max = Number(lonq) + range;
          Station.find({
            "location.latitude" : {$lte: lat_max, $gte: lat_min },
            "location.longitude" : {$lte: lon_max, $gte: lon_min}
          }, function (err, station) {
            if(err){
              console.log("error in finding a station")
              callback(err, null)
            }else{
              console.log("FOUND A STATION")
              callback(null, station)
            }
          });
        } else {
          callback()
        }
      }, function (err, results){
        if(err){
          console.log("error in finding stations ")
          callback(err, null)
        }else{
          console.log("RETURNING STATIONS")
          var seen = {};
          var out = [];
          var len = results.length;
          var j = 0;
          for(var i = 0; i < len; i++) {
               var item = results[i].name;
               if(seen[item] !== 1) {
                     seen[item] = 1;
                     out[j++] = results[i];
               }
          }
          callback(null, out)
        }
      });
    },
    // function (stations, callback) {
    //   async.eachSeries(stations, function(station, callback){
    //     station.travelTime = 0
    //     var req1 = {
    //       url: 'https://maps.googleapis.com/maps/api/directions/json',
    //       headers: {
    //         //change to our google_api key
    //         'key': 'AIzaSyB_Jepe-4UCHaRnOVkBTdAqnkUEW9Ui3mk',
    //       },
    //       qs: {
    //         'origin': lat + ',' + lon,
    //         'destination': station.address,
    //         'mode': 'driving',
    //       }
    //     };
    //     // execute GET request with given options
    //     request(req1, function(err, res, body) {
    //       if (err) {
    //         console.log("err", err)
    //         callback(err, null)
    //       } else {
    //         var data = JSON.parse(res.body);
    //         console.log("data1: ", data)
    //         station.travelTime = data.routes[0].legs[0].duration.value;
    //         console.log("req1", station.travelTime)
    //         callback(null, station);
    //
    //       }
    //     });

        // var req2 = {
        //   url: 'https://maps.googleapis.com/maps/api/directions/json',
        //   headers: {
        //     //change to our google_api key
        //     'key': 'AIzaSyD-oD9vTEtGAX6qs4uYc0lGHzhaWCHLK14',
        //   },
        //   qs: {
        //     'origin': station.address,
        //     'destination': lat1 + ',' + lon1,
        //     'mode': 'driving',
        //   }
        // };
        // request(req2, function(err, res, body) {
        //   if (err) {
        //     console.log("err", err)
        //     callback(err, null)
        //   } else {
        //     var data = JSON.parse(res.body);
        //     console.log("data2: ", data)
        //     station.travelTime += data.routes[0].legs[0].duration.value;
        //     console.log("req2", station.travelTime)
        //     callback(null, station);
        //   }
        // });
    //   }, function(err, results) {
    //     if (err) {
    //       console.log("err")
    //       callback(err, null)
    //     } else {
    //       console.log("done", results)
    //       callback(null, results)
    //     }
    //   });
    // },

    function (stations, callback) {
      console.log("STATIONS:");
      console.log(stations);
      async.map(stations, function(station, callback) {
        //need to change this to find and then organise by code
        Price.aggregate(
            { $match: {stationcode : station.code} },
            { $sort: { fueltype: 1, timestamps: 1 } },
            { $group:
              {
                _id: '$fueltype',
                fueltype : { $last: '$fueltype' },
                price : { $last: '$price' },
                createdAt : { $last: '$createdAt' }

              }
            },
            function(err, prices){
            if(err){
              console.log("error in finding a price")
              callback(err, null)
            } else {
              if(prices != null){
                data = {stationcode: station.code,
                        prices: prices,
                        name: station.name,
                        brand: station.brand,
                        address: station.address,
                        location: station.location,
                      };
                console.log(data)
                callback(null, data)
              } else {
                data = {stationcode: station.code,
                        prices: null,
                        name: station.name,
                        brand: station.brand,
                        address: station.address,
                        location: station.location,
                        distance : this_distance
                      };
                console.log(data)
                callback(null, data);
              }
            }
          }
       );
     }, function(err, results) {
       if (err){
         res.send(err)
       } else {
          var seen = {};
          var out = [];
          var len = results.length;
          var j = 0;
          for(var i = 0; i < len; i++) {
               var item = results[i].name;
               if(seen[item] !== 1) {
                     seen[item] = 1;
                     out[j++] = results[i];
               }
          }

          console.log(Object.keys(seen))
          res.send(out);
        }
      });
    }
  ])
}

exports.Predict = function(req, res){
  var q = req.body
  var cycle_day = 0

  console.log(q)

  waterfall([
    function (callback) {
      myJSONObject = {
                        "PrevPrice" : q.prevprice,
                        "2PrevPrice" : q.prevprevprice,
                        "Last" : 2.5,
                        "cycle_day" : q.cycle_day,
                        "Brand" : q.brand,
                        "FuelType": q.fueltype
                    }
      request({
        url: "http://localhost:5000/predict",
        method: "POST",
        json: true,
        body: myJSONObject
      }, function (error, response, body){
          if(error){
            console.log(error)
            res.send(error)
          } else {
            console.log(response.body);
            res.send(response.body)
          }

      });
    }
  ])

}

exports.getRecentPricesForStation = function(req, res){

  var num = req.query.numdays;
  var stationcode = req.query.stationcode;
  var fueltype = req.query.fueltype;
  var d = new Date();
  d.setDate(d.getDate() - num);
  var today = new Date();
  console.log(today.toString());

  Price.find({
      stationcode : stationcode,
      fueltype: fueltype,
      createdAt : {$lte: today, $gte: d }
    }, function (err, averageprice) {
      if(err){
        console.log("error in finding the prices")
        callback(err, null)
      }else{
        console.log("found relevent prices")
        res.send(averageprice);
      }
    });


}
