'use strict'

if (!Object) {
  // This will never execute. Hack to get extension method JSDoc to generate.
  (function() {
    /**
     * @description Placeholder for Object class. The methods below are extension methods
     * for the builtin Object type.
     * @returns {Object}
     * @constructor Object
     */
    function __Object() {
      return this;
    }
  })();
}

if (!Object.extensions) {
  /**
   * @description Encapsulates Object extension methods. Accessible
   * through <pre>Object.extensions</pre>.
   * @class Object.extensions
   */
  Object.extensions = {
    /**
     * @description Makes a deep copy of an object
     * @memberof Object.extensions
     * @method clone
     * @param obj {*}The object to clone.
     * @returns {Object} The cloned object.
     */
    clone: function (obj) {
             return JSONfn.clone(obj, true);
           },
    /**
     * @description Makes a deep copy of an object
     * @memberof Object.extensions
     * @method equals
     * @param obj {*} The first object to compare.
     * @param other The second object to compare.
     * @returns {boolean} True if both objects are equal. False, otherwise.
     */
    equals: function (obj, other) {
              if (Object.extensions.isNullOrUndefined(obj) ||
                Object.extensions.isNullOrUndefined(other)) {
                return (obj === null) && (other === null);
              }

              if (typeof (obj) === "string") {
                return obj === other;
              }

              if (typeof(obj) !== "object") {
                return obj === other;
              }

              return JSON.stringify(obj) === JSON.stringify(other);
            },
    /**
     * @description Generates a hash code for an Object.
     * @memberof Object.extensions
     * @method hashCode
     * @param obj {*} The object to generate a hashcode from.
     * @returns {int} The hashcode of the Object.
     */
    hashCode: function (obj) {
                if ((typeof obj === 'undefined') ||
                  (obj === null) ||
                  (obj.length === 0))
                  return 0;

                var str = JSON.stringify(obj);
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                  var char = str.charCodeAt(i);
                  hash = ((hash << 5) - hash) + char;
                  hash = hash & hash; // Convert to 32bit integer
                }

                return hash;
              },
    /**
     * @description Determines if an Object is null or undefined.
     * @memberof Object.extensions
     * @method isNullOrUndefined
     * @param obj {*} The Object to test.
     * @returns {boolean} True if the Object is null or undefined. False otherwise.
     */
    isNullOrUndefined: function (obj) {
                         return ((typeof obj == 'undefined') || (obj === null));
                       }
  }
}
