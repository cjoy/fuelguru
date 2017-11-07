angular.module('MyApp')
.factory('tripprice', function($http) {
  return {
    send: function(coordinates) {
      return $http({
        url: '/price/station/trip/coordinates', 
        method: "GET",
        params: coordinates
      });
    }
  };
});