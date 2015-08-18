
angular.module('sample', [
  'ngRoute',
  'ngCkeditor',
  'ui.bootstrap',
  'ngJsonExplorer',
  'hljs',
  'highcharts-ng',
  'ml.common',
  'ml.search',
  'ml.search.tpls',
  'ml.utils',
  'sample.user',
  'sample.search',
  'sample.charts',
  'sample.common',
  'sample.detail',
  'sample.create'
])
  .config(['$routeProvider', '$locationProvider', 'mlMapsProvider', function ($routeProvider, $locationProvider, mlMapsProvider) {

    'use strict';

    // to use google maps, version 3, with the drawing and visualization libraries
    // mlMapsProvider.useVersion(3);
    // mlMapsProvider.addLibrary('drawing');
    // mlMapsProvider.addLibrary('visualization');

    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: '/search/search.html',
        controller: 'SearchCtrl',
        reloadOnSearch: false
      })
      .when('/create', {
        templateUrl: '/create/create.html',
        controller: 'CreateCtrl'
      })
      .when('/charts', {
        templateUrl: '/charts/charts.html',
        controller: 'ChartsCtrl'
      })
      .when('/detail', {
        templateUrl: '/detail/detail.html',
        controller: 'DetailCtrl'
      })
      .when('/profile', {
        templateUrl: '/user/profile.html',
        controller: 'ProfileCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

(function () {
  'use strict';

  angular.module('sample.charts')
    .controller('ChartsCtrl', ['$scope', '$http', '$location', 'User', 'MLSearchFactory', 'MLRemoteInputService', function ($scope, $http, $location, user, searchFactory, remoteInput) {
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
      })();//end of function init

      function updateSearchResults(data) {
        model.search = data;
        model.qtext = mlSearch.getText();
        model.page = mlSearch.getPage();

        remoteInput.setInput( model.qtext );
        $location.search( mlSearch.getParams() );

        var series1 = [];
        //var series1 = [{data:[],
        //                name:''}];

        if (model.search && model.search.facets && model.search.facets['Trade operation']) {
          angular.forEach(model.search.facets['Trade operation'].facetValues, function(value, index) {
            series1.push(value.count);
            //series1.push({data:value.count,name:value.name});
            
          });
        }
        $scope.chartConfig.series = [{
             //data: series1.data,
             //name: series1.name
             data: series1
          }];
      }//end of function updateSearchResults

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
      }// end of function search

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
          //series: [{
             //data: [10, 15, 12, 8, 7]
          //}],
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
          title: {text: 'Trade status pre-cancel'}
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
        },//end of chartConfig
        
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
             text: 'Book Value ($USD)'
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

        chartConfig4: {
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
          /*
          series: [{
             data: (function () {
                    var data = [];
                        $http.get('v1/search?q="morgan stanley"&format=json').then(function(response) {
                        this.data = response.data.results.index;
                        // probably need to write a custom rest endpoint here - to get back the values in a specific format perhaps?
                        //$http.get('v1/resources/estimate-collection-counts.xqy').then(function(response) {
                        //  this.data = response;
                        });

                    return data;
                    }())  
          }],*/
          //Title configuration (optional)
          title: {
             text: 'Data from ML'
          },
          //Boolean to control showng loading status on chart (optional)
          //Could be a string if you want to show specific loading text.
          loading: false,
          //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
          //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
          xAxis: {
          currentMin: 0,
          currentMax: 20000,
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
           // load data with $http request here perhaps
          }
        },//End of chartConfig4

        chartConfig5: {
          options: {
                zoomType: 'xy'
            },
            title: {
                text: 'SoyaBean Futures ($USD) / Temperature & Rainfall',
                floating: true,
                align: 'left',
                x: 100,
                y: 20
            },
            subtitle: {
                text: 'Source: WorldClimate.com',
                floating: true,
                align: 'left',
                x: 100,
                y: 40
            },
            xAxis: [{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°C',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                title: {
                    text: 'Temperature',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Rainfall',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} mm',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }

            }, { // Tertiary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Futures ($USD)',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} $USD',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 200,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            size: {
           width: 800,
           height: 300
          },
            series: [{
                name: 'Rainfall',
                type: 'column',
                yAxis: 1,
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                tooltip: {
                    valueSuffix: ' mm'
                }

            }, {
                name: 'Futures ($USD)',
                type: 'spline',
                yAxis: 2,
                data: [910, 920, 940, 930, 970, 910, 1050, 1045, 1020, 1016, 975, 985],
                marker: {
                    enabled: false
                },
                dashStyle: 'shortdot',
                tooltip: {
                    valueSuffix: ' $USD'
                }

            }, {
                name: 'Temperature',
                type: 'spline',
                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                tooltip: {
                    valueSuffix: ' °C'
                }
            }]
          
        }




      });//end of angular extend

    }]);
}());


