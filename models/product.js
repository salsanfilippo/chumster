'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  style: { type: String, unique: true },
  modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
