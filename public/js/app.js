'use strict';

var app = angular.module('chumster', ['ui.bootstrap', 'ngRoute', 'ngResource', 'ngMessages'])
    .config(function ($routeProvider, $locationProvider){
        $routeProvider.when( '/', {
                              redirectTo: '/home' })
        $routeProvider.when('/home',
                            { templateUrl: '/templates/home.html', controller: 'HomeController' });
        $routeProvider.when('/friends',
                            { templateUrl: '/templates/friends.html', controller: 'FriendsController' });
        $routeProvider.when('/friends',
                            { templateUrl: '/templates/friend.html', controller: 'FriendsController' });
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