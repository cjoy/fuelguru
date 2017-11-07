var crypto = require('crypto');
var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var AveragePriceSchema = new mongoose.Schema({
  dayofyear: Date,
  price: Number,
  cycleday: Number
}, schemaOptions);

var AveragePrice = mongoose.model('AveragePrice', AveragePriceSchema);

module.exports = AveragePrice;