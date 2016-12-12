angular.module("stock", ["ui.router", "nvd3"])
  .config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider
    .state("home", {
      url: "/",
      templateUrl: "./views/home.html"
    })
    .state("createUser", {
      url: "/user/new",
      templateUrl: "./views/createUser.html"
    })
    .state("loginUser", {
      url: "/user/login",
      templateUrl: "./views/loginUser.html"
    })
    .state("profile", {
      url: "/user",
      abstract: true,
      templateUrl: "./views/profile.html"
    })
    .state("profile.stockSummaries", {
      url: "",
      templateUrl: "./views/stockSummaries.html"
    })
    .state("profile.profileStock", {
      url: "/stocks/:stockId",
      templateUrl: "./views/profileStock.html",
      controller: 'profileStockCtrl'
    })
    // .state("profile.pref", {
    //   url: "/pref",
    //   templateUrl: "./views/pref.html"
    // });
    .state("profile.calendar",  {
      url: "/calendar",
      templateUrl: "./calendar/public/calendar.component.html",
      controller: "calendarCtrl"
    });
  });

angular.module('stock').component('headerComponent', {
    templateUrl: "./js/templates/headerComponent.html",
    controller: function headerController(userStocksService, yahooService, $scope, $stateParams, $state) {
    //   console.log("stateParams",$stateParams.id);

    setTimeout(function() {

        var getUser = (function() {
            userStocksService.getUserInfo().then(function(res) {
                $scope.firstName = res.data.first_name;
                $scope.lastName = res.data.last_name;
                $scope.userPic = res.data.pic_url;
                if (res.data) {
                    $scope.loggedIn = true;
                } else {
                    $scope.loggedIn = false;
                }
            })
        })();
        console.log($scope.loggedIn);
    }, 50);

        $scope.signOut = function() {
          userStocksService.signOut();
          $scope.loggedIn = false;
          $state.go('home');
        }
    }
});

angular.module('stock').directive('animation', function() {
    return {
        restrict: "EA",
        link: function(scope, elem, attr) {
            //  $(".navicon").click(function() {
            //
            //  });
            //  $('body').on('click', '.navicon', function() {
            //     $(this).toggleClass("active");
            //     $(".wrapper").toggleClass("active");
            //     $(".wrapper-overlay").toggleClass("active");
            //     $("body").toggleClass("no-scroll");
            // });
            // $('body').on('click', '.navicon', function() {
            //     $(".wrapper").click(function() {
            //      $(this).removeClass("active");
            //      $(".navicon").removeClass("active");
            //      $(".wrapper-overlay").removeClass("active");
            //      $("body").removeClass("no-scroll");
            //  });
        }
    };
});

angular.module('stock').component('navComponent', {
    templateUrl: "./js/templates/navComponent.html",
    controller: function navController(userStocksService, $scope, $stateParams, $state) {
        //   console.log("stateParams",$stateParams.id);

        setTimeout(function() {

            var getUser = (function() {
                userStocksService.getUserInfo().then(function(res) {
                    if (res.data) {
                        $scope.loggedIn = true;
                    } else {
                        $scope.loggedIn = false;
                    }
                });
            })();
        }, 50);

        $scope.checkSignin = function Bob () {
          if ($scope.loggedIn === true) {
            $state.go('profile.stockSummaries');
          }
          else {
            swal('You need to sign in first.');
          }
        };
    }
});

angular.module("stock")
  .component("nyTimesComponent", {
    templateUrl: "./js/templates/nyTimesComponent.html",
    controller: function nyTimesController(nyTimesService, $scope) {
      nyTimesService.getNews().then(function(response) {
          $scope.news = response.data.response.docs;
        });
    },
    bindings: {

    }
  });

angular.module('stock').component('selectStocksComponent', {
  templateUrl: "./js/templates/selectStocksComponent.html",
  controller: function selectStocksController(userStocksService, $scope, $stateParams, $state){
    var id;

    userStocksService.getUserInfo().then(function(res){
          id = res.data.google_id;
    });

    userStocksService.getAllStocks().then(function(res){
      $scope.all_stocks = res.data;
    });  //closes userStocksService function

    $scope.addNewFavorite = function(stock) {
      userStocksService.addNewFavorite([id, stock])
        .then(function(res) {
          $state.reload();
      });
    };
  }, //closes controller
  bindings: []

});

