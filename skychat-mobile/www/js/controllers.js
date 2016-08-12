angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $ionicPopup, $timeout, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $rootScope.socket = io('http://redsky.fr:8056')
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    var pseudo = $scope.loginData.username;
    var pass = $scope.loginData.password;
    let creds = new FormData();
    creds.append('pass', pass);
    creds.append('pseudo', pseudo);
    console.log(creds);
    $http({ method: 'POST', url: 'http://redsky.fr/ajax/account/api2.php', data: "pseudo="+pseudo+"&pass="+pass, headers: {'Content-Type': 'application/x-www-form-urlencoded'} }).then(function(response) {
      if (!response.data.error) {
          $scope.logData = response.data;
          $scope.closeLogin();
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur d\'authentification',
          template: 'Mauvais pseudo ou mot de passe, veuillez reessayer.'
        });
      }
    });

    setTimeout(function() {$rootScope.socket.emit("log", $scope.logData); setTimeout(function(){$rootScope.socket.emit("message",{"message":'/join 0'});}, 500);}, 500);

  };
})

.controller('RoomslistsCtrl', function($scope, $rootScope) {
  $rootScope.socket = io.connect('http://redsky.fr:8056');
  //$rootScope.socket.emit("message",{"message":'/join 0'});
  $rootScope.socket.on('message', function(data) {
    console.log(data);
  });
  $scope.rooms = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
