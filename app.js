'use strict';

/**
 * @typedef {Object} MailTemplate
 * @property text {String} The formatted text of the mail body.
 * @property html {String} The formatted Html of the mail body.
 */

/**
 * @author Sal Sanfilippo
 * @constructor Includes
 * @description Include required scripts.
 * @property object {object} Include Object extension methods
 * @property string {object} Include String extension methods
 **/
var Includes = {
                 object: require('./public/js/object.js'),
                 string: require('./public/js/string.js')
               };

// Module imports
var applicationRoot = __dirname,
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    errorHandler = require('errorhandler'),
    express = require('express'),
    fs = require('fs-extra'),
    logger = require('winston'),
    mailer = require('nodemailer'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    multipart = require('connect-multiparty'),
    path = require('path'),
    recaptcha = require('recaptcha').Recaptcha,
    sync = require('synchronize');

// Make JSONfn available to other modules
global.JSONfn = require('json-fn');
global.applicationRoot = applicationRoot;

/**
 * @description The Google Recaptcha Api Public Key.
 * @constant RC_PUBLIC_KEY
 * @type {String}
 */
var RC_PUBLIC_KEY = '6Leguf0SAAAAABh6LiAD36ISmoBdacap4tMebrhz';

/**
 * @description The Google Recaptcha Api Private Key.
 * @constant RC_PRIVATE_KEY
 * @type {String}
 */
var RC_PRIVATE_KEY = '6Leguf0SAAAAAJzntgEjN-1OTV06mrk9Rj_9rulH';

/**
 * @description The port number express will bind.
 * @constant PORT
 * @type {Number}
 */
var PORT = 4242;

var multipartHandler = multipart();
/**
 * @author Sal Sanfilippo
 * @version 1.0.0
 * @description
 * <style>
 * ul.custom {
 *   list-style: none;
 * }
 *
 * ul.custom li:before {
 *   color: #212226;
 *   content: '» ';
 *   font-size: 1.2em;
 *   font-weight: bold;
 * }
 * </style>
 * node.js application<br/><br/>
 * <b>Required Modules:</b><br/>
 * <p style="font-family: Consolas, Monaco, 'Andale Mono', monospace; margin-top: 0px;">
 * {@link https://github.com/expressjs/body-parser|body-parser},
 * {@link http://nodejs.org/api/crypto.html|crypto},
 * {@link http://www.nodemailer.com/|nodemailer},
 * {@link https://github.com/expressjs/errorhandler|error-handler},
 * {@link http://expressjs.com/|express},
 * {@link http://nodejs.org/docs/v0.3.1/api/fs.html#file_System|fs},
 * {@link http://www.eslinstructor.net/jsonfn/|json-fn},
 * {@link https://github.com/expressjs/method-override|method-override},
 * {@link http://mongoosejs.com/|mongoose},
 * {@link https://github.com/edwardhotchkiss/mongoose-paginate|mongoose-paginate},
 * {@link http://momentjs.com/|moment},
 * {@link http://www.nodemailer.com/|nodemailer},
 * {@link http://nodejs.org/api/path.html|path},
 * {@link https://www.npmjs.org/package/recaptcha#readme|recaptcha},
 * {@link http://alexeypetrushin.github.io/synchronize/docs/index.html|synchronize},
 * {@link https://github.com/flatiron/winston|winston}
 * </p>
 *
 */
var app = express();

// Use Smtp Protocol to send Email
global.smtpTransport = mailer.createTransport('SMTP',                             // 'Gmail'
                                              {
                                                host: 'mail.sanfilippo.ws',
                                                port: 465,
                                                secureConnection: true,
                                                auth: {
                                                  user: 'no-reply@sanfilippo.ws', // 'chumster.postmaster@gmail.com'
                                                  pass: 'FuzzyL0gic!'             // 'Chumster!'
                                                },
                                                debug: false
                                              });

// Database
mongoose.connect('mongodb://localhost/applepoc');

// Config

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.static(path.join(applicationRoot, 'public')));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Auth-Token');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  app.disable('etag');

  next();
});

app.get('/api', function (req, res) {
  res.sendFile(path.join(applicationRoot, 'public', 'templates', 'api.html'));
});

app.get('/', function (req, res) {
  res.redirect('index.html');
});

var AuthToken = require('./models/authtoken.js');
var User = require('./models/user.js');
var Friends = require('./models/friends.js');
var Product = require('./models/product.js');

