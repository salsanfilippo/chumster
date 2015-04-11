'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var friendsSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  friend: { type: ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Friends', friendsSchema);
