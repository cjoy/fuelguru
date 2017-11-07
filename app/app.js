angular.module('MyApp', ['ngRoute', 'satellizer', 'ngCookies', 'ngMaterial', 'ngMessages', 'uiGmapgoogle-maps', 'vsGoogleAutocomplete', 'angular-loading-bar', 'chart.js'])
  .config(function($routeProvider, $locationProvider, $authProvider, uiGmapGoogleMapApiProvider) { //, ChartJsProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'home.html',
        controller: 'homeCtrl'
      })
      .when('/contact', {
        templateUrl: 'contact.html',
        controller: 'ContactCtrl'
      })
      .when('/faqs', {
        templateUrl: 'faqs.html',
        controller: 'FAQsCtrl'
      })
      .when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/signup', {
        templateUrl: 'signup.html',
        controller: 'SignupCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/account', {
        templateUrl: 'profile.html',
        controller: 'ProfileCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/forgot', {
        templateUrl: 'forgot.html',
        controller: 'ForgotCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/reset/:token', {
        templateUrl: 'reset.html',
        controller: 'ResetCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/localsearch', {
        templateUrl: 'localsearch.html',
        controller: 'localsearchCtrl'
      })
      .when('/tripsearch', {
        templateUrl: 'tripsearch.html',
        controller: 'tripsearchCtrl'
      })
      .when('/pricetrend', {
        templateUrl: 'pricetrend.html',
        controller: 'pricetrendCtrl'
      })
      .when('/maps', {
        templateUrl: 'mapview.html',
        controller: 'mapviewCtrl'
      })
      .otherwise({
        templateUrl: '404.html'
      });

    $authProvider.loginUrl = '/login';
    $authProvider.signupUrl = '/signup';
    $authProvider.facebook({
      url: '/auth/facebook',
      clientId: '178266902725941',
      redirectUri: 'http://www.fuelguru.net/auth/facebook/callback'
    });
    $authProvider.google({
      url: '/auth/google',
      clientId: '631036554609-v5hm2amv4pvico3asfi97f54sc51ji4o.apps.googleusercontent.com'
    });
    $authProvider.twitter({
      url: '/auth/twitter'
    });

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }


    function loginRequired($location, $auth) {
      if (!$auth.isAuthenticated()) {
        $location.path('/login');
      }
    }
  })
  .run(function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
  });
