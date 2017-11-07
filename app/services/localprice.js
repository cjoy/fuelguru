angular.module('MyApp')
.factory('localprice', function($http) {
  return {
    send: function(coordinates) {
      return $http({
        url: '/price/station/local/coordinates', 
        method: "GET",
        params: coordinates
      });
    }
  };
});