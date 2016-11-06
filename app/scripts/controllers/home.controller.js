/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />

//homeController.$inject = ['$scope', '$http', '$filter'];

angular.module('USD$')
.controller('homeController', [
  '$scope', '$http', '$filter',
  function($scope, $http, $filter) {
    this.page = 'Home';
  }
]);

// function homeController() {
//   this.page = 'Home';
// };
