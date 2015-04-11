'use strict';

if (!String) {
  // This will never execute. Hack to get extension method JSDoc to generate.
  (function() {
    /**
     * @description Placeholder for String class. The methods below are extension methods
     * for the builtin String type.
     * @returns {String}
     * @constructor String
     */
    function __String() {
      return this;
    }
  })();
}

if (!String.EMPTY) {
  /**
   * @description An empty string.
   * @constant EMPTY
   * @type {String}
   * @memberof String
   */
  String.EMPTY = '';
}

if (!String.equals) {
  /**
   * @description Compares two strings for equality.
   * @method equals
   * @memberof String
   * @param string {String} The first string to compare.
   * @param other {String} The second string to compare.
   * @returns {boolean} True if strings are equal. False otherwise.
   * @example var isEqual = String.equals('string', 'string');
   */
  String.equals = function (string, other) {
    return Object.extensions.equals(string, other);
  }
}

if (!String.format) {
  /**
   * @description Formats a string using numbered tokens e.g. 'Format string {0}, {1}, {2}'.
   * @method format
   * @memberof String
   * @param format {String} The format for the string.
   * @param params {...*} One or more parameters to format into the format string.
   * @returns {String} The formatted string.
   * @example String.format('Hello, my name is {0} {1}.', 'John', 'Doe');
   */
  String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var string = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
      // "gm" = RegEx options for Global search (more than one instance)
      // and for Multi-line search
      var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
      string = string.replace(regEx, arguments[i]);
    }

    return string;
  };
}

if (!String.generatePassword) {
  /**
   * @description Generate a password.
   * @method generatePassword
   * @memberof String
   * @param length {int} Length of the new password.
   * @param inclNumbers {boolean} Whether to include numbers in the new password.
   * @param inclSymbols {boolean} Whether to include symbols in the new password.
   * @returns {string} A new randomly generated password.
   */
  String.generatePassword = function (length, inclNumbers, inclSymbols) {
    var vowels = 'aeiou'.split(String.EMPTY);
    var constonants = 'bcdfghjklmnpqrstvwxyz'.split(String.EMPTY);
    var symbols = '!@#$%^&*?'.split(String.EMPTY);
    var word = String.EMPTY, i, num;

    if (!length)
      length = 8;

    var inclOffset = 0;
    if (inclNumbers)
      inclOffset += 3;
    if (inclSymbols)
      inclOffset += 1;

    for (i = 0; i < (length - inclOffset); i++) {
      var letter;

      if (i % 2 == 0) { // even = vowels
        letter = vowels[Math.floor(Math.random() * 4)];
      } else {
        letter = constonants[Math.floor(Math.random() * 20)];
      }

      word += (i == 0) ?
              letter.toUpperCase() :
              letter;
    }

    if (inclNumbers) {
      num = Math.floor(Math.random() * 99) + String.EMPTY;
      if (num.length == 1) num = '00' + num;
      else if (num.length == 2) num = '0' + num;
      word += num;
    }

    if (inclSymbols) {
      word += symbols[Math.floor(Math.random() * 8)];
    }

    return word.substr(0, length);
  };
}

if (!String.isNullOrEmpty) {
  /**
   * @description Determine if a string is null, undefined, or zero length.
   * @method isNullOrEmpty
   * @memberof String
   * @param string {String} The string to check.
   * @returns {boolean} True if null, undefined, or zero length. False otherwise.
   */
  String.isNullOrEmpty = function (string) {
    return !((typeof string == 'undefined' ||
              typeof string != 'string' ||
              string == null) ? false : string.trim() != String.EMPTY);
  };
}

if (!String.print) {
  /**
   * @description Prints a formatted string.
   * @method print
   * @memberof String
   * @param format {String} The format for the string.
   * @param params {...*} One or more parameters to format into the format string.
   * @example String.print('Hello, my name is {0} {1}.', 'John', 'Doe');
   * @see String.format
   */
  String.print = function() {
    console.log(String.format.apply(this, arguments));
  };
}

