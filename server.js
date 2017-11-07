var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var mocks = require('node-mocks-http');


// Load environment variables from .env file
dotenv.load();
var app = express();
mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (req.isAuthenticated()) {
    var payload = req.isAuthenticated();
    User.findById(payload.sub, function(err, user) {
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

// Models
var User = require('./server/models/User');
var Station = require('./server/models/Station');
var Price = require('./server/models/Price');
var AveragePrice = require('./server/models/AveragePrice');
// DEFAULT Routes (Don't modify - unless you know what to do)
var userController = require('./server/controllers/user');
var contactController = require('./server/controllers/contact');
app.post('/contact', contactController.contactPost);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.post('/signup', userController.signupPost);
app.post('/login', userController.loginPost);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/auth/facebook', userController.authFacebook);
app.get('/auth/facebook/callback', userController.authFacebookCallback);
app.post('/auth/google', userController.authGoogle);
app.get('/auth/google/callback', userController.authGoogleCallback);
app.post('/auth/twitter', userController.authTwitter);
app.get('/auth/twitter/callback', userController.authTwitterCallback);

// API Controllers
var stationController = require('./server/controllers/station');
var averagePriceController = require ('./server/controllers/averageprice');
app.post('/api/station/seedstations', stationController.seedStations);
app.post('/api/station/updateprices', stationController.updatePrices);
app.get('/price/station/local/:loc', stationController.getPrices);
app.get('/price/station/trip/:loc', stationController.getPricesTrip);
app.post('/api/station/predict', stationController.Predict);


app.get('/price/recent/:num', stationController.getRecentPricesForStation);
app.get('/averageprice/:numdays', averagePriceController.getAveragePrices);
app.post('/averageprice/add', averagePriceController.insertAveragePrice);
app.delete('/averageprice/delete/:price', averagePriceController.deleteAveragePrice);
// Command Lines Arguments
var cl_option = process.argv[2];
req = mocks.createRequest();
res = mocks.createResponse();
if (cl_option == 'seed-stations') {
  stationController.seedStations(req, res);
}
if (cl_option == 'seed-prices') {
  stationController.updatePrices(req, res);
}


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
