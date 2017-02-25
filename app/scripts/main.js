/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

// Initialize Angular app
var app = angular.module('USD$', ['ui.router', 'ngAnimate', 'ui.bootstrap']);

// Define Angular Router Config
app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('home');
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'homeController'
        })
        .state('about', {
            url: '/about',
            templateUrl: '/about.html',
            controller: 'aboutController'
        });

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

}]);


// Show Processing in UI
app.showProcessing = function () {
    $('.loader-wrap').fadeIn(300);
};
// Hide Processing in UI
app.hideProcessing = function () {
    $('.loader-wrap').delay(100).fadeOut(300);
};

// Request JSON Data
// app.getApiData = function (data, completed) {
//     var url = 'http://api.dronestre.am/data';
//     var url = '/json/data.json';
//     var data = data ? data : {};
//     $.ajax({
//         dataType: "jsonp",
//         dataType: "json",
//         url: url,
//         data: data,
//         timeout: 1000 * 60,
//         beforeSend: function(xhr) {
//             // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
//             app.showProcessing()
//         },
//         success: function(response) {
//             if(completed) {
//                 completed(response);
//             } else {
//                 // var response = response;
//                 // console.log('response', response, typeof response);
//                 app.apiData = response;
//                 return response;
//             }
//         },
//         error: function(xhr, textStatus, errorThrown){
//             app.hideProcessing();
//             alert('Data request failed');
//         }
//     });
// };
//
// app.onApiDataReceived = function (data) {
//     app.apiData = data;
//     console.log('data', data);
//     app.hideProcessing();
//     app.showData();
// };

// Filters


// Directives
// app.directive('scrollOnClick', function() {
//     return {
//         restrict: 'A',
//         link: function(scope, $elm, attrs) {
//             var idToScroll = attrs.href;
//             $elm.on('click', function() {
//                 var $target;
//                 if (idToScroll) {
//                     $target = $(idToScroll);
//                 } else {
//                     $target = $elm;
//                 }
//                 $("body").animate({scrollTop: $target.offset().top}, "slow");
//             });
//         }
//     }
// });
// <a scroll-on-click href="#element-id"></div>


// $(document).ready(function() {
//
// });
