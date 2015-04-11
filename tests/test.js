var assert = require("assert")
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dev', function(err) {
  if (err) 
    throw err;
});

describe('increment Id', function() {
  describe('increment', function() {
    it('add kitty', function(done) {
      var Cat = mongoose.model('Cat', { name: String });
      var kitty = new Cat({ name: 'Garfield' });
      kitty.save(function (err) {
        if (err) {
          done(err);
        } else {
          console.log('meow');
          done();
        }
      });
    })
  })
})


