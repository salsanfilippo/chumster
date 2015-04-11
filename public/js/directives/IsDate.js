'use strict';

app.directive('isDate', function () {
  console.log("isDate Directive was run");
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ngModel) {
      function validate(value) {
        var isBadValue = value === null;
        var isObject = typeof(value) === 'object';

        // Strings must be 10 in the format MM/dd/yyyy
        if (!isBadValue &&
          ((!isObject) && (value.toString().length!=10))) {
          isBadValue = true;
        }

        if (!isBadValue) {
          isBadValue = isNaN(Date.parse(value));
        }

        if (isBadValue) {
          ngModel.$setValidity('valid', false);
          ngModel.$setValidity('date', false);
        } else {
          ngModel.$setValidity('valid', true);
          ngModel.$setValidity('date', true);
        }
      }

      scope.$watch(function () {
        return ngModel.$viewValue;
      }, validate);
    }
  };
});
