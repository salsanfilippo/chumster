String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];
    
    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    
    return theString;
}

var application_root = __dirname,
    express = require('express'),
    path = require('path'),
    sync = require('synchronize');
    mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler');
var app = express();

var auth_header = "auth-token";

// Database
mongoose.connect('mongodb://localhost/applepoc');

// Config

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.static(path.join(application_root, 'public')));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Auth-Token");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

  app.disable('etag');

  next();
});

app.get('/api', function (req, res) {
  res.send('Chumster API is running');
});

app.get('/', function (req, res) {
  res.rediret('/index.html');
});

var Schema = mongoose.Schema;  

var AuthToken = new Schema({
    user: { type:Schema.ObjectId, ref: User },
    expires: { type: Date, required: true }
});

var User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: false },
    modified: { type: String, default: Date.now }
});

User.plugin( mongoosePaginate );

var Friends = new Schema({
    user: { type:Schema.ObjectId, ref: User, required: true },
    friend: { type:Schema.ObjectId, ref: User, required: true }
});

var Product = new Schema({  
    title: { type: String, required: true },  
    description: { type: String, required: true },  
    style: { type: String, unique: true },  
    modified: { type: Date, default: Date.now }
});

var AuthTokenModel = mongoose.model('AuthToken', AuthToken);
function refreshAuthToken(token, res, callback) {
  var expires = new Date();
  expires.setMinutes(expires.getMinutes()+20);

  token.expires = expires;

  token.save(function(err) {
    callback(err, token);
  });
}

function verifyAuthToken(authTokenId, res, callback) {
  return AuthTokenModel.findById(authTokenId)
                       .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                       .exec(function(err, token) {
    if (!err) {
      if ((token == null) || (Date.now() > token.expires)) {
        err = new Error('Unauthorized');
        res.send(401);
        callback(err, token);
      } else {
        refreshAuthToken(token, res, function(err, data) {
          if (err)
              res.send(400);

          callback(err, data);
        });
      }
    } else {
      res.send(400);
      callback(err, null);
    }
  });
}

function signIn(userId, res, callback) {
  return AuthTokenModel.findOne({ user : userId })
                       .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                       .exec(function(err, token) {
    if (!err) {
      if (token == null) {
        token = new AuthTokenModel();
        token.user = mongoose.Types.ObjectId(userId);
        token.populate({ path: 'user', select: 'email firstName lastName', model: 'User' });
        token.expires = new Date();
      }
      console.log("token: " + JSON.stringify(token));
        refreshAuthToken(token, res, function (err, data) {
        if (token.user.constructor.name == 'ObjectID') {
          AuthTokenModel.findById(token._id)
                        .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                        .exec(function (err, token) {
                          callback(err, token);
                        });
        } else {
          callback(err, token);
        }
      });
    } else {
      res.status(400).end();
      callback(err, token);
    }
  });
}

var UserModel = mongoose.model('User', User);
app.get('/api/users', function (req, res){
  return UserModel.find({}, 'email firstName lastName birthDate', function (err, users) {
    if ((!err) && (users!=null)) {
      return res.status(200).send(users);
    } else {
      console.log(err);
      return res.status(400).end();
    }
  });
});

app.get('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, 'email firstName lastName birthDate', function (err, user) {
    if ((!err) && (user!=null)) {
      return res.status(200).send(user);
    } else {
      console.log(err);
      return (err) ? res.status(400).send(err.message || '')
                   : res.status(404).end();
    }
  });
});

app.post('/api/users', function (req, res){
  console.log("POST: ");
  console.log(req.body);

  var user = new UserModel({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDate: req.body.birthDate
  });

  return user.save(function (err) {
    if ((!err) && (user!=null)) {
      console.log("created");
      signIn(user._id.toString(), res, function (err, data) {
      if (!err)
        res.status(201).send(data);
      else
        res.status(400).send('Bad Request');
      });
    } else {
      console.log(err);
      return res.status(400).send(err.errors);
    }
  });
});

app.put('/api/users/:id', function (req, res){
  return UserModel.findOneAndUpdate({ _id : req.params.id},
                                    { $set: { lastName: req.body.lastName,
                                              firstName: req.body.firstName,
                                              birthDate: req.body.birthDate,
                                              modified: Date.now()}},
                                    {  })
                  .select('email firstName lastName')
                  .exec(function(err, user) {
                     if ((!err) && (user!=null)) {
                       console.log(user);
                       return res.status(200).send(user);
                     } else {
                       console.log(err);
                       return (err) ? res.status(400).send(err.errors || err.message || 'Unknown Error')
                                    : res.status(404).end();
                     }
                   });
});

app.put('/api/users/:id/password', function (req, res){
  return UserModel.findOneAndUpdate({ _id : req.params.id,
                                      password : req.body.oldPassword },
                                    { $set: { password: req.body.newPassword,
                                              modified: Date.now() } },
                                    {  })
                  .select('email firstName lastName')
                  .exec(function(err, user) {
                     if ((!err) && (user!=null)) {
                       console.log(user);
                       return res.status(200).send(user);
                     } else {
                       console.log(err);
                       return (err) ? res.send(400)
                                    : res.send(404);
                     }
                   });
});

