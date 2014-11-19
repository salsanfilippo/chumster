'use strict';

app.directive('gravatar', function (gravatarUrlBuilder) {
  return {
    restrict: 'E',
    template: '<img />',
    scope: { width: '@', height: '@' },
    replace: true,
    controller: function($scope) {
      $scope.width = $scope.width || '100%';
      $scope.height = $scope.height || '100%';
    },
    link: function (scope, element, attrs, controller) {
      attrs.$set('width', scope.width);
      attrs.$set('height', scope.height);
      attrs.$observe('email', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          attrs.$set('src', gravatarUrlBuilder.buildGravatarUrl(newValue));
        }
      });
    }
  }
});