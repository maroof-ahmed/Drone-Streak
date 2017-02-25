/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />

//homeController.$inject = ['$scope', '$http', '$filter'];

angular.module('USD$')
.controller('homeController', [
  '$scope', '$http', '$filter', '$sce',
  function($scope, $http, $filter, $sce) {
      $scope.page = 'Home';

      app.showProcessing();
      $('.active-pill').removeClass('active-pill');
      $('.home-pill').addClass('active-pill');
      var url = 'http://api.dronestre.am/data';
      // var url = '/json/data.json';
      // WhiteList and Trust URL to Allow $http.get() to receive data
      url = $sce.trustAsResourceUrl(url);


      // ON DATA RESPONSE
      $scope.onDataResponse = function(response) {
          console.log('data', response);

          if (response.status == 200) {
              app.hideProcessing();
              $scope.droneData = response.data.strike.reverse();
              if($scope.isDbData) { $scope.droneData = response.data.strike.reverse(); }
              var droneData = $scope.droneData;
              console.log('dData', droneData);

              // Save Data
              $.ajax({
                  type: "POST",
                  url: "savedata.php",
                  // The key needs to match your method's input parameter (case-sensitive).
                  data: { droneStreamData: JSON.stringify(droneData) },
                  // contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  success: function(response) {
                      console.log('response', response);
                  },
                  error: function(error) {
                      console.log('error', error);
                  }
              });

              // ScrollTop
              $('body').animate({scrollTop: $('body').offset().top}, 1);

              $scope.allCountries = [];
              $scope.allYears = [];
              droneData.forEach(function (dataItem) {
                  dataItem.targetText = dataItem.target;
                  if(dataItem.targetText && dataItem.targetText.indexOf(';') >= 0)  {
                      dataItem.targetText = dataItem.targetText.split(';');
                      dataItem.targetText = dataItem.targetText[0] + ' and Others';
                  } else {
                      droneData.targetText = droneData.target;
                  }

                  if(!dataItem.names[0]) { dataItem.names = [dataItem.names]; }

                  if(dataItem.names[0] != '') {
                      dataItem.namesArray = dataItem.names[0].split(',');
                  } else {
                      dataItem.namesArray = [];
                  }
                  if($scope.allCountries.indexOf(dataItem.country) == -1) {$scope.allCountries.push(dataItem.country)}
                  if($scope.allYears.indexOf($filter('date')(dataItem.date, 'yyyy')) == -1) {
                      $scope.allYears.push($filter('date')(dataItem.date, 'yyyy'));
                  }
                  if(dataItem.target == 'Maulvi Liaqat') { console.log('droneData.targetText ', dataItem); }
              });

              $scope.initialDroneData = $scope.droneData;
              console.log('$scope.allCountries', $scope.allCountries);

              $scope.filterByDeaths = function (item) {
                  // console.log('item', input);
                  if(parseInt(item.deaths_max)) {
                      return parseInt(item.deaths_max);
                  } else {
                      if(item.deaths == 'Unknown') {
                          return -1;
                      } else {
                          return parseInt(item.deaths);
                      }
                  }
              };

              $scope.search = {filterDeathsInjuries: 9999};
              // Set Initial Filter Value
              // $scope.filterDeathsInjuries = 99999;
              $scope.setFilterVal = function (el) {

                  if (this.search.filterCountry) {
                      if (this.search.filterCountry != '') {
                          droneData = $filter('filter')($scope.droneData, this.search.filterCountry);
                          var _this = this;
                          droneData = $filter('filter')($scope.droneData, function(item, i, arr) {
                              var country = item.country;
                              return country == _this.search.filterCountry;
                          });
                      } else {
                          droneData = $scope.droneData;
                      }
                  }

                  if(this.search.filterType == '') {
                      this.hasFilter = false;
                      droneData = this.search.filterCountry != '' ? droneData : $scope.droneData;
                      $scope.sorter == '';
                      $scope.search.filterDeathsInjuries = 0;
                      // $scope.search.filterYear = '';
                      this.setPage(1);
                      // return true;
                  } else {
                      this.hasFilter = true;
                      droneData = this.search.filterCountry != '' ? droneData : $scope.droneData;

                      if (this.search.filterType == 'year' && this.search.filterYear) {
                          console.log('YEAR?', this.search.filterYear, this.search.filterDeathsInjuries);
                          if (this.search.filterYear != '') {
                              // droneData = $filter('filter')($scope.droneData, parseInt(this.search.filterYear));
                              var _this = this;
                              droneData = $filter('filter')(droneData, function(item, i, arr) {
                                  var date = item.date;
                                  var year = $filter('date')(date, 'yyyy');
                                  return parseInt(year) == parseInt(_this.search.filterYear);
                              });
                          } else {
                              droneData = this.search.filterCountry != '' ? droneData : $scope.droneData;
                          }
                      }
                      if (this.search.filterType == 'deaths') {
                          var _this = this;
                          droneData = $filter('filter')(droneData, function(item, i, arr) {
                              // console.log('item, i, arr', item, i, arr);
                              var deaths = item.deaths.indexOf('-') != -1 ? item.deaths_max : item.deaths;
                              // return parseInt(deaths) < parseInt(_this.search.filterDeathsInjuries);
                              return parseInt(deaths) >= parseInt(_this.search.filterDeathsInjuries);
                          });
                          //console.log('filtered', this.filterVal, droneData);
                      }
                      if (this.search.filterType == 'injuries') {
                          var _this = this;
                          droneData = $filter('filter')(droneData, function(item, i, arr) {
                              var injuries = item.injuries != '' ? item.injuries : 0;
                              if(item.injuries.indexOf('-') != -1) {
                                  injuries = parseInt(item.injuries.split('-').pop());
                              } else if(injuries == 'Dozens') {
                                  injuries = 24;
                              } else if(injuries == 'Some') {
                                  injuries = 7;
                              } else if(injuries == 'Several') {
                                  injuries = 30;
                              }
                              return parseInt(injuries) >= parseInt(_this.search.filterDeathsInjuries);
                          });
                      }
                      this.setPage(1);
                  }

                  $scope.summarizeResults(droneData);
              };


              $scope.summarizeResults = function (resultsData) {
                  $scope.totalStrikes = resultsData.length;
                  $scope.totalDeaths = 0;
                  $scope.totalInjuries = 0;
                  $scope.totalCiviliansKilled = 0;
                  $scope.totalChildrenKilled = 0;

                  $scope;

                  resultsData.forEach(function (item, i) {
                      var deaths = item.deaths != '' ? item.deaths : '0';
                      if(deaths.indexOf('-') != -1) {
                          deaths = parseInt(deaths.split('-').pop());
                      } else if(deaths == 'Unknown') {
                          deaths = 1;
                      }
                      $scope.totalDeaths += parseInt(deaths);

                      var injuries = item.injuries != '' ? item.injuries : '0';
                      if(injuries.indexOf('-') != -1) {
                          injuries = parseInt(injuries.split('-').pop());
                          if(isNaN(injuries)) injuries = parseInt(item.injuries.split('-')[0]);
                      } else if(injuries.indexOf('Unknown') != -1 || injuries.indexOf('Possibl') != -1 || injuries.indexOf('Yes') != -1) {
                          civilians = 1;
                      } else if(injuries == 'Dozens') {
                          injuries = 24;
                      } else if(injuries == 'Some') {
                          injuries = 7;
                      } else if(injuries == 'Several') {
                          injuries = 30;
                      }  else if(injuries.indexOf('Many') != -1) {
                          civilians = 10;
                      } else if(injuries.indexOf('At least') != -1) {
                          injuries = injuries.replace('At least', ' ');
                          injuries = injuries.split(' ');
                          injuries.forEach(function(str) {
                              if(!isNaN(parseInt(str))) {injuries = parseInt(str);}
                          });
                      }
                      $scope.totalInjuries += parseInt(injuries);

                      var civilians = item.civilians != '' ? item.civilians : '0';

                      if(civilians.indexOf('-') != -1) {
                          civilians = parseInt(civilians.split('-').pop());
                          if(isNaN(civilians)) civilians = parseInt(item.civilians.split('-')[0]);
                      } else if(civilians.indexOf('Unknown') != -1  || civilians.indexOf('Possibl') != -1 || civilians.indexOf('Yes') != -1) {
                          civilians = 1;
                      } else if(civilians.indexOf('Some') != -1) {
                          civilians = 7;
                      } else if(civilians.indexOf('At least') != -1) {
                          civilians = civilians.replace('At least', ' ');
                          civilians = civilians.split(' ');
                          civilians.forEach(function(str) {
                              if(!isNaN(parseInt(str))) {civilians = parseInt(str);}
                          });
                      } else if(civilians.indexOf('Many') != -1) {
                          civilians = 10;
                      } else if(isNaN(civilians)) {
                          console.log('civilians', civilians);;
                      }
                      $scope.totalCiviliansKilled += parseInt(civilians);

                      var children = item.children != '' ? item.children : '0';
                      // console.log('children', children);
                      if(children.indexOf('-') != -1) {
                          children = parseInt(children.split('-').pop());
                          if(isNaN(children)) children = parseInt(item.children.split('-')[0]);
                      } else if(children.indexOf('Unknown') != -1  || children.indexOf('Possibl') != -1 || children.indexOf('Yes') != -1) {
                          children = 1;
                      } else if(children.indexOf('At least') != -1) {
                          children = children.replace('At least', ' ');
                          children = children.split(' ');
                          children.forEach(function(str) {
                              if(!isNaN(parseInt(str))) {children = parseInt(str);}
                          });
                      } else if(isNaN(children)) {
                          console.log('children', children);;
                      }
                      $scope.totalChildrenKilled += parseInt(children);
                  });

              }

              // Initially, Summarize All Data
              $scope.summarizeResults(droneData);


              $scope.sortByDeaths = function (item) {
                  // console.log('item', input);
                  if(parseInt(item.deaths_max)) {
                      return parseInt(item.deaths_max);
                  } else {
                      if(item.deaths == 'Unknown') {
                          return -1;
                      } else {
                          return parseInt(item.deaths);
                      }
                  }
              };
              $scope.sortByInjuries = function (item) {
                  if(item.injuries) {
                      if(item.injuries.indexOf('-') != -1) {
                          return parseInt(item.injuries.split('-').pop());
                      } else if(item.injuries == 'Dozens') {
                          return 24;
                      } else if(item.injuries == 'Some') {
                          return 7;
                      } else if(item.injuries == 'Several') {
                          return 30;
                      }
                      return parseInt(item.injuries);
                  } else {
                      return 0;
                  }
              };
              $scope.setSort = function () {
                  if($scope.sorter == '') {droneData = $scope.initialDroneData;}
                  if($scope.sorter == 'latest') {droneData = $filter('orderBy')(droneData, 'date', true);}
                  if($scope.sorter == 'oldest') {droneData = $filter('orderBy')(droneData, 'date');}
                  if($scope.sorter == 'country') {droneData = $filter('orderBy')(droneData, 'country');} // $filter('orderBy')(collection, expression, reverse, comparator)
                  if($scope.sorter == 'max_deaths') {droneData = $filter('orderBy')(droneData, $scope.sortByDeaths, true);}
                  if($scope.sorter == 'min_deaths') {droneData = $filter('orderBy')(droneData, $scope.sortByDeaths);}
                  if($scope.sorter == 'max_injuries') {droneData = $filter('orderBy')(droneData, $scope.sortByInjuries, true);}
                  if($scope.sorter == 'min_injuries') {droneData = $filter('orderBy')(droneData, $scope.sortByInjuries);}
                  $scope.setPage(1);
              };

              // Pagination
              $scope.pagedDroneData = [];
              $scope.totalItems = droneData.length;
              $scope.currentPage = 1;
              $scope.maxSize = 5;
              $scope.itemsPerPage = 20;

              var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
              var end = begin + $scope.itemsPerPage;
              $scope.sorter = 'latest';
              if($scope.sorter == 'latest') {$scope.pagedDroneData = droneData.slice(begin, end);}

              $scope.setPage = function (pageNo) {
                  $scope.currentPage = pageNo;
                  $scope.pageChanged();
                  console.log('filtered', droneData);
              };
              $scope.pageChanged = function() {
                  $scope.totalItems = droneData.length;
                  app.showProcessing();
                  console.log('Page changed to: ' + $scope.currentPage);
                  // $scope.setSort();
                  var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
                  var end = begin + $scope.itemsPerPage;
                  $scope.pagedDroneData = droneData.slice(begin, end);
                  // Animate ScrollTop
                  $('body').animate({scrollTop: $('body').offset().top}, 1400);
                  app.hideProcessing();
              };

              // Add Image Animation
              $(document).ready(function () {
                  $('.data-Item').on('mouseover', function (e) {
                      $('.image', this).addClass('animate-top');
                  });
                  $('.data-Item').on('mouseout', function () {
                      $('.image', this).removeClass('animate-top');
                  });
              });

          }
      }


      // Get Data from DB if Present
      $.ajax({
          type: "POST",
          url: "getdata.php",
          // contentType: "application/json; charset=utf-8",
          // cache: false,
          dataType: "json",
          // Fixes 'always_populate_raw_post_data' Error
          data: {dbData: true},
          success: function(response) {
              console.log('Get DB Data Response', response);
              if(response.data.strike.length > 0) {
                  $scope.isDbData = true;
                  $scope.onDataResponse(response);
                  $scope.$apply();
                  console.log('Showing DB Data', response);
              } else {

                  $http({
                      method: 'jsonp',
                      url: url
                  }).then($scope.onDataResponse,
                      function(error) {
                          // Handle error here
                          app.hideProcessing();
                          alert('Error in Requesting Data');
                          console.log('Error in Requesting Data', error);
                      });

              }
          },
          error: function(error) {
              console.log('Get DB Data Error', error, error.responseText);

              $http({
                  method: 'jsonp',
                  url: url
              }).then($scope.onDataResponse,
                  function(error) {
                      // Handle error here
                      app.hideProcessing();
                      alert('Error in Requesting Data');
                      console.log('Error in Requesting Data', error);
                  });

          }
      });


  }
]);

// function homeController() {
//   this.page = 'Home';
// };

// app.showData = function () {
//     var data = app.apiData;
//     data.forEach(function () {
//
//     });
// };