app.delete('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if ((!err) && (user!=null)) {
        console.log("removed");
        return res.status(200).send(user);
      } else {
        console.log(err);
        return (err) ? res.status(400).end()
                     : res.status(404).end();
      }
    });
  });
});

app.get('/api/auth/exists/:email', function (req, res){
  return UserModel.findOne()
                  .where('email').equals(req.params.email)
                  .exec(function (err, user) {
    if ((!err) && (user!=null)) {
      console.log("User: " + typeof(user) + ", err: " + err);
      console.log("email: " + req.params.email + ", password: " + req.params.password);
      return res.status(200).send({ exists: true });
    } else {
      console.log(err);
      return res.status(200).send({ exists: false });
    }
  });
})

app.get('/api/auth/with/:email/and/:password', function (req, res, next){
  return UserModel.findOne()
                  .where('email').equals(req.params.email)
                  .where('password').equals(req.params.password)
                  .select('email firstName lastName')
                  .exec(function (err, user) {
    if ((!err) && (user!=null)) {
      console.log("User: " + typeof(user) + ", err: " + err);
      console.log("email: " + req.params.email + ", password: " + req.params.password);
      console.log("id: " + user._id.toString() + ", _id: " + user._id + ", user: " + JSON.stringify(user));
      signIn(user._id.toString(), res, function (err, token) {
        if (!err)
          res.status(200).send(token);
        else
          res.status(400).end();
      });
    } else {
      console.log(err);
      return ((err) ? res.status(400)
                    : res.status(404)).end();
    }
  });
})

app.delete('/api/auth/logout', function (req, res) {
  var authTokenId = req.headers[auth_header];
  return AuthTokenModel.findByIdAndRemove(authTokenId, function (err, token) {
    if ((err) || (token==null)) {
      console.log(err);
      if (err)
        return res.send(400);
       else
        return res.send(404);
    } else {
      console.log("removed");
      return res.status(200).send('Logged Out');
    }
  });
});

var FriendsModel = mongoose.model('Friends', Friends);
app.get('/api/friends/', function (req, res){
  var authTokenId = req.headers[auth_header];
  verifyAuthToken(authTokenId, res, function(err, data) {
    var user = (data) ? data.user : null;
    if ((!err) && (user)) {
      FriendsModel.find({ $or : [ { user : user._id }, { friend : user._id } ]})
                  .populate([ { path: 'user',
                                match: { _id: { $ne: user._id } },
                                select: 'email firstName lastName',
                              model: 'User' },
                              { path: 'friend',
                                match: { _id: { $ne: user._id }},
                                select: 'email firstName lastName',
                                model: 'User' } ])
                  .lean()
                  .exec(function(err, friends) {
                     // Do something here...
                     if (!err) {
                       return res.status(200).send(friends);
                     } else {
                       return res.send(400);
                     }
                   });
    }
  });
});

var ProductModel = mongoose.model('Product', Product);  
app.get('/api/products', function (req, res){
  var authTokenId = req.headers[auth_header];
  verifyAuthToken(authTokenId, res, function(err, data) {
    var user = (data) ? data.user : null;
    if ((!err) && (user)) {
      ProductModel.find(function (err, products) {
        if ((!err) && products!=null) {
            return res.status(200).send(products);
        } else {
            console.log(err);
            return res.status(400).send('Bad Request');
        }
      });
    }
  })
});

app.get('/api/products/:id', function (req, res){
  var authTokenId = req.headers[auth_header];
  verifyAuthToken(authTokenId, res, function(err, data) {
    var user = (data) ? data.user : null;
    if ((!err) && (user)) {
      return ProductModel.findById(req.params.id, function (err, product) {
        if (!err) {
          if (product == null)
            return res.send(404);

          return res.status(200).send(product);
        } else {
          console.log(err);
          return res.send(400);
        }
      });
    }
  });
});

app.post('/api/products', function (req, res){
  console.log("POST: ");
  console.log(req.body);

  var product = new ProductModel({
    title: req.body.title,
    description: req.body.description,
    style: req.body.style
  });

  return product.save(function (err) {
    if (!err) {
      console.log("created");
      return res.status(201).send(product);
    } else {
      console.log(err);
      return res.status(400).end();
    }
  });
});

app.put('/api/products/:id', function (req, res){
  return ProductModel.findById(req.params.id, function (err, product) {
    product.title = req.body.title;
    product.description = req.body.description;
    product.style = req.body.style;

    return product.save(function (err) {
      if ((!err) && (product!=null)) {
        console.log("updated");
        return res.status(200).send(product);
      } else {
        console.log(err);
        return res.send(400);
      }
    });
  });
});

app.delete('/api/products/:id', function (req, res){
  return ProductModel.findById(req.params.id, function (err, product) {
    return product.remove(function (err) {
      if ((!err) && (product!=null)) {
        console.log("removed");
        return res.status(200).send(product);
      } else {
        console.log(err);
        return res.send(400);
      }
    });
  });
});

// Launch server
app.listen(4242);
