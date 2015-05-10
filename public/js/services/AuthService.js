'use strict';

app.service('authService',
            function($http, $q, $log, $rootScope) {
              /**
                * Return public API.
                *
                * PUBLIC METHODS.
                */

              var initialState = true;

              this.initialState = function() {
                return initialState;
              };

              /**
                * Determine if the given email address is already registered..
                * @param email The email address to check
                * @returns {boolean} Returns true if the email exists. Otherwise, false.
                */
              this.exists = function(email) {
                              var request = $http({
                                                     method: "get",
                                                     url: "/api/auth/exists/%s".sprintf(email)
                                                  });
                              return (request.then(handleSuccess, handleError));
                            };

              /**
               * Reset a user's password
               * @param email The user's email address.
               * @returns {*}
               */
              this.resetPassword = function(email) {
                $log.info("/api/auth/reset/%s".sprintf(email));
                var request = $http({
                                       method: "put",
                                       url: "/api/auth/reset/%s".sprintf(email)
                                    });
                return (request.then(handleSuccess, handleError));
              };

              // I get all of the friends in the remote collection.
              this.signIn = function(email, password) {
                var passwordHash = password.md5();
                $log.info("/api/auth/with/%s/and/%s".sprintf(email, passwordHash));
                var request = $http({
                                       method: "get",
                                       url: "/api/auth/with/%s/and/%s".sprintf(email, passwordHash)
                                    });

                return (request.then(function (response) {
                                       initialState = false;
                                       setUserAuthToken(response.data);
                                       return handleSuccess(response);
                                     }, handleError));
              };

              // I remove the friend with the given ID from the remote collection.
              this.signOut = function () {
                               var request = $http({
                                                      method: "delete",
                                                      url: "/api/auth/logout"
                                                   });

                               return (request.then(function(response) {
                                                      setUserAuthToken(null);
                                                      return handleSuccess(response);
                                                    }, handleError));
                             };

              this.getAuthToken = function() {
                                    return angular.isObject($rootScope.authToken)
                                                                ? $rootScope.authToken._id
                                                                : null;
                                  };

              this.getAuthUser = function() {
                                   $log.info('getAuthUser(): %s'.sprintf(JSON.stringify($rootScope.authToken)));
                                   return angular.isObject($rootScope.authToken)
                                                               ? $rootScope.authToken.user
                                                               : null;
                                 };

              this.isAuthenticated = function() {
                                       return angular.isObject($rootScope.authToken);
                                     };

              /**
                * PRIVATE METHODS.
                *
                * I transform the error response, unwrapping the application dta from
                * the API response payload.
                */
              function setUserAuthToken(authToken) {
                $rootScope.authToken = authToken;
              }

              function handleError (response) {
                 // The API response from the server should be returned in a
                 // normalized format. However, if the request was not handled by the
                 // server (or what not handles properly - ex. server error), then we
                 // may have to normalize it on our end, as best we can.
                 var status = response ? (response.status || 500) : 500;
                 var message = response ? response.data || 'An unknown error occurred.' : 'An unknown error occurred.';
                 return ($q.reject({ "status" : status, "message" : message }));
              }

              // I transform the successful response, unwrapping the application data
              // from the API response payload.
              function handleSuccess(response) {
                return (response.data);
              }
            });
                           