if (!String.printf) {
  /**
   * @description Prints a formatted string.
   * @method printf
   * @memberof String
   * @param format {String} The format for the string.
   * @param params {...*} One or more parameters to format into the format string.
   * @example String.printf('Hello, my name is %s %s, I am %d years old.', 'John', 'Doe', 46);
   * @see String.sprintf
   */
  String.printf = function() {
    console.log(String.sprintf.apply(this, arguments));
  };
}

if (!String.sprintf) {
  /**
   * @description Formats a string using tokens e.g. 'Format string %s, %d, %f'.
   * @method sprintf
   * @memberof String
   * @param format
   * The format string is composed of zero or more directives: ordinary characters (excluding %)
   * that are copied directly to the result, and conversion specifications, each of which results
   * in fetching its own parameter.<br/>
   * <br/>
   * Each conversion specification consists of a percent sign (%), followed by one or more of
   * these elements, in order:<br/>
   * <br/>
   * <ol style="padding-left: 20px;">
   *   <li>
   *   An optional sign specifier that forces a sign (- or +) to be used on a number. By default,
   *   only the - sign is used on a number if it's negative. This specifier forces positive numbers
   *   to have the + sign attached as well.
   *   </li>
   *   <li>
   *   An optional padding specifier that says what character will be used for padding the results
   *   to the right string size. This may be a space character or a 0 (zero character). The default
   *   is to pad with spaces. An alternate padding character can be specified by prefixing it with
   *   a single quote (').
   *   </li>
   *   <li>
   *   An optional alignment specifier that says if the result should be left-justified or
   *   right-justified. The default is right-justified; a - character here will make it left-justified.
   *   </li>
   *   <li>
   *   An optional number, a width specifier that says how many characters (minimum) this conversion
   *   should result in.
   *   </li>
   *   <li>
   *   An optional precision specifier in the form of a period (`.') followed by an optional
   *   decimal digit string that says how many decimal digits should be displayed for floating-point numbers.
   *   When using this specifier on a string, it acts as a cutoff point, setting a maximum character limit
   *   to the string.
   *   </li>
   *   <li>
   *     A type specifier that says what type the argument data should be treated as.
   *   </li>
   * </ol>
   * <span style="font-weight: bold; padding-left: 20px;">Possible types:</span>
   * <ul>
   *   <li>% - a literal percent character. No argument is required.</li>
   *   <li>b - the argument is treated as an integer, and presented as a binary number.</li>
   *   <li>c - the argument is treated as an integer, and presented as the character with that ASCII value.</li>
   *   <li>d - the argument is treated as an integer, and presented as a (signed) decimal number.</li>
   *   <li>e - the argument is treated as scientific notation (e.g. 1.2e+2). The precision specifier stands
   *     for the number of digits after the decimal point.</li>
   *   <li>E - like %e but uses uppercase letter (e.g. 1.2E+2).</li>
   *   <li>f - the argument is treated as a float, and presented as a floating-point number (locale aware).</li>
   *   <li>F - the argument is treated as a float, and presented as a floating-point number (non-locale aware).</li>
   *   <li>g - shorter of %e and %f.</li>
   *   <li>G - shorter of %E and %f.</li>
   *   <li>o - the argument is treated as an integer, and presented as an octal number.</li>
   *   <li>s - the argument is treated as and presented as a string.</li>
   *   <li>u - the argument is treated as an integer, and presented as an unsigned decimal number.</li>
   *   <li>x - the argument is treated as an integer and presented as a hexadecimal number (with lowercase letters).</li>
   *   <li>X - the argument is treated as an integer and presented as a hexadecimal number (with uppercase letters).</li>
   * </ul>
   * @param params {...*} One or more parameters to format into the format string.
   * @returns {String} The formatted string.
   */
  String.sprintf = function(format) {
    // Check for format definition
    if (typeof format != 'string') {
      throw "sprintf: The first arguments need to be a valid format string.";
    }

    /**
     * Define the regex to match a formatting string
     * The regex consists of the following parts:
     * percent sign to indicate the start
     * (optional) sign specifier
     * (optional) padding specifier
     * (optional) alignment specifier
     * (optional) width specifier
     * (optional) precision specifier
     * type specifier:
     *  % - literal percent sign
     *  b - binary number
     *  c - ASCII character represented by the given value
     *  d - signed decimal number
     *  f - floating point value
     *  o - octal number
     *  s - string
     *  x - hexadecimal number (lowercase characters)
     *  X - hexadecimal number (uppercase characters)
     */
    var r = new RegExp(/%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxX])/g);

    /**
     * Each format string is split into the following parts:
     * 0: Full format string
     * 1: sign specifier (+)
     * 2: padding specifier (0/<space>/'<any char>)
     * 3: if the padding character starts with a ' this will be the real
     *    padding character
     * 4: alignment specifier
     * 5: width specifier
     * 6: precision specifier including the dot
     * 7: precision specifier without the dot
     * 8: type specifier
     */
    var parts = [];
    var paramIndex = 1;
    var part;
    while (part = r.exec(format)) {
      // Check if an input value has been provided, for the current
      // format string (no argument needed for %%)
      if ((paramIndex >= arguments.length) && (part[8] != '%')) {
        throw "sprintf: At least one argument was missing.";
      }

      parts[parts.length] = {
        /* beginning of the part in the string */
        begin: part.index,
        /* end of the part in the string */
        end: part.index + part[0].length,
        /* force sign */
        sign: (part[1] == '+'),
        /* is the given data negative */
        negative: (parseFloat(arguments[paramIndex]) < 0) ? true : false,
        /* padding character (default: <space>) */
        padding: (part[2] == undefined)
                            ? (' ') /* default */
                            : ((part[2].substring(0, 1) == "'")
                                          ? (part[3]) /* use special char */
                                          : (part[2]) /* use normal <space> or zero */
                ),
        /* should the output be aligned left?*/
        alignLeft: (part[4] == '-'),
        /* width specifier (number or false) */
        width: (part[5] != undefined) ? part[5] : false,
        /* precision specifier (number or false) */
        precision: (part[7] != undefined) ? part[7] : false,
        /* type specifier */
        type: part[8],
        /* the given data associated with this part converted to a string */
        data: (part[8] != '%') ? String (arguments[paramIndex++]) : false
      };
    }

    var newString = "";
    var start = 0;
    // Generate our new formated string
    for(var i=0; i<parts.length; ++i) {
      // Add first unformated string part
      newString += format.substring(start, parts[i].begin);

      // Mark the new string start
      start = parts[i].end;

      // Create the appropriate pre-format substitution
      // This substitution is only the correct type conversion. All the
      // different options and flags haven't been applied to it at this
      // point
      var preSubstitution = "";
      switch (parts[i].type) {
        case '%':
          preSubstitution = "%";
          break;
        case 'b':
          preSubstitution = Math.abs(parseInt(parts[i].data)).toString(2);
          break;
        case 'c':
          preSubstitution = String.fromCharCode(Math.abs(parseInt(parts[i].data)));
          break;
        case 'd':
          preSubstitution = String(Math.abs(parseInt(parts[i].data)));
          break;
        case 'f':
          preSubstitution = (parts[i].precision === false)
                                          ? (String((Math.abs(parseFloat(parts[i].data)))))
                                          : (Math.abs(parseFloat(parts[i].data)).toFixed(parts[i].precision));
          break;
        case 'o':
          preSubstitution = Math.abs(parseInt(parts[i].data)).toString(8);
          break;
        case 's':
          preSubstitution = parts[i].data.substring(0, parts[i].precision
                                          ? parts[i].precision
                                          : parts[i].data.length); /* Cut if precision is defined */
          break;
        case 'x':
          preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toLowerCase();
          break;
        case 'X':
          preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toUpperCase();
          break;
        default:
          throw 'sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
      }

      // The % character is a special type and does not need further processing
      if (parts[i].type ==  "%") {
        newString += preSubstitution;
        continue;
      }

      // Modify the preSubstitution by taking sign, padding and width
      // into account

      // Pad the string based on the given width
      if (parts[i].width != false) {
        // Padding needed?
        if (parts[i].width > preSubstitution.length) {
          var origLength = preSubstitution.length;
          for(var j = 0; j < parts[i].width - origLength; ++j) {
            preSubstitution = (parts[i].alignLeft == true)
                                            ? (preSubstitution + parts[i].padding)
                                            : (parts[i].padding + preSubstitution);
          }
        }
      }

      // Add a sign symbol if necessary or enforced, but only if we are
      // not handling a string
      if (parts[i].type == 'b' || parts[i].type == 'd' ||
          parts[i].type == 'o' || parts[i].type == 'f' ||
          parts[i].type == 'x' || parts[i].type == 'X') {
        if (parts[i].negative == true) {
          preSubstitution = "-" + preSubstitution;
        } else if (parts[i].sign == true) {
          preSubstitution = "+" + preSubstitution;
        }
      }

      // Add the substitution to the new string
      newString += preSubstitution;
    }

    // Add the last part of the given format string, which may still be there
    newString += format.substring(start, format.length);

    return newString;
  };
}

