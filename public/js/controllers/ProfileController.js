'use strict';

app.controller('ProfileController',
               function ProfileController($routeParams, $scope, $location, $log, reCAPTCHA, authService) {
                 var self = this;

                 if ($routeParams.foo)
                   goHome();

                 $scope.user = {
                   email: '',
                   firstName: '',
                   lastName: '',
                   birthDate: new Date().toLocaleDateString(),
                   password: '',
                   confirmPassword: ''//,
                   //captcha: { response: '', challenge: '' }
                 };
debugger
                 //$scope.recaptcha = vcRecaptchaService;

                 $scope.schema = [
                   { property: 'email', type: 'email', help: 'Don\'t worry we won\'t spam your inbox', attr: { required: true }, msgs: {required: 'You need an email address', email:'Email address needs to be valid', valid: 'Nice email address!'} },
                   { property: 'firstName', type: 'text', label: 'First Name', attr: { required: true }, msgs: {minlength: 'Needs to have at least 4 characters'} },
                   { property: 'lastName', type: 'text', label: 'Last Name', attr: { required: true }, msgs: {minlength: 'Needs to have at least 4 characters'} },
                   { property: 'birthDate', type: 'date', label: 'Birth Date', attr: { datepickerPopup: 'MM/dd/yyyy', required: true }, msgs: { required: 'You need to enter a birth date'} },
                   { property: 'password', type: 'password', label: 'Password', attr: {validPassword:true, required: true}, msgs: { invalidLen: 'Password must be 8-20 characters', weak: 'Password must contain an upper and lower case letter a number and a symbol' } },
                   { property: 'confirmPassword', type: 'password', label: 'Confirm Password', attr: { passwordConfirm: 'user.password', required: true}, msgs: {match: 'Your passwords need to match'} }
                 ];

                 $scope.options = {
                   validation: {
                     enabled: true,
                     showMessages: true
                   },
                   layout: {
                     type: 'basic',
                     labelSize: 4,
                     inputSize: 8
                   },
                   defaultOption: 'Please Select One',
                   dateSettings: {
                     formatMonth: 'MM',
                     formatYear: 'yyyy'
                   },
                   datepickerOptions: {
                     showButtonBar: false
                   }
                 };

                 $scope.captchaReload = function() {
                   reCAPTCHA.reload();
                 };

                 $scope.responseChanged = function(form) {
                   if (angular.isUndefined(recaptcha.$initialized)) {
                     recaptcha.$setPristine(true);
                     recaptcha.$setValidity('required', false);
                     recaptcha.$initialized = true;
                   }

                   if (!Object.extensions.equals($scope.user.captcha, form.recaptcha.$previousViewValue)) {
                     recaptcha.$previousViewValue = Object.extensions.clone($scope.user.captcha);
                     recaptcha.$setValidity('required', $scope.isCaptchaAnswered());
                     $log.info('valid: %s, dirty: %s, pristine: %s'.sprintf(recaptcha.$valid, recaptcha.$dirty, recaptcha.$pristine));
                     $log.info(JSON.stringify($scope.user.captcha));
                   }
                 };

                 $scope.signup = function(form) {
                   $log.info(JSON.stringify($scope.user));
                 };

                 $scope.cancel = function() {
                   $location.url("/home");
                 }

                 $scope.isCaptchaAnswered = function() {
                   return (angular.isObject($scope.user.captcha)) &&
                          ($scope.user.captcha.response.trim().length > 0);
                 };

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
               });
