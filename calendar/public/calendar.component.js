angular.module('stock')
    .component('calendarComponent', {
        templateUrl: "./js/templates/headerComponent.html",
        controller: function headerController(userStocksService, yahooService, $scope, $stateParams, $state) {
            
            var createEvent = function() {
                calendarService.createEvent(event).then(function(res) {
                    console.log(res);
                });
            };

        } //closes controller
    }); // closes .component