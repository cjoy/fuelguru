angular.module('MyApp')
.factory('averageprice', function($http) {
  return {
    send: function(numdays) {
      return $http({
        url: '/averageprice/numdays', 
        method: "GET",
        params: numdays
      });
    }
  };
});