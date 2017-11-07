angular.module('MyApp')
  .controller('HeaderCtrl', function($scope, $rootScope, $location, $window, $auth) {

    // $rootScope.siteTitle = 'Fuel Guru'

    $scope.changeTitle = function(title) {
      $rootScope.siteTitle = title;
    } 

    $scope.isActive = function (viewLocation) {
      return ($location.path().indexOf(viewLocation) > -1) ? 'demo-navigation-active' : '';
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    
    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    };
  });
