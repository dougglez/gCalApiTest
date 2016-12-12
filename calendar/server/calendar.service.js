angular.module("stock")
  .service("calendarService", function($http){
  
  this.createEvent = function(event) {
    return $http.put("/user/createEvent", event);
  };

});
