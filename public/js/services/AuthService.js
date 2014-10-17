'use strict';

app.service('authService', function($http, $q, $rootScope) {  
                             // Return public API.
                             // ---
                             // PUBLIC METHODS.
                             // ---
                             // I add a friend with the given name to the remote collection.
                             this.exists = function(email) {
                                             var request = $http({ method: "get",
                                                                   url: String.format("http://dev.gozerlabs.com:4242/api/auth/exists/{0}", email) });
                                             return (request.then(handleSuccess, handleError));
                                           };

                              // I get all of the friends in the remote collection.
                              this.signIn = function(email, password) {
                                var request = $http({ method: "get",
                                                      url: String.format("http://dev.gozerlabs.com:4242/api/auth/with/{0}/and/{1}", email, password) });
    
                                return (request.then(function (response) {
                                                       setUserAuthToken(response.data);
                                                       return handleSuccess(response);
                                                     }, handleError));
                              };
  
                              // I remove the friend with the given ID from the remote collection.
                              this.signOut = function () {
                                               var request = $http({ method: "delete",
                                                                     url: "http://dev.gozerlabs.com:4242/api/auth/logout" ,
                                                                     headers: { 'Auth-Token' : $rootScope.authToken._id  } });
        
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
                                console.log('getAuthUser(): '+JSON.stringify($rootScope.authToken));
                                                   return angular.isObject($rootScope.authToken.user) 
                                                                              ? $rootScope.authToken.user 
                                                                              : null;
                                                 };
                                                  
                              this.isAuthenticated = function() {
                                                       return angular.isObject($rootScope.authToken);
                                                     };
                            // ---
                            // PRIVATE METHODS.
                            // ---
                            // I transform the error response, unwrapping the application dta from
                            // the API response payload.
                            function setUserAuthToken(authToken) {
                              $rootScope.authToken = authToken;
                            }
                            
                            function handleError (response) {
                               // The API response from the server should be returned in a
                               // nomralized format. However, if the request was not handled by the
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
                           