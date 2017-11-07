angular.module('MyApp')
.controller('mapviewCtrl', function($scope, $rootScope, $location, $window, $auth) {
  $rootScope.siteTitle = 'Map View';

  $scope.latitude = -74.18;
      $scope.longitude = 30.74;
  });
