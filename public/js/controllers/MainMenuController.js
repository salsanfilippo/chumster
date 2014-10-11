'use strict';

eventsApp.controller('MainMenuController',
    function MainMenuController($scope, $location, authService) {
        $scope.user = {};
        $scope.$watch(authService.getCurrentUserName, function () {
            $scope.user = authService.getCurrentUserName();
        });

        $scope.isAuthenticated = function () {
            return authService.isAuthenticated();
        };

        $scope.logout = function () {
            authService.logOut();
        };

        $scope.createEvent = function() {
            console.log('Navigating to home...');
            $location.url('/home', true);
        };
    });
