(function () {
  'use strict';

  angular.module('sample.search')
    .controller('SearchCtrl', 
                ['$scope', '$location', 'User', 'MLSearchFactory', 'MLRemoteInputService', function ($scope, $location, user, searchFactory, remoteInput) {
      var mlSearch = searchFactory.newContext(),
          model = {
            page: 1,
            qtext: '',
            search: {},
            user: user
          };

      (function init() {
        // wire up remote input subscription
        remoteInput.initCtrl($scope, model, mlSearch, search);

        // run a search when the user logs in
        $scope.$watch('model.user.authenticated', function() {
          search();
        });

        // capture initial URL params in mlSearch and ctrl model
        mlSearch.fromParams().then(function() {
          // if there was remote input, capture it instead of param
          mlSearch.setText(model.qtext);
          updateSearchResults({});
        });

        // capture URL params (forward/back, etc.)
        $scope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl){
          mlSearch.locationChange( newUrl, oldUrl ).then(function() {
            search();
          });
        });
      })();

      function updateSearchResults(data) {
        model.search = data;
        model.qtext = mlSearch.getText();
        model.page = mlSearch.getPage();

        remoteInput.setInput( model.qtext );
        $location.search( mlSearch.getParams() );
      }

      function search(qtext) {
        if ( !model.user.authenticated ) {
          model.search = {};
          return;
        }

        if ( arguments.length ) {
          model.qtext = qtext;
        }

        mlSearch
          .setText(model.qtext)
          .setPage(model.page)
          .search()
          .then(updateSearchResults);
      }

      angular.extend($scope, {
        model: model,
        search: search,
        toggleFacet: function toggleFacet(facetName, value) {
          mlSearch
            .toggleFacet( facetName, value )
            .search()
            .then(updateSearchResults);
        },
                  //This is not a highcharts object. It just looks a little like one!
        chartConfig: {
          options: {
              //This is the Main Highcharts chart config. Any Highchart options are valid here.
              //will be overriden by values specified below.
              chart: {
                  type: 'column'
              },
              tooltip: {
                  style: {
                      padding: 10,
                      fontWeight: 'bold'
                  }
              }
          },
          //The below properties are watched separately for changes.

          //Series object (optional) - a list of series using normal highcharts series options.
          series: [{
             data: [10, 15, 12, 8, 7]
          }],
          //Title configuration (optional)
          title: {
             text: 'Cancelled Trades per day'
          },
          //Boolean to control showng loading status on chart (optional)
          //Could be a string if you want to show specific loading text.
          loading: false,
          //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
          //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
          xAxis: {
          currentMin: 0,
          currentMax: 20,
          title: {text: 'values'}
          },
          //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
          useHighStocks: false,
          //size (optional) if left out the chart will default to size of the div or something sensible.
          size: {
           width: 400,
           height: 300
          },
          //function (optional)
          func: function (chart) {
           //setup some logic for the chart
          }
        },//End of chartConfig1
          
        chartConfig2: {
          options: {
              //This is the Main Highcharts chart config. Any Highchart options are valid here.
              //will be overriden by values specified below.
              tooltip: {
                  style: {
                      padding: 10,
                      fontWeight: 'bold'
                  }
              }
          },
          //The below properties are watched separately for changes.

          //Series object (optional) - a list of series using normal highcharts series options.
            series: [{
                type: 'column',
                name: 'Jane',
                data: [3, 2, 1, 3, 4, 3, 2, 5, 6, 2, 5, 1]
            }, {
                type: 'column',
                name: 'John',
                data: [2, 3, 5, 7, 6, 4, 3, 2, 1, 2, 3, 4]
            }, {
                type: 'column',
                name: 'Joe',
                data: [4, 3, 3, 9, 0, 10, 11, 14, 18, 20, 22, 40]
            }, {
                type: 'spline',
                name: 'Average',
                data: [3, 2.67, 3, 6.33, 3.33, 4.2, 5, 6, 7, 8, 9, 15]
            }, {
                type: 'pie',
                name: 'Total cancelled trades',
                data: [{
                        name: 'Jane',
                        y: 13,
                        color: Highcharts.getOptions().colors[0] // Jane's color
                    }, {
                        name: 'John',
                        y: 23,
                        color: Highcharts.getOptions().colors[1] // John's color
                    }, {
                        name: 'Joe',
                        y: 135,
                        color: Highcharts.getOptions().colors[2] // Joe's color
                    }], 
                center: [100, 80],
                size: 100,
                showInLegend: false,
                dataLabels: {
                enabled: false
                    }
            }],
          //Title configuration (optional)
          title: {
             text: 'Cancelled Trades per month'
          },
          //Boolean to control showng loading status on chart (optional)
          //Could be a string if you want to show specific loading text.
          loading: false,
          //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
          //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
          xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          title: {text: 'Month'}
          },
          yAxis: {
          title: {text: 'Cancelled trades'}    
          },
          //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
          useHighStocks: false,
          //size (optional) if left out the chart will default to size of the div or something sensible.
          size: {
           width: 700,
           height: 400
          },
          //function (optional)
          func: function (chart) {
           //setup some logic for the chart
          }
        }, //End of chartConfig2
        
        chartConfig3: {
          options: {
              //This is the Main Highcharts chart config. Any Highchart options are valid here.
              //will be overriden by values specified below.
              chart: {
                  type: 'spline',
                  events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
              },
              tooltip: {
                  style: {
                      padding: 10,
                      fontWeight: 'bold'
                  }
              }
          },
          //The below properties are watched separately for changes.

          //Series object (optional) - a list of series using normal highcharts series options.
          series: [{
             data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = 0; i <= 19; i += 1) {
                        data.push({
                            x: time + i ,
                            y: Math.random()
                        });
                    }
                    return data;
                    }())  
          }],
          //Title configuration (optional)
          title: {
             text: 'Random data points from function'
          },
          //Boolean to control showng loading status on chart (optional)
          //Could be a string if you want to show specific loading text.
          loading: false,
          //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
          //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
          xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            title: {text: 'values'}
          },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
          //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
          useHighStocks: false,
          //size (optional) if left out the chart will default to size of the div or something sensible.
          size: {
           width: 400,
           height: 300
          },
          //function (optional)
          func: function (chart) {
           //setup some logic for the chart
          }
        },//End of chartConfig3
      }); //End of angular.extend($scope)

    }]);
}());


