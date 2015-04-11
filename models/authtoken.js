'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var authTokenSchema = new Schema({
  user: { type: ObjectId, ref: 'User' },
  expires: { type: Date, required: true }
});

module.exports = mongoose.model('AuthToken', authTokenSchema);
