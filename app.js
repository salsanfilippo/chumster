
function loadTemplates(template) {
  var htmlPath = path.join(application_root,
                           String.format('public/templates/email/{0}.html', template));
  var textPath = path.join(application_root,
                           String.format('public/templates/email/{0}.txt', template));

  var html = fs.readFileSync(htmlPath, "utf8");
  var text = fs.readFileSync(textPath, "utf8");

  return { text: text, html: html };
}

// Script includes
var Includes = {
                 object: require('./object.js'),
                 string: require('./string.js')
               };

// Modules
var application_root = __dirname,
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    express = require('express'),
    fs = require('fs'),
    mailer = require('nodemailer'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    path = require('path'),
    recaptcha = require('recaptcha').Recaptcha,
    sync = require('synchronize');

var RC_PUBLIC_KEY = '6Leguf0SAAAAABh6LiAD36ISmoBdacap4tMebrhz',
    RC_PRIVATE_KEY = '6Leguf0SAAAAAJzntgEjN-1OTV06mrk9Rj_9rulH';

var app = express();

var auth_header = "auth-token";

// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport("SMTP",
                                           {
                                             service: "Gmail",
                                             auth: {
                                               user: "chumster.postmaster@gmail.com",
                                               pass: "Chumster!"
                                             }
                                           });

// Database
mongoose.connect('mongodb://localhost/applepoc');

