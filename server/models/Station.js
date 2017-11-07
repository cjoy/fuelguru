var crypto = require('crypto');
var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var stationSchema = new mongoose.Schema({
  brand: String,
  code: String,
  name: String,
  address: String,
  location: {
    latitude: Number,
    longitude: Number
  },
}, schemaOptions);

var Station = mongoose.model('Station', stationSchema);

module.exports = Station;