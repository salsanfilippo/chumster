'use strict';

app.factory('gravatarUrlBuilder', function() {
  return {
    buildGravatarUrl: function(email) {
      var defaultGravatarUrl = "http://www.dweezilzappaworld.com/assets/default_medium_profile_pic.png";
      //var defaultGravatarUrl = "mm";

      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!regex.test(email))
        return defaultGravatarUrl;

      return String.format("http://www.gravatar.com/avatar/{0}.jpg?s=200&r=g&d={1}",
        String.md5(email),
        encodeURIComponent(defaultGravatarUrl));
    }
  }
});