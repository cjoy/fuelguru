angular.module('MyApp')
.factory('averagepricepredict', function($http) {
  return {
    send: function(predict_values) {
      return $http.post('/api/station/predict', predict_values);
    }
  };
});