// Config

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.static(path.join(application_root, 'public')));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.all('/*', function (req, res, next) {
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
  user: { type: Schema.ObjectId, ref: User },
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

User.plugin(mongoosePaginate);

var Friends = new Schema({
  user: { type: Schema.ObjectId, ref: User, required: true },
  friend: { type: Schema.ObjectId, ref: User, required: true }
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
      expires.setMinutes(expires.getMinutes() + 20);

  token.expires = expires;

  token.save(function (err) {
    callback(err, token);
  });
}

function verifyAuthToken(authTokenId, res, callback) {
  return AuthTokenModel.findById(authTokenId)
                       .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                       .exec(function (err, token) {
                               if (!err) {
                                 if ((token == null) || (Date.now() > token.expires)) {
                                   err = new Error('Unauthorized');
                                   res.send(401);
                                   callback(err, token);
                                 } else {
                                   refreshAuthToken(token, res, function (err, data) {
                                     if (err) {
                                       res.send(400);
                                     }

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
  return AuthTokenModel.findOne({ user: userId })
                       .populate({ path: 'user', select: 'email firstName lastName', model: 'User' })
                       .exec(function (err, token) {
                               if (!err) {
                                 if (token == null) {
                                   token = new AuthTokenModel();
                                   token.user = mongoose.Types.ObjectId(userId);
                                   token.populate({ path: 'user',
                                                    select: 'email firstName lastName',
                                                    model: 'User' });
                                   token.expires = new Date();
                                 }

                                 console.log("token: " + JSON.stringify(token));
                                 refreshAuthToken(token, res, function (err, data) {
                                   if (token.user.constructor.name == 'ObjectID') {
                                     AuthTokenModel.findById(token._id)
                                                   .populate({ path: 'user',
                                                               select: 'email firstName lastName',
                                                               model: 'User' })
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

// Model for system users
var UserModel = mongoose.model('User', User);

/************************************************
 * Method: GET                                  *
 * Path: /api/users                             *
 * Params: None                                 *
 * Returns: An array of registered users        *
 ************************************************/
app.get('/api/users',
        function (req, res) {
          return UserModel.find({},
                                'email firstName lastName birthDate',
                                function (err, users) {
                                  if ((!err) && (users != null)) {
                                    return res.status(200).send(users);
                                  } else {
                                    console.log(err);
                                    return res.status(400).end();
                                  }
                                });
        });

/**
 *
 * Description: To retrieve a registered user
 *
 *   HTTP Verb: GET
 *   Http Path: /api/users/:id
 *      Params: id - User Id to retrieve user
 * Form Params: none
 *     Returns: The user identifiable by id.
 * Http Status: 201 - successful
 *              404 - user not found (bad id)
 *              400 - other non-specific error
 *       Notes:
 *
 **/
app.get('/api/users/:id',
        function (req, res) {
          return UserModel.findById(req.params.id,
                                    'email firstName lastName birthDate',
                                    function (err, user) {
                                      if ((!err) && (user != null)) {
                                        return res.status(200).send(user);
                                      } else {
                                        console.log(err);
                                        return (err) ? res.status(400).send(err.message || '')
                                                     : res.status(404).end();
                                      }
                                    });
        });

/**
 *
 * Description: To register a new user
 *
 *   HTTP Verb: POST
 *   Http Path: /api/users/
 *      Params: None
 * Form Params: email - user's email address
 *              password - user's password
 *              firstName - user's first name
 *              lastName - user's last name
 *              birthDate - user's birth date
 *     Returns: The updated user
 * Http Status: 201 - successful
 *              404 - user not found (bad id)
 *              400 - other non-specific error
 *       Notes:
 *
 **/
app.post('/api/users',
         function (req, res) {
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
                              if ((!err) && (user != null)) {
                                console.log("created");
                                signIn(user._id.toString(),
                                       res,
                                       function (err, data) {
                                         if (!err) {
                                           res.status(201)
                                              .send(data);
                                         } else {
                                           res.status(400)
                                              .send('Bad Request');
                                         }
                                       });
                              } else {
                                console.log(err);
                                return res.status(400)
                                          .send(err.errors);
                              }
                            });
         });

/**
 *
 * Description: To update a registered user's profile
 *
 *   HTTP Verb: PUT
 *   Http Path: /api/users/:id
 *      Params: id - User Id to update password
 * Form Params: email - user's email address
 *              firstName - user's first name
 *              lastName - user's last name
 *              birthDate - user's birth date
 *     Returns: The updated user
 * Http Status: 200 - successful
 *              404 - user not found (bad id)
 *              400 - other non-specific error
 *       Notes:
 *
 **/
app.put('/api/users/:id',
        function (req, res) {
          return UserModel.findOneAndUpdate({ _id: req.params.id },
                                            { $set: { lastName: req.body.lastName,
                                                      firstName: req.body.firstName,
                                                      birthDate: req.body.birthDate,
                                                      modified: Date.now() } },
                                            {  })
                          .select('email firstName lastName')
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    console.log(user);
                                    return res.status(200)
                                              .send(user);
                                  } else {
                                    console.log(err);
                                    return (err) ? res.status(400)
                                                      .send(err.errors || err.message || 'Unknown Error')
                                                 : res.status(404)
                                                      .end();
                                  }
                                });
        });

/**
 *
 * Description: To change a registered user's password
 *
 *   HTTP Verb: PUT
 *   Http Path: /api/users/:id/password
 *      Params: id - User Id to update password
 * Form Params: oldPassword - user's original password
 *              newPassword - user's new password
 *     Returns: The updated user
 * Http Status: 200 - successful
 *              404 - user not found (bad id)
 *              400 - other non-specific error
 *       Notes: Both old and new passwords must be obfuscated using MD5.
 *
 **/
app.put('/api/users/:id/password',
        function (req, res) {
          return UserModel.findOneAndUpdate({ _id: req.params.id,
                                              password: req.body.oldPassword },
                                            { $set: { password: req.body.newPassword,
                                                      modified: Date.now() } },
                                            {  })
                          .select('email firstName lastName')
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    console.log(user);
                                    return res.status(200).send(user);
                                  } else {
                                    console.log(err);
                                    return (err) ? res.send(400)
                                                 : res.send(404);
                                  }
                                });
        });

app.delete('/api/users/:id',
          function (req, res) {
            return UserModel.findByIdAndRemove(req.params.id)
                            .select('email firstName lastName')
                            .exec(function (err, user) {
                                    if ((!err) && (user != null)) {
                                      console.log("removed");
                                      return res.status(200).send(user);
                                    } else {
                                      console.log(err);
                                      return (err) ? res.status(400).end()
                                                   : res.status(404).end();
                                    }
                                  });
          });

app.post('/api/recaptcha/verify',
         function (req, res) {
           var data = {
             remoteip: req.connection.remoteAddress,
             challenge: req.body.challenge,
             response: req.body.response
           };
           var service = new recaptcha(RC_PUBLIC_KEY, RC_PRIVATE_KEY, data);

           service.verify(function (success, errorCode) {
                            var result = { isValid: false, isError: false };
                            if (success) {
                              result.isValid = true;
                            } else {
                             console.log(String.format('Recaptcha error: {0}', errorCode));
                             result.isError = (errorCode != 'incorrect-captcha-sol');
                            }
                            res.status(200)
                               .send(result);
                          });
         });

app.get('/api/auth/exists/:email',
        function (req, res) {
          return UserModel.findOne()
                          .where('email').equals(req.params.email)
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    console.log(String.format("TypeOf(User): {0}, err: {1}", typeof(user), err));
                                    console.log(String.format("Email: {0}", req.params.email));
                                    return res.status(200).send({ exists: true });
                                  } else {
                                    console.log(err);
                                    return res.status(200).send({ exists: false });
                                  }
                                });
        });

app.get('/api/auth/with/:email/and/:password',
        function (req, res, next) {
          return UserModel.findOne()
                          .where('email').equals(req.params.email)
                          .where('password').equals(req.params.password)
                          .select('email firstName lastName')
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    console.log(String.format("User: {0}, err: {1}", typeof(user), err));
                                    console.log(String.format("Email: {0}, Password: {1}", req.params.email, req.params.password));
                                    console.log(String.format("Id: {0}, _id: {1}, User: {2}", user._id.toString(), user._id, JSON.stringify(user)));
                                    signIn(user._id.toString(), res, function (err, token) {
                                      if (!err) {
                                        res.status(200).send(token);
                                      }
                                      else {
                                        res.status(400).end();
                                      }
                                    });
                                  } else {
                                    console.log(err);
                                    return ((err) ? res.status(400)
                                                  : res.status(404)).end();
                                  }
                                });
        });

app.put('/api/auth/reset/:email',
        function (req, res, next) {
          var newPassword = String.generatePassword(12, true, true);
          return UserModel.findOneAndUpdate({ email: req.params.email },
                                            { $set: { password: String.md5(newPassword),
                                              modified: Date.now() } },
                                            {  })
                          .select('email firstName lastName')
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    var templates = loadTemplates("reset_password");
                                    var mail = {
                                      from: "Chumster <noreply@chumster.us>",
                                      to: req.params.email,
                                      subject: "Password Reset Notification",
                                      text: String.format(templates.text, newPassword),
                                      html: String.format(templates.html, newPassword)
                                    }

                                    smtpTransport.sendMail(mail, function (error, response) {
                                      if (error) {
                                        console.log(error);
                                      } else {
                                        console.log("Message sent: " + response.message);
                                      }

                                      try {
                                        smtpTransport.close();
                                      } catch (e) {
                                        console.log(JSON.stringify(e));
                                      }

                                      return res.status(200)
                                                .send(JSON.stringify({ 'passwordReset': !error }));
                                    });
                                  } else {
                                    return ((err) ?
                                            res.status(400)
                                      :
                                            res.status(404)).end();
                                  }
                                });
        });