angular.module('sample.charts', []);


angular.module('sample.common', [])
  .filter('object2Array', function() {
    'use strict';

    return function(input) {
      var out = [];
      for (var name in input) {
        input[name].__key = name;
        out.push(input[name]);
      }
      return out;
    };
});

// Copied from https://docs.angularjs.org/api/ng/service/$compile
angular.module('sample.create')
  .directive('compile', function($compile) {
    'use strict';

    // directive factory creates a link function
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
           // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  });

(function () {
  'use strict';

  angular.module('sample.create')
    .controller('CreateCtrl', ['$scope', 'MLRest', '$window', 'User', function ($scope, mlRest, win, user) {
      var model = {
        person: {
          isActive: true,
          balance: 0,
          picture: 'http://placehold.it/32x32',
          age: 0,
          eyeColor: '',
          name: '',
          gender: '',
          company: '',
          email: '',
          phone: '',
          address: '',
          about: '',
          registered: '',
          latitude: 0,
          longitude: 0,
          tags: [],
          friends: [],
          greeting: '',
          favoriteFruit: ''
        },
        newTag: '',
        user: user
      };

      angular.extend($scope, {
        model: model,
        editorOptions: {
          height: '100px',
          toolbarGroups: [
            { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
            { name: 'links' }
          ],
          //override default options
          toolbar: '',
          /* jshint camelcase: false */
          toolbar_full: ''
        },
        submit: function() {
          mlRest.createDocument($scope.model.person, {
            format: 'json',
            directory: '/content/',
            extension: '.json'
            // TODO: add read/update permissions here like this:
            // 'perm:sample-role': 'read',
            // 'perm:sample-role': 'update'
          }).then(function(response) {
            win.location.href = '/detail?uri=' + response.replace(/(.*\?uri=)/, '');
          });
        },
        addTag: function() {
          model.person.tags.push(model.newTag);
          model.newTag = '';
        }
      });
    }]);
}());


angular.module('sample.create', []);

(function () {
  'use strict';

  angular.module('sample.detail')
    .controller('DetailCtrl', ['$scope', '$http', 'MLRest', '$routeParams', function ($scope, $http, mlRest, $routeParams) {
      var uri = $routeParams.uri;
      var model = {
        // your model stuff here
        uri:uri,
        detail: {}
      };

      //$http.get('v1/search?q="morgan stanley"&format=json').then(function(response) {
      //   model.detail = response.data;
      //});

      mlRest.getDocument(uri, { format: 'json', transform: 'indent' }).then(function(response) {
        model.detail = response.data;
      });

      angular.extend($scope, {
        model: model

      });
    }]);
}());


angular.module('sample.detail', []);

(function () {
  'use strict';

  angular.module('sample.detail')
    .controller('DetailCtrl', ['$scope', 'MLRest', '$routeParams', function ($scope, mlRest, $routeParams) {
      var uri = $routeParams.uri;
      var model = {
        // your model stuff here
        detail: {}
      };

      mlRest.getDocument(uri, { format: 'json', transform: 'indent' }).then(function(response) {
        model.detail = response.data;
      });

      angular.extend($scope, {
        model: model

      });
    }]);
}());


angular.module('sample.detail', []);

(function () {
  'use strict';

  angular.module('sample.search')
    .controller('SearchCtrl', ['$scope', '$location', 'User', 'MLSearchFactory', 'MLRemoteInputService', function ($scope, $location, user, searchFactory, remoteInput) {
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
        }
      });

    }]);
}());