if (!String.toBoolean) {
  /**
   * @description Converts a string to a boolean.
   * @method toBoolean
   * @memberof String
   * @param string {String} The string to convert to boolean.
   * @returns {boolean} True if the string is 'true' or 'yes'. False otherwise.
   * @example var isTrue = String.toBoolean('true');
   */
  String.toBoolean = function (string) {
    return (string.toLowerCase() === "true") ||
           (string.toLowerCase() === "yes");
  };
}

// Instance Extension Methods
if (!String.prototype.clone) {
  /**
   * @description Returns a new string containing a copy of the current string.
   * @method clone
   * @memberof String.prototype
   * @returns {String} A copy of the current string.
   * @example var newString = 'Hello World'.clone();
   */
  String.prototype.clone = function () {
    return Object.extensions.clone(this);
  };
}

if (!String.prototype.equals) {
  /**
   * @description Compares the current string to another string.
   * @method equals
   * @memberof String.prototype
   * @param other {String} The string to compare.
   * @returns {boolean} True if the current and other strings are equal. False otherwise.
   * @example var isEqual = 'string'.equals('string');
   */
  String.prototype.equals = function (other) {
    if (Object.extensions.isNullOrUndefined(other))
      return false;

    return this == other;
  };
}

if (!String.prototype.format) {
  /**
   * @description Formats a string using the current string as the format string.
   * Numbered tokens are used to insert values e.g. 'Format string {0}, {1}, {2}'.
   * @method format The format string is composed of zero or more directives:
   * ordinary characters (excluding %) that are copied directly to the result, and
   * conversion specifications, each of which results in fetching its own parameter.
   * @memberof String.prototype
   * @param params {...*} One or more parameters to format into the format string.
   * @returns {String} The formatted string.
   * @see String.format
   * @example 'Hello, my name is {0} {1}.'.sprintf('John', 'Doe');
   */
  String.prototype.format = function() {
    var args = [ this ];
    for (var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);

    return String.format.apply(this, args);
  };
}

