app.directive("loader", function ($rootScope) {
  return function ($scope, element, attrs) {
    $scope.$on("loader_show", function () {
      console.log('show');
      return element.removeClass('hidden');
    });
    return $scope.$on("loader_hide", function () {
      console.log('hide ');
      return element.addClass('hidden');
    });
  };
});
