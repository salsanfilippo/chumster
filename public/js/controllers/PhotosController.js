'use strict';

app.controller('PhotosController',
  function PhotosController($scope, $upload) {
    var self = this;

    $scope.colors = [
      {name:'black', shade:'dark'},
      {name:'white', shade:'light'},
      {name:'red', shade:'dark'},
      {name:'blue', shade:'dark'},
      {name:'yellow', shade:'light'}
    ];

    $scope.selectedColor = $scope.colors.length > 0 ? $scope.colors[0] : null;

    $scope.filesSelected = null;
    $scope.onFileSelect = function($files) {
                            this.filesSelected = $files;
                            //$files: an array of files selected, each file has name, size, and type.
                            for (var i = 0; i < $files.length; i++) {
                              var file = $files[i];
                              $scope.upload = $upload.upload({
                                                                url: '/api/photo',
                                                                data: {myObj: $scope.myModelObj},
                                                                file: file
                                                             })
                                                     .progress(function(evt) {
                                                                 console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                                               })
                                                     .success(function(data, status, headers, config) {
                                                                // file is uploaded successfully
                                                                console.log(data);
                                                              });
                            }
                          };
  });