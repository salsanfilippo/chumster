'use strict';

var app = angular.module('chumster',
                         [
                           'ui.bootstrap', 'ngRoute', 'ngResource', 'ngMessages',
                           'angularFileUpload', 'autofields', 'reCAPTCHA'
                         ]);

app.config(function ($routeProvider, $locationProvider){
             $routeProvider.when( '/', { redirectTo: '/home' });
             $routeProvider.when('/home', { templateUrl: '/templates/home.html', controller: 'HomeController' });
             $routeProvider.when('/friends', { templateUrl: '/templates/friends.html', controller: 'FriendsController' });
             $routeProvider.when('/friends', { templateUrl: '/templates/friend.html', controller: 'FriendsController' });
             $routeProvider.when('/register', { templateUrl: '/templates/register.html', controller: 'ProfileController' });
             $routeProvider.when('/editProfile', { templateUrl: '/templates/editProfile.html', controller: 'EditProfileController' });
             $routeProvider.when('/viewProfile/:email', { templateUrl: '/templates/viewProfile.html', controller: 'ViewProfileController' });
             $routeProvider.when('/resetpassword', { templateUrl: '/templates/resetpassword.html', controller: 'ResetPasswordController' });
             $routeProvider.when('/photos', { templateUrl: '/templates/photos.html', controller: 'PhotosController' });
             $routeProvider.when('/login', { templateUrl: '/templates/login.html', controller: 'LoginController' });
             $routeProvider.when('/contact', { templateUrl: '/templates/contact.html' });
             $routeProvider.when('/about', { templateUrl: '/templates/about.html' });
             $routeProvider.when('/faq', { templateUrl: '/templates/faq.html' });

             $routeProvider.otherwise({redirectTo: '/home'});
             $locationProvider.html5Mode(true);
           });

app.config(function(datepickerConfig, datepickerPopupConfig, $autofieldsProvider) {
             datepickerPopupConfig.datepickerPopup = 'MM/dd/yyyy';
             datepickerPopupConfig.showButtonBar = false;

             //Time
             $autofieldsProvider.registerHandler('time', function (directive, field, index) {
               var fieldElements = $autofieldsProvider.field(directive, field, '<timepicker/>');
               fieldElements.input.attr('class', 'timepicker');

               return fieldElements.fieldContainer;
             });
           });

app.config(function(reCAPTCHAProvider) {
    // required: please use your own key :)
    reCAPTCHAProvider.setPublicKey('6Lcyuf0SAAAAAGOM_53UKygQiZ2Q_Gs175Yd7uJv');

    // optional: gets passed into the Recaptcha.create call
    reCAPTCHAProvider.setOptions({
        theme: 'red',
        custom_theme_widget: 'recaptcha_widget'
    });
});

app.run(function ($rootScope, $location, $http, $timeout, authService) {
  // async load constants
  $rootScope.constants = [];
  //$rootScope.restService.get('data/constants.json', function (data) {
  //    $rootScope.constants = data[0];
  //  }
  //);

  // *****
  // Initialize authentication
  // *****
  $rootScope.authService = authService;
  $rootScope.$watch('authService.getAuthUser()', function () {
    // if never logged in, do nothing (otherwise bookmarks fail)
    if ($rootScope.authService.initialState()) {
      // we are public browsing
      return;
    }

    // instantiate and initialize an auth notification manager
    $rootScope.authNotifier = new NotificationManager($rootScope);

    // when user logs in, redirect to home
    if ($rootScope.authService.isAuthenticated()) {
      $location.path("/home");
      $rootScope.authNotifier.notify('information', 'Welcome ' + $rootScope.authService.getAuthUser().firstName + "!");
    }

    // when user logs out, redirect to home
    if (!$rootScope.authService.isAuthenticated()) {
      $location.path("/home");
      $rootScope.authNotifier.notify('information', 'Thanks for visiting.  You have been signed out.');
    }

  }, true);

  // TODO move this out to a more appropriate place
  $rootScope.faq = [
    {key: "What is Angular-Enterprise-Seed?", value: "A starting point for server-agnostic, REST based or static/mashup UI."},
    {key: "What are the pre-requisites for running the seed?", value: "Just an HTTP server.  Add your own backend."},
    {key: "How do I change styling (css)?", value:  "Change Bootstrap LESS and rebuild with the build.sh script.  This will update the appropriate css/image/font files."}
  ];


});
