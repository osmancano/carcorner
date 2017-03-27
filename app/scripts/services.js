'use strict';
angular.module('carRentApp')
    .constant("baseURL","http://localhost:3000/")
    .factory('carFactory',['$resource','baseURL', '$location','$stateParams','$http', function($resource, baseURL, $location, $stateParams, $http) {
        var carfac = {};
        carfac.db = $resource(baseURL + "open/cars/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

        carfac.loadCarImage = function(image) {
            console.log($stateParams.userID+":"+image);
            var fd = new FormData();
            fd.append('carImage', image);
            $http.post(baseURL + "open/cars/" + $stateParams.carID + "/loadImage", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(){
                $location.path();
            })
            .error(function(){
            });
        };

        carfac.enrollCar = function(carData) {
            $resource(baseURL + "open/cars/-1/add")
            .save(carData,
            function(response) {

                $location.path('/loadCarImage/'+response.id); 
            
                //$rootScope.$broadcast('registration:Successful');
            },
            function(response){
                
                var message = '\
                    <div class="ngdialog-message">\
                    <div><h3>Registration Unsuccessful</h3></div>' +
                    '<div><p>' +  response.data.err.message + 
                    '</p><p>' + response.data.err.name + '</p></div>';

                    ngDialog.openConfirm({ template: message, plain: 'true'});

            }
            
            );
        };
        return carfac;
    }])
    .factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "open/cars/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
            'update': {
                method: 'PUT'
            }
        });
    }])
    
    .factory('makeFactory', ['$resource','baseURL',function($resource,baseURL) {
        var makefac = {};
        makefac.makeDB =  $resource(baseURL + "open/makes");
        makefac.models = [];
        makefac.getModels = function(makeID) {
            $resource(baseURL + "open/makes/"+makeID+"/models")
            .query(
            function (response) {
                makefac.models = response;
                console.log(makefac.models);
            },
            function (response) {
            });
            return makefac.models;
        };
        return makefac;
    }])

    .directive('bindTimestamp', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
            ngModel.$formatters.push(function (value) {
                return new Date(value);
            });
            }
        };
    })

    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                
                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])
.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL','$location','$stateParams', function($resource, $http, $localStorage, $rootScope, $window, baseURL, $location, $stateParams){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var userId = '';
    var userImage = '';
    var authToken = undefined;
    

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    console.log(credentials);
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    userId = credentials.userid;
    userImage = credentials.userImage;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    userId = '';
    userImage = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {  
        $resource(baseURL + "open/users/login")
        .save(loginData,
           function(response) {
                console.log(response);
                storeUserCredentials({username:response.carUser.firstname, userid: response.carUser.id, userImage:response.carUser.image,token: response.token});
                $rootScope.$broadcast('login:Successful');
           },
           function(response){
              isAuthenticated = false;
              var message = 'Invalid Login!'
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "open/users/logout").get(function(response){
        });
        destroyUserCredentials();
    };

    authFac.loadUserImage = function(image) {
        console.log($stateParams.userID+":"+image);
        var fd = new FormData();
        fd.append('userImage', image);
        $http.post(baseURL + "open/users/" + $stateParams.userID + "/loadImage", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            console.log("Respons is:" +response);
            authFac.login({email:response.email, password:response.password});
        })
        .error(function(){
        });
    };

    authFac.register = function(registerData) {
        console.log("on register Method:"+registerData.firstname)
        $resource(baseURL + "open/users/register")
        .save(registerData,
           function(response) {
                //console.log(response.id);
              $location.path('/loadUserImage/'+response.id); 
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    authFac.getUserId = function() {
        return userId;  
    };

    authFac.getUserImage = function() {
        return userImage;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])
;
