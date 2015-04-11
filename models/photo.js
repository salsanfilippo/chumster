'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var photoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  path: { type: String, required: true },
  modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
