'use strict';

app.factory('gravatarUrlBuilder',
  function() {
    return {
      buildGravatarUrl: function(email) {
        //var defaultGravatarUrl = "mm";
        var defaultGravatarUrl = "http://www.dweezilzappaworld.com/assets/default_medium_profile_pic.png";
        var url = "http://www.gravatar.com/avatar/%s.jpg?s=200&r=g&d=%s";

        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regex.test(email))
          return defaultGravatarUrl;

        return url.sprintf(email.md5(),
          encodeURIComponent(defaultGravatarUrl));
      }
    }
  });
