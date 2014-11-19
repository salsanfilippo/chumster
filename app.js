String.format = function () {
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

String.utf8Encode = function (string) {
  string = string.replace(/\r\n/g, "\n");
  var utftext = "";

  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);

    if (c < 128) {
      utftext += String.fromCharCode(c);
    }
    else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }

  return utftext;
};

String.md5 = function (string) {
  function convertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;

    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }

    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

    return lWordArray;
  }

  function wordToHex(lValue) {
    var wordToHexValue = "",
        wordToHexValue_temp = "",
        lByte, lCount;

    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }

    return wordToHexValue;
  }

  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }

    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x, y, z) {
    return (x & y) | ((~x) & z);
  }

  function G(x, y, z) {
    return (x & z) | (y & (~z));
  }

  function H(x, y, z) {
    return (x ^ y ^ z);
  }

  function I(x, y, z) {
    return (y ^ (x | (~z)));
  }

  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  var x = new Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
  var S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
  var S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
  var S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

  string = String.utf8Encode(string);

  x = convertToWordArray(string);

  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

  return temp.toLowerCase();
}

String.generatePassword = function (length, inclNumbers, inclSymbols) {
  var vowels = 'aeiou'.split('');
  var constonants = 'bcdfghjklmnpqrstvwxyz'.split('');
  var symbols = '!@#$%^&*?'.split('');
  var word = '', i, num;

  if (!length) {
    length = 8;
  }

  var inclOffset = 0;
  if (inclNumbers) {
    inclOffset += 3;
  }

  if (inclSymbols) {
    inclOffset += 1;
  }

  for (i = 0; i < (length - inclOffset); i++) {
    var letter;

    if (i % 2 == 0) { // even = vowels
      letter = vowels[Math.floor(Math.random() * 4)];
    } else {
      letter = constonants[Math.floor(Math.random() * 20)];
    }

    word += (i == 0) ? letter.toUpperCase()
                     : letter;
  }

  if (inclNumbers) {
    num = Math.floor(Math.random() * 99) + '';

    if (num.length == 1) {
      num = '00' + num;
    } else if (num.length == 2) {
      num = '0' + num;
    }

    word += num;
  }

  if (inclSymbols) {
    word += symbols[Math.floor(Math.random() * 8)];
  }

  return word.substr(0, length);
}

function loadTemplates(template) {
  var htmlPath = path.join(application_root,
                           String.format('public/templates/email/{0}.html', template));
  var textPath = path.join(application_root,
                           String.format('public/templates/email/{0}.txt', template));

  var html = fs.readFileSync(htmlPath, "utf8");
  var text = fs.readFileSync(textPath, "utf8");

  return { text: text, html: html };
}

var application_root = __dirname,
  express = require('express'),
  path = require('path'),
  sync = require('synchronize'),
  mongoose = require('mongoose'),
  mongoosePaginate = require('mongoose-paginate'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  mailer = require("nodemailer"),
  fs = require("fs"),
  recaptcha = require('recaptcha').Recaptcha;

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

/************************************************
 * Method: GET                                  *
 * Path: /api/users/:id                         *
 * Params: id - User Id to find                 *
 * Returns: A registered user                   *
 ************************************************/
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

/************************************************
 * Method: POST                                 *
 * Path: /api/users                             *
 * Params: None                                 *
 * Payload: email - user's email address        *
 *          password - user's password          *
 *          firstName - user's first name       *
 *          lastName - user's last name         *
 *          birthDate - user's birth date       *
 * Returns: A newly registered user             *
 ************************************************/
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
                            res.status(200).send(result);
                          });
         });

app.get('/api/auth/exists/:email',
        function (req, res) {
          return UserModel.findOne()
                          .where('email').equals(req.params.email)
                          .exec(function (err, user) {
                                  if ((!err) && (user != null)) {
                                    console.log(String.format("TypeOf(User): {0}, err: {1}", typeof(user), err));
                                    console.log(String.format("Email: {0}, Password: {1}", req.params.email, req.params.password));
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
