app.factory('httpInterceptor', function ($q, $rootScope) {
  var numLoadings = 0;

  return {
    request: function (config) {
      numLoadings++;

      // Show loader
      $rootScope.$broadcast("loader_show");

      if (angular.isObject($rootScope.authToken))
        config.headers['auth-token'] = angular.isObject($rootScope.authToken)
                                                        ? $rootScope.authToken._id
                                                        : null;
      return config || $q.when(config)

    },
    response: function (response) {
      if ((--numLoadings) === 0) {
        // Hide loader
        $rootScope.$broadcast("loader_hide");
      }

      return response || $q.when(response);
    },
    responseError: function (response) {
      if (!(--numLoadings)) {
        // Hide loader
        $rootScope.$broadcast("loader_hide");
      }

      return $q.reject(response);
    }
  };
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
});