angular.module('stock').component('starredStocksComponent', {
    templateUrl: "./js/templates/starredStocksComponent.html",
    controller: function starredStocksController(userStocksService, yahooService, $scope, $stateParams, $state) {
      var id;
      var usersSavedStocks;
      userStocksService.getUserInfo().then(function(res){
        id = res.data.google_id;
        getSavedStocks(id);
      })

        var getSavedStocks = function(){
          userStocksService.getSavedStocks(id).then(function(res) {
            //getting customers saved stocks for yahoo snaphsot
            var savedStockSymbols = {
                symbols: []
            };
            //passing saved stocks into a new array
            usersSavedStocks = res.data;
            for (var i = 0; i < res.data.length; i++) {
                savedStockSymbols.symbols.push(res.data[i].company_symbol);
            }
            //sending new array to backend for an api call
            yahooService.getSnapshots(savedStockSymbols).then(function(res) {
                $scope.saved_stocks = res.data;
            }, function(err) {
                console.log(err);
            });
          });
        } //closes getSavedStocks function

        $scope.removeFavorite = function(symbol) {
          for (var i = 0; i < usersSavedStocks.length; i++) {
            if (usersSavedStocks[i].company_symbol === symbol) {
              userStocksService.removeFavorite(usersSavedStocks[i].stock_id)
                .then(function(res){
                  getSavedStocks();
              });

            }
          }          
      };
    }, //closes controller
    bindings: []
});

angular.module("stock").component("yahooComponent", {
    templateUrl: "./js/templates/yahooComponent.html",
    controller: function yahooController(yahooService, nyTimesService, userStocksService, $stateParams, $scope, $state) {
        setTimeout(function() {
            var getUser = (function() {
                userStocksService.getUserInfo().then(function(res) {

                    if (res.data) {
                        $scope.loggedIn = true;
                    } else {
                        $scope.loggedIn = false;
                    }
                });
            })();
        }, 50);
        $scope.uiRouterState = $state;
        $scope.getNewsDay = function(start, end, company) {
            var companyData = {
                company: company,
                begin: moment(start).format('YYYYMMDD'),
                end: moment(end).format('YYYYMMDD')
            };
            // console.log("companyData:", companyData);
            $scope.newsDate = moment(start).format('MMMM Do, YYYY');
            nyTimesService.getNews(companyData).then(function(res) {
                $scope.news = res.data.response.docs;
            });
        }; // ends getNewsDay

        function getDefaultNews() {
            if (!$scope.newsDate) {
                var today = new Date();
                $scope.newsDate = moment(new Date()).format('MMMM Do, YYYY');
                $scope.getNewsDay(today, today, $scope.stockSearch);
            }
        } // ends getDefaultNews
        userStocksService.getOneStock($stateParams.stockId).then(function(res) {
            $scope.stockName = res.data[0].name;
            $scope.stockSymbol = res.data[0].symbol;
            $scope.stockSearch = res.data[0].search_term;
            // console.log("search term coming in:", res.data[0].search_term);
            getDefaultNews();
            $scope.setGraphRange(12);


        }); //ends mainService.getOneStock function call

        
        var today = moment(new Date());
    
        $scope.setGraphRange = function(monthsStart) {  // for some reason this closing bracket is showing as the controller's closing bracket
    
            var stockData = {
                stockSymbol: $scope.stockSymbol,
                start: moment(new Date()).subtract(monthsStart, "months").format("YYYY-MM-DD"),
                end: today.format("YYYY-MM-DD")

            };
            yahooService.getStocks(stockData).then(function(res) {
                $scope.stockData = res.data;
                $scope.stockSymbol = res.data[0].symbol;
    //             console.log(res.data);

                var data13 = [
                    {
                        "values": []
                    }
                ];
                $scope.stockData.map(function(data) {
                    data13[0].values.push({
                        "date": new Date(data.date),
                        "open": (data.open),
                        "high": (data.high),
                        "low": (data.low),
                        "close": (data.close),
                        "volume": (data.volume),
                        "adjusted": (data.adjClose)
                    }); // ends the object in the .push
                }); // ends $scope.stockData.map function

                //
                // var type = 'lineChart';
                //
                $scope.changeGraph = function(num) {
                    if (num === 1) {
                        type = 'lineChart';
                        userStocksService.type = type;
                    } else if (num === 2) {
                        type = 'candlestickBarChart';
                        userStocksService.type = type;
                    } else if (num === 3) {
                        type = 'ohlcBarChart';
                        userStocksService.type = type;
                    }
                    $scope.options.chart.type = type;
                };
    //
                $scope.data = data13;
                $scope.options = {
    //
                    chart: {
                        showLegend: false,
                        type: userStocksService.type,
                        height: 450,
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 40,
                            left: 60
                        },
                        x: function(d) {
                            return d['date'];
                        },
                        y: function(d) {
                            return d['close'];
                        },
                        duration: 100,
    //
                        xAxis: {
                            axisLabel: 'Dates',
                            tickFormat: function(d) {
                                return d3.time.format('%x')(new Date(d));
                            },
                            showMaxMin: false
                        },
    //
                        yAxis: {
                            axisLabel: 'Stock Price',
                            tickFormat: function(d) {
                                return '$' + d3.format(',.1f')(d);
                            },
                            showMaxMin: false
                        },
                        lines: {
                            dispatch: {
                                // THIS IS WHERE YOU CAN ACCESS THE POINT DATA
                                elementClick: function(e) {
                                    var searchDate = e.point.date;
                                    $scope.getNewsDay(searchDate, searchDate, $scope.stockSearch);
                                }
                            }
                        },
                        interactiveLayer: {
                            dispatch: {
                                // THIS IS WHERE YOU CAN ACCESS THE POINT DATA
                                elementClick: function(e) {
                                    var date = (new Date(e.pointXValue));
                                    var searchDate = date;
                                    $scope.getNewsDay(searchDate, searchDate, $scope.stockSearch);
                                }
                            }
                        },
                        zoom: {
                            enabled: false,
                            scaleExtent: [
                                1, 10
                            ],
                            // useInteractiveGuideline: true,
                            useFixedDomain: false,
                            useNiceScale: false,
                            horizontalOff: false,
                            verticalOff: true,
                            unzoomEventType: 'dblclick.zoom'
                        }
                    } // this ends chart
                }; // this ends scope.options
                $scope.config = {
                    deepWatchOptions: true
                }; // end scope.config
                setTimeout(function() {
                    $scope.api.refresh();
                }, 500);
            }); // ends yahooService.getStocks.then function
        }; //ends setGraphRange function
    } // ends controller
}); // Angular.module

