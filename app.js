function isEmptyObject(object) {
	return (JSON.stringify(object)=='[]');
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
app.use(bodyParser.json())

app.use(methodOverride('X-HTTP-Method-Override'))

app.use(express.static(path.join(application_root, 'public')));

app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/api', function (req, res) {
  res.send('Apple POC API is running');
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
        	res.status(401).send('Authorization Required');
        	callback(new Error('Authorization Required'), token);
        } else {
            refreshAuthToken(token, res, function(err, data) {
                if (err)
                    res.status(400).send('Bad Request');

                callback(err, data);
            });
        }
      } else {
        res.status(400).send('Bad Request');
      	callback(new Error('Bad Request'), null);
      }
    });
}

function signIn(userId, res, callback) {
	var id = mongoose.Types.ObjectId(userId);
	console.log('id: ' +JSON.stringify(id));
    return AuthTokenModel.find({ user : id }) 
                         .limit(1)
                         .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                         .exec(function(err, token) {
      if (!err) {
        if ((token == null) || isEmptyObject(token)) {
        	token = new AuthTokenModel();
        	token.user = id;
        	token.expires = new Date();
        } else {
        	token = token[0];
        }

       	console.log("token: " + JSON.stringify(token) + ", is isEmptyObject: " + isEmptyObject(token));
        refreshAuthToken(token, res, function (err, data) {
          if (!err)
            res.status(200).send(token);
          else
            res.status(400).send('Bad Request');
          callback(err, token);
        });
      } else {
        res.status(400).send('Bad Request');
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
})

app.get('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, 'email firstName lastName birthDate', function (err, user) {
    if ((!err) && (user!=null)) {
      return res.status(200).send(user);
    } else {
      console.log(err);
      return (err) ? res.status(400).end()
                   : res.status(404).end();
    }
  });
})

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
      return res.status(201).send(user);
    } else {
      console.log(err);
      return res.status(400).end();
    }
  });
});

app.put('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    user.email = req.body.email;
    user.password = req.body.password;
    user.lastName = req.body.lastName;
    user.firstName = req.body.firstName;
    user.birthDate = req.body.birthDate;
    user.modified = Date.now;

    if ((!err) && (status!=null)) {
	  return user.save(function (err) {
	    if ((!err) && (user!=null)) {
	      console.log("updated");
	      return res.status(200).send(user);
	    } else {
	      console.log(err);
	      return res.status(400).end();
	    }
      });
    }  
    return (err) ? res.status(400).end()
                 : res.status(404).end();
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

app.get('/api/login/exists/:email', function (req, res){
  return UserModel.findOne()
                  .where('email').equals(req.params.email)
                  .exec(function (err, user) {
    if ((!err) && (user!=null) && (!isEmptyObject(user))) {
      console.log("User: " + typeof(user) + ", err: " + err);
      console.log("email: " + req.params.email + ", password: " + req.params.password);
      return res.status(200).send({ exists: true });
    } else {
      console.log(err);
      return res.status(200).send({ exists: false });
    }
  });
})

app.get('/api/login/with/:email/and/:password', function (req, res){
  return UserModel.findOne()
                  .where('email').equals(req.params.email)
                  .where('password').equals(req.params.password)
                  .select('email firstName lastName')
                  .exec(function (err, user) {
    if ((!err) && (user!=null) && (!isEmptyObject(user))) {
      console.log("User: " + typeof(user) + ", err: " + err);
      console.log("email: " + req.params.email + ", password: " + req.params.password);
      console.log("id: " + user._id.toString() + ", _id: " + user._id + ", user: " + JSON.stringify(user));
      signIn(user._id.toString(), res, function (err, data) { });
    } else {
      console.log(err);
      return (err) ? res.status(400).end()
                   : res.status(404).end();
    }
  });
})

app.get('/api/logout', function (req, res) {
  var authTokenId = req.headers[auth_header];
  return AuthTokenModel.findByIdAndRemove(authTokenId, function (err, token) {
    if ((err) || (token==null)) {
      console.log(err);
      if (err)
        res.status(400).end();
       else
        res.status(404).end();
    } else {
      console.log("removed");
      res.status(200).send('Logged Out');
    }

    return callback(err, token);
  });
});

var FriendsModel = mongoose.model('Friends', Friends);
app.get('/api/friends/', function (req, res){
  var authTokenId = req.headers[auth_header];
  verifyAuthToken(authTokenId, res, function(err, data) {
    var user = (data) ? data.user : null;
    if ((!err) && (!user)) {
    	FriendsModel.find({ user : user._id })
    	            .populate({ path: 'friend', select: 'email firstName lastName', model: 'User' })
    	            .exec(function (err, friends) {
    				  if (!err) {
    				    return res.status(200).send(friends);
    				  } else {
    				  	return res.status(400).end();
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
  return ProductModel.findById(req.params.id, function (err, product) {
    if (!err) {
      if (product==null)
        return res.status(404).end();

      return res.status(200).send(product);
    } else {
      console.log(err);
      return res.status(400).end();
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
        return res.status(400).send('Bad Request');
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
        return res.status(400).send('Bad Request');
      }
    });
  });
});

// Launch server
app.listen(4242);
