angular.module('MyApp')
.factory('singlestationprice', function($http) {
  return {
    send: function(data) {
      return $http({
        url: '/price/recent/numdays', 
        method: "GET",
        params: data
      });
    }
  };
});