if (!String.prototype.hashCode) {
  /**
   * @description Generates a hashcode for the current string.
   * @method hashCode
   * @memberof String.prototype
   * @returns {String} The hashcode for the current string.
   * @example 'Hello World'.hashCode();
   */
  String.prototype.hashCode = function () {
    return Object.extensions.hashCode(this);
  };
}

if (!String.prototype.ltrim) {
  /**
   * @description Creates a copy of the current string with the leading whitespace
   * removed.
   * @method ltrim
   * @memberof String.prototype
   * @returns {String} The current string with the leading spaces removed.
   * @example '   Hello World'.ltrim();
   */
  String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
  };
}

if (!String.prototype.md5) {
  /**
   * @description Generates a MD5 message digest for the current string instance.
   * @method md5
   * @memberof String.prototype
   * @returns {String} The MD5 message digest for the current string instance.
   * @example 'password'.md5();
   */
  String.prototype.md5 = function () {
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

    function utf8Encode(string) {
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

    var string = utf8Encode(this);

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
  };
}

if (!String.prototype.print) {
  /**
   * @description Prints a formatted string using the current string as the format string.
   * @method print
   * @memberof String.prototype
   * @param params {...*} One or more parameters to format into the format string.
   * @example 'Hello, my name is {0} {1}.'.print('John', 'Doe');
   * @see String.format
   */
  String.prototype.print = function() {
    var args = [ this ];
    for (var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);

    String.print.apply(this, args);
  };
}

if (!String.prototype.printf) {
  /**
   * @description Prints a formatted string using the current string as the format string.
   * @method printf
   * @memberof String.prototype
   * @param params {...*} One or more parameters to format into the format string.
   * @example 'Hello, my name is %s %s, I am %d years old.'.printf('John', 'Doe', 46);
   * @see String.sprintf
   */
  String.prototype.printf = function() {
    var args = [ this ];
    for (var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);

    return String.printf.apply(this, args);
  };
}

if (!String.prototype.rtrim) {
  /**
   * @description Creates a copy of the current string with the trailing whitespace
   * removed.
   * @method rtrim
   * @memberof String.prototype
   * @returns {String} The current string with the trailing spaces removed.
   * @example 'Hello World   '.rtrim();
   */
  String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
  };
}

