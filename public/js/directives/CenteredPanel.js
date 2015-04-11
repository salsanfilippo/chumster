'use strict';

app.directive('centeredPanel', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="centered-panel-container">' +
                      '<div class="centered-panel" enter-target="{{ enterTarget }}">' +
                          '<div class="container">' +
                              '<div class="panel panel-default" style="max-width: {{ width || \'500px\' }}">' +
                                  '<div class="panel-heading" ' +
                                       'ng-class="{ \'centered-panel-header-error\' : (hasError == \'true\'), ' +
                                                   '\'ng-hide\' : (showHeader == \'false\') }">' +
                                      '<h2 class="panel-title">{{ title }}</h2>' +
                                  '</div>' +
                                  '<div class="panel-body"> ' +
                                      '<div ng-transclude></div>' +
                                  '</div>' +
                              '</div>' +
                          '</div>' +
                      '</div>' +
                  '</div>',
        controller: function ($scope) {
          $scope.showHeader = true;
          $scope.hasError = false;
        },
        transclude: true,
        scope: {
            title: '@',
            enterTarget: '@',
            hasError: '@',
            showHeader: '@',
            width: '@'
        }
    }
});