var rest = require('./controllers/rest.js');

app.get('/api/users', rest.retrieveUsers);
app.get('/api/users/:id', rest.retrieveUser);
app.post('/api/users', rest.createUser);
app.put('/api/users/:id', rest.updateUser);
app.put('/api/users/:id/password', rest.changeUserPassword);
app.delete('/api/users/:id',rest.deleteUser);
app.post('/api/recaptcha/verify', rest.verifyRecaptcha);
app.get('/api/auth/exists/:email', rest.userExists);
app.get('/api/auth/with/:email/and/:password', rest.loginUser);
app.put('/api/auth/reset/:email', rest.resetPassword);
app.delete('/api/auth/logout', rest.logoutUser);

app.get('/api/friends/',
        function (req, res) {
          var authTokenId = req.headers[AUTH_HEADER];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ? data.user : null;
                            if ((!err) && (user)) {
                              Friends.find({ $or: [
                                                    { user: user._id },
                                                    { friend: user._id }
                                                  ] })
                                     .populate([
                                                 {
                                                   path: 'user',
                                                   match: { _id: { $ne: user._id } },
                                                   select: 'email firstName lastName',
                                                   model: 'User'
                                                 },
                                                 {
                                                   path: 'friend',
                                                   match: { _id: { $ne: user._id }},
                                                   select: 'email firstName lastName',
                                                   model: 'User'
                                                 }
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

app.get('/api/products',
        function (req, res) {
          var authTokenId = req.headers[AUTH_HEADER];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ? data.user
                                              : null;
                            if ((!err) && (user)) {
                              Product.find(function (err, products) {
                                                  if ((!err) && products != null) {
                                                    return res.status(200)
                                                              .send(products);
                                                  } else {
                                                    logger.error(err);
                                                    return res.status(400)
                                                              .send('Bad Request');
                                                  }
                                                });
                            }
                          });
        });

app.get('/api/products/:id',
        function (req, res) {
          var authTokenId = req.headers[AUTH_HEADER];
          verifyAuthToken(authTokenId,
                          res,
                          function (err, data) {
                            var user = (data) ? data.user
                                              : null;
                            if ((!err) && (user)) {
                              return Product.findById(req.params.id,
                                                           function (err, product) {
                                                             if (!err) {
                                                               if (product == null) {
                                                                 return res.send(404);
                                                               }

                                                               return res.status(200)
                                                                         .send(product);
                                                             } else {
                                                               logger.error(err);
                                                               return res.send(400);
                                                             }
                                                           });
                            }
                          });
        });

app.post('/api/products',
         function (req, res) {
           logger.info("POST: ");
           logger.info(req.body);

           var product = new Product({
             title: req.body.title,
             description: req.body.description,
             style: req.body.style
           });

           return product.save(function (err) {
                                 if (!err) {
                                   logger.info("created");
                                   return res.status(201)
                                             .send(product);
                                 } else {
                                   logger.error(err);
                                   return res.status(400)
                                             .end();
                                 }
                               });
         });

app.put('/api/products/:id',
        function (req, res) {
          return Product.findById(req.params.id,
                                       function (err, product) {
                                         product.title = req.body.title;
                                         product.description = req.body.description;
                                         product.style = req.body.style;

                                         return product.save(function (err) {
                                           if ((!err) && (product != null)) {
                                             logger.info("updated");
                                             return res.status(200)
                                                       .send(product);
                                           } else {
                                             logger.error(err);
                                             return res.send(400);
                                           }
                                         });
                                       });
        });

app.delete('/api/products/:id',
           function (req, res) {
             return Product.findById(req.params.id,
                                          function (err, product) {
                                            return product.remove(function (err) {
                                                                    if ((!err) && (product != null)) {
                                                                      logger.info("removed");
                                                                      return res.status(200)
                                                                                .send(product);
                                                                    } else {
                                                                      logger.error(err);
                                                                      return res.send(400);
                                                                    }
                                                                  });
                                          });
           });

app.post('/api/photo',
         multipartHandler,
         function (req, res) {
           console.log(req.body, req.files);
           res.status(200)
              .send('uploaded');
         });

app.use(function (req, res) {
  // Use response.sendfile, as it streams instead of reading the file into memory.
  res.sendFile('%s/public/index.html'.sprintf(__dirname));
});

logger.info('Server listening on port {0}'.format(PORT));

// Launch server
app.listen(PORT);
