app.directive("loader", function ($rootScope) {
  return function ($scope, element, attrs) {
    $scope.$on("loader_show", function () {
      return element.removeClass('hidden');
    });
    return $scope.$on("loader_hide", function () {
      return element.addClass('hidden');
    });
  };
});
