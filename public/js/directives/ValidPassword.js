'use strict';

app.directive('validPassword', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      function validate(viewValue) {
        var isBlank = viewValue === '';
        var invalidLen = !isBlank && (viewValue.length < 8 || viewValue.length > 20);
        var isWeak = !isBlank && !invalidLen && !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])(?=.*[!@#$%^&*? ])/.test(viewValue); // /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])/
        ctrl.$setValidity('required', !isBlank);
        ctrl.$setValidity('weak', !isWeak);
        ctrl.$setValidity('invalidLen', !invalidLen);
        scope.passwordGood = !isBlank && !isWeak && !invalidLen;
      }

      scope.$watch(function () {
        return ctrl.$viewValue;
      }, validate);
    }
  };
});