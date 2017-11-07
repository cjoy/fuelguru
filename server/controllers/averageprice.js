const AveragePrice = require('../models/AveragePrice');

exports.getAveragePrices = function(req, res) {
    var num = req.query.numdays;
    console.log(num);

    var d = new Date();
    d.setDate(d.getDate() - num);
    console.log(d.toString());
    console.log(d);
    var today = new Date();
    console.log(today.toString());

    AveragePrice.find({
        dayofyear : {$lte: today, $gte: d }
      }, function (err, averageprice) {
        if(err){
          console.log("error in finding the average prices")
          callback(err, null)
        }else{
          console.log("found relevent everage prices")
          res.send(averageprice);
        }
      });
};

//post request
exports.insertAveragePrice = function(req, res){
    var price = req.body.price;
    var dayofyear = req.body.dayofyear;
    var cycle_day = req.body.cycle_day;

    var newprice = new AveragePrice({price: price, dayofyear: dayofyear, cycleday : cycle_day});
    console.log(newprice)
    newprice.save(function(err){
        if(err) {res.send(err)}
        else {res.send(newprice)}
    });
}

exports.deleteAveragePrice = function(req, res){
  var price = req.query.price;
  var dayofyear = req.query.dayofyear;

  AveragePrice.remove( { price: price },)
  res.send("hehe")
  
}

exports.getCycleDay = function(req, res) {
  var num = req.query.numdays;
  console.log(num);

  var d = new Date();
  d.setDate(d.getDate() - num);
  console.log(d.toString());
  console.log(d);
  var today = new Date();
  console.log(today.toString());

  waterfall([
    function (callback) {
      AveragePrice.find({
        dayofyear : {$lte: today, $gte: d }
      }, function (err, averageprice) {
        if(err){
          console.log("error in finding the average prices")
          callback(err, null)
        }else{
          console.log("found relevent everage prices")
          callback(averageprice);
        }
      });
    },
    function (averageprice, callback){
      request({
        url: "http://127.0.0.1:5000/cycle",
        method: "POST",
        json: true,
        body: averageprice
      }, function (err, response, body){
          if(err){
            console.log(err)
            res.send(err)
          } else {
            cycle_day = response.body.cycle_day;
            console.log(cycle_day)
            res.send(cycle_day)
          }
      });
    }
  ])
};