if (!String.prototype.sprintf) {
  /**
   * @description Formats a string using the current string as the format string.
   * The format string uses tokens e.g. 'Format string %s, %d, %f'
   * @method sprintf
   * @memberof String.prototype
   * @param params {...*} One or more parameters to format into the format string.
   * @returns {String} The formatted string.
   * @see String.format
   * @example 'Hello, my name is %s %s, I am %d years old.'.sprintf('John', 'Doe', 46);
   */
  String.prototype.sprintf = function() {
    var args = [ this ];
    for (var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);

    return String.sprintf.apply(this, args);
  };
}

if (!String.prototype.toCamelCase) {
  /**
   * @description Creates a copy of the current string converted to camel case
   * based on word breaks. The words may be separated with dash, underscore,
   * period, or space.
   * @method toCamelCase
   * @memberof String.prototype
   * @returns {String} The current string converted to camel case.
   * @example 'hello_world'.toCamelCase();
   */
  String.prototype.toCamelCase = function() {
    // Where [-_ .] is the separator, you can add say '@' too
    // + is to handle repetition of separator
    // ? is to take care of preceding token
    // match nov(ember)? matches nov and november
    var result = this.replace(/[-_ .]+(.)?/g,
      function (match, p) {
        if (p) {
          return p.toUpperCase();
        }
        return String.EMPTY;
      }).replace(/[^\w]/gi, String.EMPTY); //strip unwanted characters
    return result;
  };
}

if (!String.prototype.toTitleCase) {
  /**
   * @description Creates a copy of the current string converted to title case.
   * @method toTitleCase
   * @memberof String.prototype
   * @returns {String} The current string converted to title case.
   * @example 'hello world'.toTitleCase();
   */
  String.prototype.toTitleCase = function () {
//    return this.replace(/\b\w/g,
//                        function (string) {
//                          return string.toUpperCase();
//                        });
    var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|is|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

    return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
      if (index > 0 && index + match.length !== title.length &&
        match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
        title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
      }

      if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
      }

      return match.charAt(0).toUpperCase() + match.substr(1);
    });
  };
}
