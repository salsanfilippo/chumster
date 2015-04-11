'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var photoAlbumSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  photos: ['Photo'],
  modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PhotoAlbum', photoAlbumSchema);
