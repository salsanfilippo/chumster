'use strict';

app.controller('LoginController',
               function LoginController($scope, $location, authService) {
                 $scope.user = {
                   email: '',
                   password: ''
                 };

                 $scope.schema = [
                   { property: 'email', type: 'email', label: '', attr: { required: true }, msgs: { required: 'Please enter your email address', email:'Email address needs to be valid', valid: 'Nice email address!'} },
                   { property: 'password', type: 'password', label: '', help: '<a href="/resetpassword">Forgot Password</a>', attr: { required: true }, msgs: { required: 'Please enter your password.' } },
                 ];

                 $scope.options = {
                   validation: {
                     enabled: true,
                     showMessages: true
                   },
                   layout: {
                     type: 'basic',
                     labelSize: 0,
                     inputSize: 12
                   }
                 };

                 $scope.hasError = false;
                 $scope.loggedIn = false;
                 $scope.token = '';

                 $scope.messages = {
                                     email: {
                                       required: 'You did not enter your email.',
                                       email: 'You have entered an invalid email.'
                                     },
                                     password: {
                                       required: 'You did not enter your password.'
                                     }
                 };

                 if (authService.isAuthenticated())
                   goHome();

                 resetError();

                 $scope.resetPassword = function(form) {
                                          authService.resetPassword($scope.user.email)
                                                     .then(function (response) {
                                                             resetError();
                                                           },
                                                           function(response) {
                                                             if (response.status == 404) {
                                                               setError(String.format("Username not found ({0}).", $scope.user.email));
                                                             } else {
                                                               setError('Unknown error has occurred.');
                                                               'Fail:\n%s'.printf(JSON.stringify(response));
                                                             }
                                                           });
                                        };

                 $scope.login = function (form) {
                   resetError();

                   // If form is invalid, return and let AngularJS show validation errors.
                   if (form.$invalid) {
                     return;
                   }

                   // Trigger validation flag.
                   $scope.submitted = true;

                   resetError();

                   authService.signIn($scope.user.email, $scope.user.password)
                              .then(function(response) {
                                      $scope.loggedIn = true;
                                      $scope.token = JSON.stringify(response);
                                      'Success:\n%s'.printf($scope.token);
                                      //goHome();
                                    },
                                    function(response) {
                                      $scope.loggedIn = false;
                                      if (response.status == 404) {
                                        setError('Username/password not found (%s).'.sprintf($scope.user.email));
                                      } else {
                                        setError('Unknown error has occurred.');
                                        'Fail:\n%s'.printf(JSON.stringify(response));
                                      }
                                    });
                 };

                 $scope.cancel = function() {
                   $location.url("/home");
                 }

                 function goHome() {
                   $location.url("/home");
                 };

                 function setError(message) {
                   $scope.hasError = !String.isNullOrEmpty(message);
                   $scope.errorMessage = message;
                 };

                 function resetError() {
                   setError(null);
                 };
               }
);
