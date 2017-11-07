var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var schemaOptions = {
  timestamps: true,
  price: Number,
  toJSON: {
    virtuals: true
  }
};

var priceSchema = new mongoose.Schema({
  stationcode: String,
  fueltype: String,
  price: Number 
}, schemaOptions);

var Price = mongoose.model('Price', priceSchema);

module.exports = Price;