'use strict';

app.controller('MainMenuController',
    function MainMenuController($scope, $location, $log, authService) {
        $scope.user = {};
        $scope.$watch(authService.getAuthUser, function () {
            $scope.user = authService.getAuthUser();
        });

        $scope.isAuthenticated = function () {
            return authService.isAuthenticated();
        };

        $scope.logout = function () {
            authService.signOut();
            //$location.url('/home', true);
        };

        $scope.createEvent = function() {
            $log.info('Navigating to home...');
            $location.url('/home', true);
        };
    });
