'use strict';

angular.module('carRentApp')
         .constant("baseURL","http://localhost:3000/")
         .constant("ImagesBaseURL","http://localhost:3000/images/")
         .controller('IndexController', ['$scope', '$location', function($scope, $location) {
            $scope.doRentCar = function() {
                 $location.path('rentcar');
            };
            $scope.doRegisterCar = function() {
                 $location.path('enrollurcar');
            };
        }])

        .controller('HeaderController', ['$scope', 'ImagesBaseURL', '$location', '$rootScope', 'AuthFactory','$localStorage', function ($scope, ImagesBaseURL, $location, $rootScope, AuthFactory, $localStorage) {

            $scope.loggedIn = false;
            $scope.username = '';
            $scope.userImage = '';
            var targetURL = '/';
            
            if(AuthFactory.isAuthenticated()) {
                $scope.loggedIn = true;
                $scope.userImage = ImagesBaseURL + AuthFactory.getUserImage();
                $scope.username = AuthFactory.getUsername();
            }
                
            
            $scope.logOut = function() {
                AuthFactory.logout();
                $scope.loggedIn = false;
                $scope.username = '';
                $scope.userImage = '';
            };
            
            $rootScope.$on('login:Successful', function () {
                $scope.loggedIn = AuthFactory.isAuthenticated();
                $scope.username = AuthFactory.getUsername();
                $scope.userImage = ImagesBaseURL + AuthFactory.getUserImage();
                targetURL = $localStorage.get('targetState');
                if(targetURL==undefined){
                    targetURL='rentcar';
                }
                $localStorage.remove('targetState');
                $location.path(targetURL);
            });
            
        }])

        .controller('CarController', ['$scope', 'carFactory','ImagesBaseURL', function($scope, carFactory, ImagesBaseURL) {
            $scope.imagesBaseURL = ImagesBaseURL;
            $scope.showDetails = false;
            $scope.showCars = false;
            $scope.showFavorites = false;
            $scope.message = "Loading ...";
            carFactory.db.query(
            function (response) {
                $scope.cars = response;
                $scope.showCars = true;

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.toggleFavorites = function () {
                $scope.showFavorites = !$scope.showFavorites;
            };

        }])

        .controller('EnrollController', ['$scope', 'makeFactory', '$location','carFactory', 'baseURL', '$resource', 'AuthFactory','$localStorage', function($scope,makeFactory, $location, carFactory, baseURL, $resource, AuthFactory, $localStorage) {
            var year = new Date().getFullYear();
            var range = [];
            for(var i=1980;i<year;i++) {
                range.push(i);
            }
            $scope.years = range;
            $scope.makes = [];
            $scope.models = [];
            makeFactory.makeDB.query(
                function (response) {
                    $scope.makes = response;
                },
                function (response) {
            });
            
            $scope.setModels = function(){
                if(!isNaN($scope.car.make)){
                    $resource(baseURL + "open/makes/"+$scope.car.make+"/models")
                        .query(
                        function (response) {
                            $scope.models = response;
                            console.log($scope.models);
                        },
                        function (response) {
                        });
                }
            };

            $scope.doEnrollment = function() {
                if(AuthFactory.isAuthenticated()) {
                   carFactory.enrollCar($scope.car);
                }else{
                    $localStorage.store('targetState','enrollcar');
                    $location.path('login');
                } 
            };

            $scope.doLoadCarImage = function() {
                carFactory.loadCarImage($scope.imageFile);
            };
        }])

        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };

            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];

            $scope.channels = channels;
            $scope.invalidChannelSelection = false;

        }])

        .controller('ProfileController', ['baseURL','$scope', '$location','$localStorage' , '$stateParams', 'carFactory', 'ImagesBaseURL','AuthFactory', '$resource',
        function(baseURL, $scope, $location, $localStorage, $stateParams, carFactory, ImagesBaseURL, AuthFactory, $resource) {
            $scope.imagesBaseURL = ImagesBaseURL;
            var userid = AuthFactory.getUserId();
            $scope.userInfo = {};
            $scope.myCars = [];
            console.log("User Id:"+userid);
            $resource(baseURL + "open/users/"+userid)
            .get(
                function (response) {
                    $scope.userInfo = response;
                },
                function (response) {
            });
            $resource(baseURL + "/open/users/"+userid+"/cars")
            .query(
                function (response) {
                    $scope.myCars = response;
                },
                function (response) {
            });
        }])
        .controller('TripController', ['baseURL','$scope', '$location','$localStorage' , '$stateParams', 'carFactory','commentFactory', 'ImagesBaseURL','AuthFactory', '$resource',
        function(baseURL, $scope, $location, $localStorage, $stateParams, carFactory,commentFactory, ImagesBaseURL, AuthFactory, $resource) {
            $scope.imagesBaseURL = ImagesBaseURL;
            $scope.trips = [];
            var userid = AuthFactory.getUserId();
            $resource(baseURL + "open/users/"+userid+"/trips/")
            .query(
                function (response) {
                    $scope.trips = response;
                },
                function (response) {
            });

            $scope.tripDetail = function(trip_id){
                $location.path('tripdetial/'+trip_id);
            }

        }])
        .controller('TripDetailController', ['baseURL','$scope', '$location','$localStorage' , '$stateParams', 'carFactory','commentFactory', 'ImagesBaseURL','AuthFactory', '$resource',
        function(baseURL, $scope, $location, $localStorage, $stateParams, carFactory,commentFactory, ImagesBaseURL, AuthFactory, $resource) {
            $scope.imagesBaseURL = ImagesBaseURL;
            $scope.showTrip = false;
            $scope.trip = {};
            $resource(baseURL + "open/trips/:id")
            .get({
                    id: $stateParams.id
                })
                .$promise.then(
                    function (response) {
                        $scope.trip = response;
                        console.log('Osman'+$scope.trip.id);
                        $scope.showTrip = true;
                    },
                    function (response) {
                    }
            );
            $scope.confirmTrip = function(){
                if(AuthFactory.isAuthenticated()) {
                    var trip = {
                        id : $scope.trip.id
                    }
                    console.log(trip);
                    $resource(baseURL + "open/trips/book")
                        .save(trip,
                        function (response) {
                            console.log(response);
                        },
                        function (response) {
                        });
                }else{
                    $location.path('login');
                }
            }
         }])
        
        .controller('CarDetailController', ['baseURL','$scope', '$location','$localStorage' , '$stateParams', 'carFactory','commentFactory', 'ImagesBaseURL','AuthFactory', '$resource',
        function(baseURL, $scope, $location, $localStorage, $stateParams, carFactory,commentFactory, ImagesBaseURL, AuthFactory, $resource) {
            $scope.imagesBaseURL = ImagesBaseURL;
            $scope.showNotAvailable = false;
            var TRIP_INFO = 'tripInfo';
            $scope.tripinfo = {};
            $scope.startDate = {
                value : new Date('2017,03,31')
            }
            $scope.endDate = {
                value : new Date('2017,04,7')
            }
            $scope.noOfDays = Math.round(($scope.endDate.value.getTime() - $scope.startDate.value.getTime())/1000/60/60/24);
            $scope.setNoOfDays = function(){
                $scope.noOfDays = Math.round(($scope.endDate.value.getTime() - $scope.startDate.value.getTime())/1000/60/60/24);
            }; 

            $scope.Math = window.Math;
            $scope.car = {};
            $scope.showCar = false;
            $scope.message = "Loading ...";

            $scope.car = carFactory.db.get({
                    id: $stateParams.id
                })
                .$promise.then(
                    function (response) {
                        $scope.car = response;
                        $scope.showCar = true;
                    },
                    function (response) {
                        $scope.message = "Error: " + response.status + " " + response.statusText;
                    }
                );
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
            $scope.mycomment = {
                rating: 5,
                comment: "",
                userId:'-1'
            };

            $scope.submitComment = function () {
                commentFactory.save({id: $stateParams.id}, $scope.mycomment);
                $state.go($state.current, {}, {reload: true});   
                $scope.commentForm.$setPristine();
                $scope.mycomment = {
                    rating: 5,
                    comment: "",
                    userId:'-1'
                };
            }

            $scope.checkTrip = function(){
                var tripInfo = {
                    startDate : $scope.startDate.value,
                    endDate : $scope.endDate.value,
                    carID : $scope.car.id,
                    totalPrice: $scope.noOfDays * $scope.car.pricePerDay,
                    userID : AuthFactory.getUserId()
                }
                console.log(tripInfo);
                if(AuthFactory.isAuthenticated()) {
                $resource(baseURL + "open/trips/check")
                        .save(tripInfo,
                        function (response) {
                            if(response.id == undefined){
                                $scope.showNotAvailable = true;
                            }else{
                                $location.path('tripdetial/'+response.id);
                            }
                        },
                        function (response) {
                        });
                }else{
                    $localStorage.store('targetState','cardetail/'+tripInfo.carID);
                    $location.path('login');
                }
        
            }
        }])

        .controller('LoginController', ['$scope', '$localStorage', 'AuthFactory', function ($scope, $localStorage, AuthFactory) {
    
            $scope.loginData = $localStorage.getObject('userinfo','{}');
            
            $scope.doLogin = function() {
                if($scope.rememberMe)
                $localStorage.storeObject('userinfo',$scope.loginData);
                AuthFactory.login($scope.loginData);
                $scope.error = true;
            };
            
        }])

        .controller('RegisterController', ['$scope', '$localStorage', 'AuthFactory','$location','$stateParams', function ($scope, $localStorage, AuthFactory,$location, $stateParams) {
            $scope.register={};
            $scope.loginData={};
            $scope.doRegister = function() {
                AuthFactory.register($scope.registration);
                $scope.error = true;
            };
            $scope.doLoadUserImage = function() {
                AuthFactory.loadUserImage($scope.imageFile);
            };
        }])

    
;
