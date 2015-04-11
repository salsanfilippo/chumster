'use strict';

var app = angular.module('chumster',
                         [
                           'ui.bootstrap',
                           'ngRoute',
                           'ngResource',
                           'ngMessages',
                           'angularFileUpload',
                           'autofields',
                           'reCAPTCHA'
                         ]);

app.config(function ($routeProvider, $locationProvider){
             $routeProvider.when( '/', {
                                   redirectTo: '/home' })
             $routeProvider.when('/home',
                                 { templateUrl: '/templates/home.html', controller: 'HomeController' });
             $routeProvider.when('/friends',
                                 { templateUrl: '/templates/friends.html', controller: 'FriendsController' });
             $routeProvider.when('/friends',
                                 { templateUrl: '/templates/friend.html', controller: 'FriendsController' });
             $routeProvider.when('/register',
                                 { templateUrl: '/templates/register.html', controller: 'ProfileController' });
             $routeProvider.when('/editProfile',
                                 { templateUrl: '/templates/editProfile.html', controller: 'EditProfileController' });
             $routeProvider.when('/viewProfile/:email',
                                 { templateUrl: '/templates/viewProfile.html', controller: 'ViewProfileController' });
             $routeProvider.when('/resetpassword',
                                 { templateUrl: '/templates/resetpassword.html', controller: 'ResetPasswordController' });
             $routeProvider.when('/photos',
                                 { templateUrl: '/templates/photos.html', controller: 'PhotosController' });
             $routeProvider.when('/login',
                                 { templateUrl: '/templates/login.html', controller: 'LoginController' });

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
