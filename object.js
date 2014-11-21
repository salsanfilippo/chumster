'use strict'

if (!Object.extensions) {
  Object.extensions = {};
}

if (!Object.extensions.clone) {
  Object.extensions.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

if (!Object.extensions.equals) {
  Object.extensions.equals = function (obj, other) {
    if (Object.extensions.isNullOrUndefined(obj) ||
        Object.extensions.isNullOrUndefined(other)) {
      return (obj === null) && (other === null);
    }

    if (obj.equals instanceof Function) {
      return obj.equals(other);
    }

    if (typeof (obj) === "string") {
      return obj === other;
    }

    if (typeof(obj) !== "object") {
      return obj === other;
    }

    return obj === other;
  };
}

if (!Object.extensions.hashCode) {
  Object.extensions.hashCode = function (obj) {
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
  };
}

if (!Object.extensions.isNullOrUndefined) {
  Object.extensions.isNullOrUndefined = function (obj) {
    return ((typeof obj == 'undefined') || (obj === null));
  };
}
