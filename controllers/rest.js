'use strict'

/**
 * @author Sal Sanfilippo
 * @description Loads the text and html body parts.
 *
 * @param {String} template - The name of the template to load.
 * @returns {MailTemplate} MailTemplate instance containing the formatted text and Html.
 * @see {@link http://www.nodemailer.com/|nodemailer}
 */
function loadTemplates(template) {
  var htmlPath = path.join(global.applicationRoot,
                           'public/templates/email/{0}.html'.format(template));
  var textPath = path.join(global.applicationRoot,
                           'public/templates/email/{0}.txt'.format(template));

  var html = fs.readFileSync(htmlPath, "utf8");
  var text = fs.readFileSync(textPath, "utf8");

  return {text: text, html: html};
}

/**
 * @apiDefine Rest Title Descriptions
 */

var fs = require('fs-extra'),
    logger = require('winston'),
    mongoose = require('mongoose'),
    AuthToken = require('../models/authtoken.js'),
    User = require('../models/user.js'),
    Friends = require('../models/friends.js'),
    Product = require('../models/product.js'),
    Photo = require('../models/photo.js'),
    PhotoAlbum = require('../models/photoalbum.js'),
    path = require('path');

var AUTH_HEADER = 'auth-token';

function refreshAuthToken(token, res, callback) {
  var expires = new Date();
  expires.setMinutes(expires.getMinutes() + 20);

  token.expires = expires;

  token.save(function (err) {
    callback(err, token);
  });
}

function verifyAuthToken(authTokenId, res, callback) {
  return AuthToken.findById(authTokenId)
                  .populate({ path: 'user',
                              select: 'email firstName lastName birthDate',
                              model: 'User' })
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
  return AuthToken.findOne({ user: userId })
                  .populate({ path: 'user',
                              select: 'email firstName lastName birthDate',
                              model: 'User' })
                  .exec(function (err, token) {
                          if (!err) {
                            if (token == null) {
                              token = new AuthToken();
                              token.user = mongoose.Types.ObjectId(userId);
                              //token.populate({ path: 'user',
                              //                 select: 'email firstName lastName',
                              //                 model: 'User' });
                              token.expires = new Date();
                            }

                            logger.info("token: %s", JSON.stringify(token));
                            refreshAuthToken(token, res, function (err, data) {
                              if (token.user.constructor.name == 'ObjectID') {
                                AuthToken.findById(token._id)
                                         .populate({ path: 'user',
                                                     select: 'email firstName lastName birthDate',
                                                     model: 'User' })
                                         .exec(function (err, token) {
                                                 callback(err, token);
                                               });
                              } else {
                                callback(err, token);
                              }
                            });
                          } else {
                            res.status(400)
                              .end();
                            callback(err, token);
                          }
                        });
}

