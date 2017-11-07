angular.module('MyApp')
  .controller('ForgotCtrl', function($scope, Account) {
    $rootScope.siteTitle = 'Forgot My Password';
    

    $scope.forgotPassword = function() {
      Account.forgotPassword($scope.user)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };
  });