angular.module('sample.search', []);

(function () {
  'use strict';

  angular.module('sample.user')
    .controller('ProfileCtrl', ['$scope', 'MLRest', 'User', '$location', function ($scope, mlRest, user, $location) {
      var model = {
        user: user, // GJo: a bit blunt way to insert the User service, but seems to work
        newEmail: ''
      };

      angular.extend($scope, {
        model: model,
        addEmail: function() {
          if ($scope.profileForm.newEmail.$error.email) {
            return;
          }
          if (!$scope.model.user.emails) {
            $scope.model.user.emails = [];
          }
          $scope.model.user.emails.push(model.newEmail);
          model.newEmail = '';
        },
        removeEmail: function(index) {
          $scope.model.user.emails.splice(index, 1);
        },
        submit: function() {
          mlRest.updateDocument({
            user: {
              'fullname': $scope.model.user.fullname,
              'emails': $scope.model.user.emails
            }
          }, {
            format: 'json',
            uri: '/users/' + $scope.model.user.name + '.json'
            // TODO: add read/update permissions here like this:
            // 'perm:sample-role': 'read',
            // 'perm:sample-role': 'update'
          }).then(function(data) {
            $location.path('/');
          });
        }
      });
    }]);
}());

(function () {

  'use strict';

  angular.module('sample.user')
    .directive('mlUser', [function () {
      return {
        restrict: 'EA',
        controller: 'UserController',
        replace: true,
        scope: {},
        templateUrl: '/user/user-dir.html'
      };
    }])
    .controller('UserController', ['$scope', 'User', function ($scope, user) {
      angular.extend($scope, {
        user: user,
        login: user.login,
        logout: function() {
          user.logout();
          $scope.password = '';
        }
      });
    }]);

}());

(function () {
  'use strict';

  angular.module('sample.user')
    .factory('User', ['$http', function($http) {
      var user = {};

      init();

      $http.get('/user/status', {}).then(updateUser);

      function init() {
        user.name = '';
        user.password = '';
        user.loginError = false;
        user.authenticated = false;
        user.hasProfile = false;
        user.fullname = '';
        user.emails = [];
        return user;
      }

      function updateUser(response) {
        var data = response.data;

        user.authenticated = data.authenticated;

        if ( user.authenticated ) {
          user.name = data.username;

          if ( data.profile ) {
            user.hasProfile = true;
            user.fullname = data.profile.fullname;

            if ( _.isArray(data.profile.emails) ) {
              user.emails = data.profile.emails;
            } else {
              // wrap single value in array, needed for repeater
              user.emails = [data.profile.emails];
            }
          }
        }
      }

      angular.extend(user, {
        login: function(username, password) {
          $http.get('/user/login', {
            params: {
              'username': username,
              'password': password
            }
          }).then(function(reponse) {
            updateUser(reponse);
            user.loginError = !user.authenticated;
          });
        },
        logout: function() {
          $http.get('/user/logout').then(init);
        }
      });

      return user;
    }]);
}());


angular.module('sample.user', ['sample.common']);


/*
  Library to use (close to) fluent-style notation to build structured MarkLogic queries..

  This:

    {
      'or-query': {
        'queries': [
          {
            'range-constraint-query': {
              'constraint-name': 'PublishedDate',
              'range-operator': 'LE',
              'value': new Date().toISOString(),
              'range-option': ['score-function=reciprocal','slope-factor=50']
            }
          },
          {
            'and-query': {
              'queries': []
            }
          }
        ]
      }
    }

  Becomes:

    qb.orQuery(
      qb.rangeConstraintQuery(
        'PublishedDate', 'LE', new Date().toISOString(),
        ['score-function=reciprocal','slope-factor=50']
      ),
      qb.andQuery()
    )

  This:

    {
      'or-query': {
        'queries': [{
          'geospatial-constraint-query': {
            'constraint-name': 'meridian-geo',
            'box': [
              bounds
            ]
          }
        },{
          'geospatial-constraint-query': {
            'constraint-name': 'connect-geo',
            'box': [
              bounds
            ]
          }
        }]
      }
    }

  Becomes:

    qb.orQuery(
      qb.geospatialConstraintQuery('meridian-geo', [bounds]),
      qb.geospatialConstraintQuery('connect-geo', [bounds]),
    )

*/

