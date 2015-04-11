'use strict';

app.directive('passwordConfirm', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      var validate = function (viewValue) {
        var password = scope.$eval(attrs.passwordConfirm);
        ngModel.$setValidity('match', ngModel.$isEmpty(viewValue) || viewValue == password);
        return viewValue;
      }
      ngModel.$parsers.push(validate);
      scope.$watch(attrs.passwordConfirm, function(value){
        validate(ngModel.$viewValue);
      })
    }
  }
}]);
