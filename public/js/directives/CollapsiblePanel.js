'use strict';

app.directive('collapsiblePanel', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="container">' +
                      '<div class="panel panel-default">' +
                          '<div class="panel-heading" ng-click="toggleVisibility()">' +
                              '<h2 class="panel-title">{{title}}</h2>' +
                          '</div>' +
                          '<div class="panel-body">' +
                              '<div ng-show="visible" ng-transclude></div>' +
                          '</div>' +
                      '</div>' +
                  '</div>',
        controller: function ($scope) {
            $scope.visible = true;

            $scope.toggleVisibility = function () {
                $scope.visible = !$scope.visible;
            }
        },
        transclude: true,
        scope: {
            title: '@',
            enterTarget: '@'
        }
    }
});

