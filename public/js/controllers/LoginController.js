'use strict';

eventsApp.controller('LoginController',
    function LoginController($scope, $location, userData, authService) {
        $scope.user = {email: "", password: ""};
        resetError();

        $scope.login = function () {
            resetError();

            userData.getUser($scope.user.email, $scope.user.password, function (user, success) {
                if (success) {
                  authService.setCurrentUser(user);
                  $location.url('/friends');
                  return;
                }

                $scope.hasError = true;
                $scope.errorMessage = 'Invalid username/password. (' + $scope.user.email +')';
            });
        };

        $scope.cancel = function() {
            $location.url("/home");
        }

        function resetError() {
            $scope.hasError = false;
            $scope.errorMessage = '';
        };
    }
);