(function() {
  'use strict';

  angular.module('sample.common')
    .factory('MLSampleQueryBuilder', [function() {
      var andQuery = function () {
        if (arguments.length === 1 && angular.isArray(arguments[0])) {
          return {
            'and-query': {
              'queries': arguments[0]
            }
          };
        } else {
          return {
            'and-query': {
              'queries': Array.prototype.slice.call(arguments)
            }
          };
        }
      };
      return {
        andQuery: andQuery,
        boostQuery: function (matchingQuery, boostingQuery) {
          if (matchingQuery) {
            return {
              'boost-query': {
                'matching-query': matchingQuery,
                'boosting-query': boostingQuery
              }
            };
          } else {
            return {
              'boost-query': {
                'matching-query': andQuery(),
                'boosting-query': boostingQuery
              }
            };
          }
        },
        collectionConstraintQuery: function (constraintName, uris) {
          return {
            'collection-constraint-query': {
              'constraint-name': constraintName,
              'uri': Array.isArray(uris) ? uris : [ uris ]
            }
          };
        },
        customConstraintQuery: function (constraintName, terms) {
          return {
            'custom-constraint-query': {
              'constraint-name': constraintName,
              'text': terms
            }
          };
        },
        customGeospatialConstraintQuery: function (constraintName, annotation, box) {
          return {
            'custom-constraint-query': {
              'constraint-name': constraintName,
              'annotation': annotation,
              'box': box
            }
          };
        },
        documentQuery: function (uris) {
          return {
            'document-query': {
              'uri': Array.isArray(uris) ? uris : [ uris ]
            }
          };
        },
        geospatialConstraintQuery: function (constraintName, boxes) {
          return {
            'geospatial-constraint-query': {
              'constraint-name': constraintName,
              'box': boxes
            }
          };
        },
        operatorState: function (operatorName, stateName) {
          return {
            'operator-state': {
              'operator-name': operatorName,
              'state-name': stateName
            }
          };
        },
        orQuery: function () {
          if (arguments.length === 1 && angular.isArray(arguments[0])) {
            return {
              'or-query': {
                'queries': arguments[0]
              }
            };
          } else {
            return {
              'or-query': {
                'queries': Array.prototype.slice.call(arguments)
              }
            };
          }
        },
        propertiesQuery: function (query) {
          return {
            'properties-query': query
          };
        },
        rangeConstraintQuery: function (constraintName, rangeOperator, value, rangeOptions) {
          if (!rangeOptions) {
            rangeOptions = [];
          }
          if (!rangeOperator) {
            rangeOperator = 'EQ';
          }
          return {
            'range-constraint-query': {
              'constraint-name': constraintName,
              'range-operator': rangeOperator,
              'value': value,
              'range-option': rangeOptions
            }
          };
        },
        structuredQuery: function() {
          if (arguments.length === 1 && angular.isArray(arguments[0])) {
            return {
              'query': {
                'queries': arguments[0]
              }
            };
          } else {
            return {
              'query': {
                'queries': Array.prototype.slice.call(arguments)
              }
            };
          }
        },
        termQuery: function (terms, weight) {
          if (weight) {
            return {
              'term-query': {
                'text': terms,
                'weight': weight
              }
            };
          } else {
            return {
              'term-query': {
                'text': terms
              }
            };
          }
        },
        textQuery: function (text) {
          return {
            'qtext': text
          };
        }
      };
    }]);
}());