angular.module('stock').controller('profileStockCtrl', function($scope) {

$scope.goBack = function() {
    window.history.back();
}

});
angular.module("stock")
  .service("nyTimesService", function($http){
    this.getNews = function(companyData){
      return $http.post("/stocknews", companyData);
  };
});

angular.module("stock")
  .service("userStocksService", function($http){
    this.getAllStocks = function(){
      return $http.get("/getallstocks");
    };
    this.getOneStock = function(stockId){
      return $http.get("/getonestock/" + stockId);
    };
    this.getSavedStocks = function(id){
      return $http.get("/user/getsavedstocks/" + id);
    };
    this.getUserInfo = function(){
      return $http.get("getuserinfo");
    };
    this.addNewFavorite = function(symbol){
      return $http.post("/addnewfavorite", symbol);
    };
    this.removeFavorite = function(id){
      return $http.delete("/removefavorite/" + id);
    };
    this.signOut = function() {
      console.log("fired from userStocksService");
      return $http.get("/logout");
    }
    this.type = 'lineChart';
});

angular.module("stock")
  .service("yahooService", function($http){
  this.getStocks = function(stockData){
    return $http.get("/getgraphdata/" + stockData.stockSymbol + "/" + stockData.start + "/" + stockData.end); //changed
  };
  this.getSnapshots = function(symbols) {
    return $http.post("/snapshots", symbols);
  };

});

// The MIT License (MIT)

// Typed.js | Copyright (c) 2016 Matt Boldt | www.mattboldt.com

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




