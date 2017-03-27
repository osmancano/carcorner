'use strict';

angular.module('carRentApp', ['ui.router','ngResource'])
.run(function($rootScope, $state, $location, AuthFactory){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            console.log("state change: from state: " + fromState.name + " to state: " + toState.name);
            var loggedIn = AuthFactory.isAuthenticated();
            if  (toState.authenticate && loggedIn){ 
                $rootScope.returnToState = toState.url;
                $rootScope.returnToStateParams = toParams.Id;
                $location.path('login');
            }
        });
    })
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'IndexController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })

            // route for login page
            .state('app.login', {
                url:'login',
                views: {
                    'content@': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginController'
                    }
                }
            })

            // route for sign up page
            .state('app.signup', {
                url:'signup',
                views: {
                    'content@': {
                        templateUrl : 'views/signup.html',
                        controller  : 'RegisterController'
                    }
                }
            })

            // route for load User Image page
            .state('app.loadUserImage', {
                url:'loadUserImage/:userID',
                views: {
                    'content@': {
                        templateUrl : 'views/loadUserImage.html',
                        controller  : 'RegisterController'
                    }
                }
            })

             // route for load User Image page
            .state('app.loadCarImage', {
                url:'loadCarImage/:carID',
                views: {
                    'content@': {
                        templateUrl : 'views/loadCarImage.html',
                        controller  : 'EnrollController'
                    }
                }
            })

            // route for enrolling car page
            .state('app.enrollurcar', {
                url:'enrollurcar',
                views: {
                    'content@': {
                        templateUrl : 'views/enrollurcar.html',
                        controller  : 'EnrollController',
                        authenticate: true
                    }
                }
            })

            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'
                    }
                }
            })

            // route for the rent a car page
            .state('app.rentcar', {
                url:'rentcar',
                views: {
                    'content@': {
                        templateUrl : 'views/cars.html',
                        controller  : 'CarController'
                    }
                }
            })

            // route for the dishdetail page
            .state('app.cardetail', {
                url: 'cardetail/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/cardetail.html',
                        controller  : 'CarDetailController'
                   }
                }
            })

            // route for the dishdetail page
            .state('app.mytrips', {
                url: 'mytrips',
                views: {
                    'content@': {
                        templateUrl : 'views/mytrips.html',
                        controller  : 'TripController'
                   }
                }
            })
            // route for the dishdetail page
            .state('app.tripdetial', {
                url: 'tripdetial/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/tripdetial.html',
                        controller  : 'TripDetailController'
                   }
                }
            })
            // route for the dishdetail page
            .state('app.profile', {
                url: 'profile',
                views: {
                    'content@': {
                        templateUrl : 'views/profile.html',
                        controller  : 'ProfileController'
                   }
                }
            });

        $urlRouterProvider.otherwise('/');
    });
