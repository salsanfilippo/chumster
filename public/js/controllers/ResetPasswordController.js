'use strict'

app.controller('ResetPasswordController',
  function ResetPasswordController($scope, $location, $timeout, authService) {
    var foo='bar';

    $scope.messages = {
      email: {
        required: 'Please enter your email address',
        invalid: 'Email address needs to be valid',
        valid: ''
      },
      submission: {
        success: 'Your password has been reset. Please check your email for the temporary password.',
        emailNotFound: 'Username not found (%s).',
        unknownError: 'Unknown error has occurred.'
      }
    };

    $scope.user = {
      email: '',
      password: ''
    };

    $scope.schema = [
      {
        property: 'email',
        type: 'email',
        label: 'Email Address',
        attr: {required: true},
        msgs: {
          required: $scope.messages.email.required,
          email: $scope.messages.email.invalid,
          valid: $scope.messages.email.valid
        }
      }
    ];

    $scope.options = {
      validation: {
        enabled: true,
        showMessages: true
      },
      layout: {
        type: 'horiz' +
        'ontal',
        labelSize: 4,
        inputSize: 8
      }
    };

    $scope.hasMessage = false;
    $scope.hasError = false;

    resetMessage();

    $scope.resetPassword = function(form) {
                             if (form.$invalid) {
                               return;
                             }

                             authService.resetPassword($scope.user.email)
                                        .then(function (response) { debugger
                                          setMessage($scope.messages.submission.success, false);
                                          $timeout(function() {
                                            $location.url("/login");
                                          }, 2000);
                                        },
                                        function(response) {
                                          if (response.status == 404) {
                                            setMessage($scope.messages.submission.emailNotFound.sprintf($scope.user.email), true);
                                          } else {
                                            setMessage($scope.messages.submission.unknownError, true);
                                            'Fail:\n%s'.printf(JSON.stringify(response));
                                          }
                                        });
                           };

    $scope.cancel = function() {
      $location.url("/home");
    };

    function setMessage(message, isError) {
      $scope.hasMessage = !String.isNullOrEmpty(message);
      $scope.hasError = isError;
      $scope.message = message;
    };

    function resetMessage() {
      setMessage(null);
    };
  });
