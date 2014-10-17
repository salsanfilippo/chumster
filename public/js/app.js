'use strict';

var chumsterApp = angular.module('chumsterApp', ['ui.bootstrap', 'ngRoute', 'ngResource']) // 'ngResource', ui.bootstrap'
    .config(function ($routeProvider, $locationProvider){
        $routeProvider.when('/home',
                            { templateUrl: '/templates/Home.html', controller: 'HomeController' });
        $routeProvider.when('/friends',
                            { templateUrl: '/templates/Friends.html', controller: 'FriendsController' });
        $routeProvider.when('/register',
                            { templateUrl: '/templates/editProfile.html', controller: 'EditProfileController' });
        $routeProvider.when('/editProfile',
                            { templateUrl: '/templates/editProfile.html', controller: 'EditProfileController' });
        $routeProvider.when('/viewProfile/:email',
                            { templateUrl: '/templates/viewProfile.html', controller: 'ViewProfileController' });
        $routeProvider.when('/login',
                            { templateUrl: '/templates/login.html', controller: 'LoginController' });
        $routeProvider.otherwise({redirectTo: '/home'});
        $locationProvider.html5Mode(true);
    });