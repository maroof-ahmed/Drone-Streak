/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

// Initialize Angular app
angular.module('USD$', ['ui.router']);

// Define Angular Router Config
angular.module('USD$').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('home');
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'homeController'
        })
        .state('about', {
            url: '/about',
            templateUrl: '/about.html'
        });

}]);


// $(document).ready(function() {
// });