module.exports = {
  /* Begin User Resource */

  /**
   * @api {get} /api/users retrieveUsers
   * @apiGroup User
   *
   * @apiDescription Retrieves a list of registered users.
   * @apiSuccess (200) {User[]} users An array of registered users.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     [
   *      {
   *        _id: "5435eb0ad048c587b9bf6e18",
   *        email: "sal@sanfilippo.ws",
   *        firstName: "Salvatore",
   *        lastName: "Sanfilippo",
   *        birthDate: "2014-04-29T07:00:00.000Z"
   *      },
   *      {
   *        _id: "5439d1466b5870476d4a3de8",
   *        email: "mschoonbrood@gmail.com",
   *        firstName: "Monique",
   *        lastName: "Schoonbrood",
   *        birthDate: "1960-08-06T07:00:00.000Z"
   *      }
   *     ]
   * @apiError (400) none Non-specific error
   * @apiErrorExample {string} Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   **/
  retrieveUsers: function (req, res) {
                   return User.find({},
                                    'email firstName lastName birthDate',
                                    function (err, users) {
                                      if ((!err) && (users != null)) {
                                        return res.status(200)
                                                  .send(users);
                                      } else {
                                        logger.error(err);
                                        return res.status(400)
                                                  .end();
                                      }
                                    });
  },

  /**
   * @api {get} /api/users/:id retrieveUser
   * @apiGroup User
   *
   * @apiParam {String} id User Id of user to retrieve (request.params.id).
   *
   * @apiDescription Retrieves a registered user.
   * @apiSuccess (200) {User} user The registered user.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       _id: "5435eb0ad048c587b9bf6e18",
   *       email: "sal@sanfilippo.ws",
   *       firstName: "Salvatore",
   *       lastName: "Sanfilippo",
   *       birthDate: "2014-04-29T07:00:00.000Z"
   *     }
   * @apiError (404) none User specified by <code>id</code> does not exist.
   * @apiErrorExample {String} 404 Error-Response:
   *     HTTP/1.1 404 Not Found
   *       Not Found
   * @apiError (400) none Non-specific error
   * @apiErrorExample {String} 400 Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   **/
  retrieveUser: function (req, res) {
                  return User.findById(req.params.id,
                                       'email firstName lastName birthDate',
                                       function (err, user) {
                                         if ((!err) && (user != null)) {
                                           return res.status(200)
                                                     .send(user);
                                         } else {
                                           logger.error(err);
                                           return (err) ? res.status(400)
                                                             .send(err.message || '')
                                                        : res.status(404)
                                                             .end();
                                         }
                                       });
                },

  /**
   * @api {post} /api/users/ createUser
   * @apiGroup User
   *
   * @apiParam {String} email  The user's email address (request.body.email).
   * @apiParam {String} firstName The user's first name (request.body.firstName).
   * @apiParam {String} lastName The user's last name (request.body.lastName).
   * @apiParam {String} birthDate The user's birth date (request.body.birthDate).
   * @apiParam {String} password The user's first name (request.body.password).
   *
   * @apiDescription Creates a new user.
   * @apiParamExample {json} Request-Example:
   *     {
   *       email: "sal@sanfilippo.ws",
   *       firstName: "Salvatore",
   *       lastName: "Sanfilippo",
   *       birthDate: "2014-04-29T07:00:00.000Z"
   *       password: "2b29f8130b128ab61a198935fdf6afc2"
   *     }
   * @apiSuccess (201) {AuthToken} token The authentication token for the new user.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 201 OK
   *     {
   *       _id: "54877e659d4b09261d780e70",
   *       expires: "2014-12-09T23:17:41.626Z",
   *       user:
   *       {
   *       _id: "5435eb0ad048c587b9bf6e18",
   *       email: "sal@sanfilippo.ws",
   *       firstName: "Salvatore",
   *       lastName: "Sanfilippo"
   *       }
   *     }
   * @apiError (400) none Non-specific error
   * @apiErrorExample {String} 400 Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   **/
  createUser: function (req, res) {
                logger.info("POST: ");
                logger.info(req.body);

                var user = new User({
                  email: req.body.email,
                  password: req.body.password,
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  birthDate: req.body.birthDate
                });

                return user.save(function (err) {
                  if ((!err) && (user != null)) {
                    logger.info("User created %s", user.email);
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
                         logger.error(err);
                         return res.status(400)
                                   .send(err.errors);
                       }
                     });
              },

  /**
   * @api {put} /api/users/:id updateUser
   * @apiGroup User
   *
   * @apiParam {String} id User Id of user to update (request.params.id).
   *
   * @apiParam {String} firstName The user's first name (request.body.firstName).
   * @apiParam {String} lastName The user's last name (request.body.lastName).
   * @apiParam {String} birthDate The user's birth date (request.body.birthDate).
   *
   * @apiDescription Updates a registered user's profile.
   * @apiSuccess (200) {User} user The registered user.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       _id: "5435eb0ad048c587b9bf6e18",
   *       email: "sal@sanfilippo.ws",
   *       firstName: "Salvatore",
   *       lastName: "Sanfilippo",
   *       birthDate: "2014-04-29T07:00:00.000Z"
   *     }
   * @apiError (404) none User specified by <code>id</code> does not exist.
   * @apiErrorExample {String} 404 Error-Response:
   *     HTTP/1.1 404 Not Found
   *       Not Found
   * @apiError (400) none Non-specific error
   * @apiErrorExample {String} 400 Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   **/
  updateUser: function (req, res) {
                return User.findOneAndUpdate({ _id: req.params.id },
                                             { $set: { lastName: req.body.lastName,
                                                       firstName: req.body.firstName,
                                                       birthDate: req.body.birthDate,
                                                       modified: Date.now() } },
                                             {  })
                           .select('email firstName lastName birthDate')
                           .exec(function (err, user) {
                             if ((!err) && (user != null)) {
                               logger.info(user);
                               return res.status(200)
                                         .send(user);
                             } else {
                               logger.error(err);
                               return (err) ? res.status(400)
                                                 .send(err.errors || err.message || 'Unknown Error')
                                            : res.status(404)
                                                 .end();
                            }
                          });
              },
  changeUserPassword: function (req, res) {
                        return User.findOneAndUpdate({ _id: req.params.id,
                                                       password: req.body.oldPassword },
                                                     { $set: { password: req.body.newPassword,
                                                               modified: Date.now() } },
                                                     {  })
                                   .select('email firstName lastName')
                                   .exec(function (err, user) {
                                     if ((!err) && (user != null)) {
                                       logger.info(user);
                                       return res.status(200)
                                                 .send(user);
                                     } else {
                                       logger.error(err);
                                       return (err) ? res.send(400)
                                                    : res.send(404);
                                     }
                                   });
                      },
  deleteUser: function (req, res) {
                return User.findByIdAndRemove(req.params.id)
                           .select('email firstName lastName')
                           .exec(function (err, user) {
                                   if ((!err) && (user != null)) {
                                     logger.info("Removed user (_id: %s)", req.params.id);
                                     return res.status(200)
                                               .send(user);
                                   } else {
                                     logger.error(err);
                                     return (err) ? res.status(400)
                                                       .end()
                                                  : res.status(404)
                                                       .end();
                                   }
                                 });
              },
  /* End User Resource */

  /* Begin Recaptcha Resource */
  /**
   * @api {post} /api/recaptcha/verify verifyRecaptcha
   * @apiGroup Recaptcha
   *
   * @apiParam {Recaptcha} recaptcha The challenge and response to verify.
   * @apiParamExample {json} Request-Example:
   *     {
   *       challenge: "03AHJ_VutKv5WG9GVXoAeTzQGwcrD9jwnGCIBjvOeO090zbEWRrgCQoXTT7vxkO4uPS-my-Z9iU0EYPrUL-8ZVRs4gXMxvtd9ZODYcYDbalz6ptK-OewtW5vkK8jPPFF_LyBhfYjeqH4corlZFiJEF3mlQSPTyAREGwxoEK3HTNQWwX_ZlaCfNVzPhFpn3lfMr1vic9HBdjAAyZO-v_46BPYiCzu72WXALH2U56LTEq-HCelVZCxvfjMHgOQq1-sfrhxvZsmxi19Ous3XNB72K70rDsUTzWVHGZSEJtGebErjHGhB-7JIOgrY",
   *       result: "273"
   *     }
   *
   * @apiDescription Validates a Recaptcha response.
   * @apiSuccess (200) {RecaptchaResponse} response The results of verification.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       isValid: true,
   *       isError: false,
   *       errorMessage: ""
   *     }
   * @apiError (400) none Non-specific error
   * @apiErrorExample {String} 400 Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   */
  verifyRecaptcha: function (req, res) {
                     var payload = {
                       remoteip: req.connection.remoteAddress,
                       challenge: req.body.challenge,
                       res: req.body.response
                     };

                     var service = new recaptcha(RC_PUBLIC_KEY, RC_PRIVATE_KEY, payload);

                     service.verify(function (success, errorCode) {
                                      var result = {
                                        isValid: false,
                                        isError: false,
                                        errorMessage: ''
                                      };

                                      if (success) {
                                        result.isValid = true;
                                      } else {
                                        logger.info('Recaptcha error: %s', errorCode);

                                        result.isError = (errorCode != 'incorrect-captcha-sol');
                                        result.errorMessage = (result.isError) ? errorCode
                                                                               : 'Invalid response';
                                      }
                                      res.status(200)
                                         .send(result);
                     });
                   },
  /* End Recaptcha Resource */

  /* Begin Auth Resource */
  /**
   * @api {get} /api/auth/exists/:email userExists
   * @apiGroup Auth
   *
   * @apiParam {String} email Email address to lookup (request.params.email).

   * @apiDescription Determines if a user is already registered.
   * @apiSuccess (200) {boolean} response True if the email address is regitered. False otherwise.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     true
   * @apiError (400) none Non-specific error
   * @apiErrorExample {String} 400 Error-Response:
   *     HTTP/1.1 400 Bad Request
   *       Bad Request
   */
  userExists: function (req, res) {
                return User.findOne()
                           .where('email').equals(req.params.email)
                           .exec(function (err, user) {
                                   if ((!err) && (user != null)) {
                                     logger.info("TypeOf(User): %s, err: %s", typeof(user), JSON.stringify(err));
                                     logger.info("Email: %s", req.params.email);
                                     return res.status(200)
                                               .send(true);
                                   } else {
                                     logger.error(err);
                                     return res.status(200)
                                               .send(false);
                                   }
                                 });
              },
  loginUser: function (req, res, next) {
               return User.findOne()
                          .where('email').equals(req.params.email)
                          .where('password').equals(req.params.password)
                          .select('email firstName lastName birthDate')
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    logger.info("User: %s, err: %s".sprintf(user, err));
                                    logger.info("Email: %s, Password: %s".sprintf(req.params.email, req.params.password));
                                    logger.info("Id: %s, _id: %s, User: %s".sprintf(user._id.toString(), user._id, JSON.stringify(user)));
                                    signIn(user._id.toString(),
                                           res,
                                           function (err, token) {
                                             if (!err) {
                                               res.status(200)
                                                  .send(token);
                                             } else {
                                               res.status(400)
                                                  .end();
                                             }
                                           });
                                  } else {
                                    logger.error(err);
                                    return ((err) ? res.status(400)
                                                  : res.status(404)).end();
                                  }
                                });
               },
  resetPassword: function (req, res, next) {
                   var newPassword = String.generatePassword(12, true, true);
                   return User.findOneAndUpdate({ email: req.params.email },
                                                { $set: { password: newPassword.md5(),
                                                  modified: Date.now() } },
                                                {  })
                              .select('email firstName lastName birthDate')
                              .exec(function (err, user) {
                                      if ((!err) && (user != null)) {
                                        var templates = loadTemplates("reset_password");
                                        var mail = {
                                          from: "Chumster <noreply@chumster.us>",
                                          to: req.params.email,
                                          subject: "Password Reset Notification",
                                          text: templates.text.format(newPassword),
                                          html: templates.html.format(newPassword)
                                        }

                                        global.smtpTransport.sendMail(mail,
                                                               function (error, response) {
                                                                 if (error) {
                                                                   logger.info(error);
                                                                 } else {
                                                                   logger.info("Message sent: %s", response.message);
                                                                 }

                                                                 try {
                                                                   smtpTransport.close();
                                                                 } catch (e) {
                                                                   logger.info(JSON.stringify(e));
                                                                 }

                                                                 return res.status(200)
                                                                           .send(JSON.stringify({ 'passwordReset': !error }));
                                                               });
                                      } else {
                                        return ((err) ? res.status(400)
                                                      : res.status(404)).end();
                                      }
                                    });
                 },
  logoutUser: function (req, res) {
                var authTokenId = req.headers[AUTH_HEADER];
                return AuthToken.findByIdAndRemove(authTokenId,
                                                   function (err, token) {
                                                     if ((err) || (token == null)) {
                                                       logger.error(err);
                                                       if (err) {
                                                         return res.send(400);
                                                       } else {
                                                         return res.send(404);
                                                       }
                                                     } else {
                                                       logger.info("removed");
                                                       return res.status(200)
                                                                 .send('Logged Out');
                                                     }
                                                   });
              },
  /* End Auth Resource */

  /* Begin Photo Resource */
  retrievePhotos: function(req, res) {

                  },

  retrievePhoto: function(req, res) {

                 },

  createPhoto: function(req, res) {
                 var image = req.files.photo.image;
                 var title = req.body.photo.title || image.name;
                 var description = req.body.photo.description || '';

                 var extension = path.extname(image.name);
                 if (extension==='..')
                   extension = '';
                 var filename = mongoose.Types.ObjectId() + extension;
                 var qualifiedFilename = path.join(applicationRoot, 'public', 'photos', filename);

                 fs.rename(image.path,
                           qualifiedFilename,
                           function(err) {
                             logger.error(err);
                             if (err)
                               return res.send(400);

                             Photo.create({
                                            title: title,
                                            description: description,
                                            path: qualifiedFilename,
                                            modified: Date.now()
                                          },
                                          function (err) {
                                            if (err)
                                              return res.send(400);
                                            res.redirect('/');
                                          });
                           });

                 },

  updatePhoto: function(req, res) {

               },

  deletePhoto: function(req, res) {

               }

  /* End Photo Resource */
};
