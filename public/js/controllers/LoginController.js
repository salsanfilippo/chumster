'use strict';

app.controller('LoginController',
  function LoginController($scope, $location, authService) {
    $scope.user = {email: "", password: ""};

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
                  console.log('Fail:\n'+JSON.stringify(response));
                }
              });
    }

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
          console.log('Success:\n'+$scope.token);
          goHome();
        },
        function(response) {
          $scope.loggedIn = false;
          if (response.status == 404) {
            setError(String.format("Username/password not found ({0}).", $scope.user.email));
          } else {
            setError('Unknown error has occurred.');
            console.log('Fail:\n'+JSON.stringify(response));
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