! function($) {

	"use strict";

	var Typed = function(el, options) {

		// chosen element to manipulate text
		this.el = $(el);

		// options
		this.options = $.extend({}, $.fn.typed.defaults, options);

		// attribute to type into
		this.isInput = this.el.is('input');
		this.attr = this.options.attr;

		// show cursor
		this.showCursor = this.isInput ? false : this.options.showCursor;

		// text content of element
		this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text();

		// html or plain text
		this.contentType = this.options.contentType;

		// typing speed
		this.typeSpeed = this.options.typeSpeed;

		// add a delay before typing starts
		this.startDelay = this.options.startDelay;

		// backspacing speed
		this.backSpeed = this.options.backSpeed;

		// amount of time to wait before backspacing
		this.backDelay = this.options.backDelay;

		// div containing strings
		this.stringsElement = this.options.stringsElement;

		// input strings of text
		this.strings = this.options.strings;

		// character number position of current string
		this.strPos = 0;

		// current array position
		this.arrayPos = 0;

		// number to stop backspacing on.
		// default 0, can change depending on how many chars
		// you want to remove at the time
		this.stopNum = 0;

		// Looping logic
		this.loop = this.options.loop;
		this.loopCount = this.options.loopCount;
		this.curLoop = 0;

		// for stopping
		this.stop = false;

		// custom cursor
		this.cursorChar = this.options.cursorChar;

		// shuffle the strings
		this.shuffle = this.options.shuffle;
		// the order of strings
		this.sequence = [];

		// All systems go!
		this.build();
	};

	Typed.prototype = {

		constructor: Typed,

		init: function() {
			// begin the loop w/ first current string (global self.strings)
			// current string will be passed as an argument each time after this
			var self = this;
			self.timeout = setTimeout(function() {
				for (var i=0;i<self.strings.length;++i) self.sequence[i]=i;

				// shuffle the array if true
				if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

				// Start typing
				self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
			}, self.startDelay);
		},

		build: function() {
			var self = this;
			// Insert cursor
			if (this.showCursor === true) {
				this.cursor = $("<span class=\"typed-cursor\">" + this.cursorChar + "</span>");
				this.el.after(this.cursor);
			}
			if (this.stringsElement) {
				this.strings = [];
				this.stringsElement.hide();
				console.log(this.stringsElement.children());
				var strings = this.stringsElement.children();
				$.each(strings, function(key, value){
					self.strings.push($(value).html());
				});
			}
			this.init();
		},

		// pass current string state to each function, types 1 char per call
		typewrite: function(curString, curStrPos) {
			// exit when stopped
			if (this.stop === true) {
				return;
			}

			// varying values for setTimeout during typing
			// can't be global since number changes each time loop is executed
			var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
			var self = this;

			// ------------- optional ------------- //
			// backpaces a certain string faster
			// ------------------------------------ //
			// if (self.arrayPos == 1){
			//  self.backDelay = 50;
			// }
			// else{ self.backDelay = 500; }

			// contain typing function in a timeout humanize'd delay
			self.timeout = setTimeout(function() {
				// check for an escape character before a pause value
				// format: \^\d+ .. eg: ^1000 .. should be able to print the ^ too using ^^
				// single ^ are removed from string
				var charPause = 0;
				var substr = curString.substr(curStrPos);
				if (substr.charAt(0) === '^') {
					var skip = 1; // skip atleast 1
					if (/^\^\d+/.test(substr)) {
						substr = /\d+/.exec(substr)[0];
						skip += substr.length;
						charPause = parseInt(substr);
					}

					// strip out the escape character and pause value so they're not printed
					curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
				}

				if (self.contentType === 'html') {
					// skip over html tags while typing
					var curChar = curString.substr(curStrPos).charAt(0)
					if (curChar === '<' || curChar === '&') {
						var tag = '';
						var endTag = '';
						if (curChar === '<') {
							endTag = '>'
						}
						else {
							endTag = ';'
						}
						while (curString.substr(curStrPos + 1).charAt(0) !== endTag) {
							tag += curString.substr(curStrPos).charAt(0);
							curStrPos++;
							if (curStrPos + 1 > curString.length) { break; }
						}
						curStrPos++;
						tag += endTag;
					}
				}

				// timeout for any pause after a character
				self.timeout = setTimeout(function() {
					if (curStrPos === curString.length) {
						// fires callback function
						self.options.onStringTyped(self.arrayPos);

						// is this the final string
						if (self.arrayPos === self.strings.length - 1) {
							// animation that occurs on the last typed string
							self.options.callback();

							self.curLoop++;

							// quit if we wont loop back
							if (self.loop === false || self.curLoop === self.loopCount)
								return;
						}

						self.timeout = setTimeout(function() {
							self.backspace(curString, curStrPos);
						}, self.backDelay);

					} else {

						/* call before functions if applicable */
						if (curStrPos === 0) {
							self.options.preStringTyped(self.arrayPos);
						}

						// start typing each new char into existing string
						// curString: arg, self.el.html: original text inside element
						var nextString = curString.substr(0, curStrPos + 1);
						if (self.attr) {
							self.el.attr(self.attr, nextString);
						} else {
							if (self.isInput) {
								self.el.val(nextString);
							} else if (self.contentType === 'html') {
								self.el.html(nextString);
							} else {
								self.el.text(nextString);
							}
						}

						// add characters one by one
						curStrPos++;
						// loop the function
						self.typewrite(curString, curStrPos);
					}
					// end of character pause
				}, charPause);

				// humanized value for typing
			}, humanize);

		},

		backspace: function(curString, curStrPos) {
			// exit when stopped
			if (this.stop === true) {
				return;
			}

			// varying values for setTimeout during typing
			// can't be global since number changes each time loop is executed
			var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
			var self = this;

			self.timeout = setTimeout(function() {

				// ----- this part is optional ----- //
				// check string array position
				// on the first string, only delete one word
				// the stopNum actually represents the amount of chars to
				// keep in the current string. In my case it's 14.
				// if (self.arrayPos == 1){
				//  self.stopNum = 14;
				// }
				//every other time, delete the whole typed string
				// else{
				//  self.stopNum = 0;
				// }

				if (self.contentType === 'html') {
					// skip over html tags while backspacing
					if (curString.substr(curStrPos).charAt(0) === '>') {
						var tag = '';
						while (curString.substr(curStrPos - 1).charAt(0) !== '<') {
							tag -= curString.substr(curStrPos).charAt(0);
							curStrPos--;
							if (curStrPos < 0) { break; }
						}
						curStrPos--;
						tag += '<';
					}
				}

				// ----- continue important stuff ----- //
				// replace text with base text + typed characters
				var nextString = curString.substr(0, curStrPos);
				if (self.attr) {
					self.el.attr(self.attr, nextString);
				} else {
					if (self.isInput) {
						self.el.val(nextString);
					} else if (self.contentType === 'html') {
						self.el.html(nextString);
					} else {
						self.el.text(nextString);
					}
				}

				// if the number (id of character in current string) is
				// less than the stop number, keep going
				if (curStrPos > self.stopNum) {
					// subtract characters one by one
					curStrPos--;
					// loop the function
					self.backspace(curString, curStrPos);
				}
				// if the stop number has been reached, increase
				// array position to next string
				else if (curStrPos <= self.stopNum) {
					self.arrayPos++;

					if (self.arrayPos === self.strings.length) {
						self.arrayPos = 0;

						// Shuffle sequence again
						if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

						self.init();
					} else
						self.typewrite(self.strings[self.sequence[self.arrayPos]], curStrPos);
				}

				// humanized value for typing
			}, humanize);

		},
		/**
		 * Shuffles the numbers in the given array.
		 * @param {Array} array
		 * @returns {Array}
		 */
		shuffleArray: function(array) {
			var tmp, current, top = array.length;
			if(top) while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
			return array;
		},

		// Start & Stop currently not working

		// , stop: function() {
		//     var self = this;

		//     self.stop = true;
		//     clearInterval(self.timeout);
		// }

		// , start: function() {
		//     var self = this;
		//     if(self.stop === false)
		//        return;

		//     this.stop = false;
		//     this.init();
		// }

		// Reset and rebuild the element
		reset: function() {
			var self = this;
			clearInterval(self.timeout);
			var id = this.el.attr('id');
			this.el.empty();
			if (typeof this.cursor !== 'undefined') {
        this.cursor.remove();
      }
			this.strPos = 0;
			this.arrayPos = 0;
			this.curLoop = 0;
			// Send the callback
			this.options.resetCallback();
		}

	};

	$.fn.typed = function(option) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('typed'),
				options = typeof option == 'object' && option;
			if (data) { data.reset(); }
			$this.data('typed', (data = new Typed(this, options)));
			if (typeof option == 'string') data[option]();
		});
	};

	$.fn.typed.defaults = {
		strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
		stringsElement: null,
		// typing speed
		typeSpeed: 0,
		// time before typing starts
		startDelay: 0,
		// backspacing speed
		backSpeed: 0,
		// shuffle the strings
		shuffle: false,
		// time before backspacing
		backDelay: 500,
		// loop
		loop: false,
		// false = infinite
		loopCount: false,
		// show cursor
		showCursor: true,
		// character for cursor
		cursorChar: "|",
		// attribute to type (null == text)
		attr: null,
		// either html or text
		contentType: 'html',
		// call when done callback function
		callback: function() {},
		// starting callback function before each string
		preStringTyped: function() {},
		//callback for every typed string
		onStringTyped: function() {},
		// callback for reset
		resetCallback: function() {}
	};


}(window.jQuery);