app.delete('/api/auth/logout',
           function (req, res) {
             var authTokenId = req.headers[auth_header];
             return AuthTokenModel.findByIdAndRemove(authTokenId,
                                                     function (err, token) {
                                                       if ((err) || (token == null)) {
                                                         console.log(err);
                                                         if (err) {
                                                           return res.send(400);
                                                         }
                                                         else {
                                                           return res.send(404);
                                                         }
                                                       } else {
                                                         console.log("removed");
                                                         return res.status(200).send('Logged Out');
                                                       }
                                                     });
           });

var FriendsModel = mongoose.model('Friends', Friends);
app.get('/api/friends/',
        function (req, res) {
          var authTokenId = req.headers[auth_header];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ?
                                       data.user :
                                       null;
                            if ((!err) && (user)) {
                              FriendsModel.find({ $or: [
                                                         { user: user._id },
                                                         { friend: user._id }
                                                       ] })
                                          .populate([
                                                      { path: 'user',
                                                        match: { _id: { $ne: user._id } },
                                                        select: 'email firstName lastName',
                                                        model: 'User' },
                                                      { path: 'friend',
                                                        match: { _id: { $ne: user._id }},
                                                        select: 'email firstName lastName',
                                                        model: 'User' }
                                                    ])
                                          .lean()
                                          .exec(function (err, friends) {
                                                  // Do something here...
                                                  if (!err) {
                                                    return res.status(200)
                                                              .send(friends);
                                                  } else {
                                                    return res.send(400);
                                                  }
                                                });
                            }
                          });
        });

var ProductModel = mongoose.model('Product', Product);
app.get('/api/products',
        function (req, res) {
          var authTokenId = req.headers[auth_header];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ? data.user
                                              : null;
                            if ((!err) && (user)) {
                              ProductModel.find(function (err, products) {
                                                  if ((!err) && products != null) {
                                                    return res.status(200)
                                                              .send(products);
                                                  } else {
                                                    console.log(err);
                                                    return res.status(400)
                                                              .send('Bad Request');
                                                  }
                                                });
                            }
                          });
        });

app.get('/api/products/:id',
        function (req, res) {
          var authTokenId = req.headers[auth_header];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ? data.user
                                              : null;
                            if ((!err) && (user)) {
                              return ProductModel.findById(req.params.id,
                                                           function (err, product) {
                                                             if (!err) {
                                                               if (product == null) {
                                                                 return res.send(404);
                                                               }

                                                               return res.status(200).send(product);
                                                             } else {
                                                               console.log(err);
                                                               return res.send(400);
                                                             }
                                                           });
                            }
                          });
        });

app.post('/api/products',
         function (req, res) {
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
                                   return res.status(201)
                                             .send(product);
                                 } else {
                                   console.log(err);
                                   return res.status(400)
                                             .end();
                                 }
                               });
         });

app.put('/api/products/:id',
        function (req, res) {
          return ProductModel.findById(req.params.id,
                                       function (err, product) {
                                         product.title = req.body.title;
                                         product.description = req.body.description;
                                         product.style = req.body.style;

                                         return product.save(function (err) {
                                           if ((!err) && (product != null)) {
                                             console.log("updated");
                                             return res.status(200)
                                                       .send(product);
                                           } else {
                                             console.log(err);
                                             return res.send(400);
                                           }
                                         });
                                       });
        });

app.delete('/api/products/:id',
           function (req, res) {
             return ProductModel.findById(req.params.id,
                                          function (err, product) {
                                            return product.remove(function (err) {
                                                                    if ((!err) && (product != null)) {
                                                                      console.log("removed");
                                                                      return res.status(200)
                                                                                .send(product);
                                                                    } else {
                                                                      console.log(err);
                                                                      return res.send(400);
                                                                    }
                                                                  });
                                          });
           });

app.use(function (req, res) {
  // Use res.sendfile, as it streams instead of reading the file into memory.
  res.sendFile(__dirname + '/public/index.html');
});

// Launch server
app.listen(4242);
