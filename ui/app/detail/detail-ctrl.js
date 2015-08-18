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
