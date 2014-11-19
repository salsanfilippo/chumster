/*
    <script src="//code.angularjs.org/1.3.0/angular-cookies.js"></script>

var app = angular.module('exampleStore', ['ngCookies']);

function MainCtrl($scope, $store) {
    $store.bind($scope, 'test', 'Some Default Text');
    
    $scope.clearTest = function(){ 
        $store.remove('test'); 
    };
}

app.run(function ($rootScope, storage) { 
		  $rootScope.authToken = storage.get('authToken');
		  console.log('authToken: ' + $rootScope.authToken);
		})
*/

app.service('storage', function($parse, $cookieStore) {
	/**
	 * Global Vars
	 */
	var storage = (typeof window.localStorage === 'undefined') ? undefined : window.localStorage,
		supported = !(typeof storage == 'undefined' || typeof window.JSON == 'undefined');

  var self = this; 
    
  /** 
	 * Set - let's you set a new localStorage key pair set
	 * @param key - a string that will be used as the accessor for the pair
	 * @param value - the value of the localStorage item
	 * @returns {*} - will return whatever it is you've stored in the local storage
	 */
	this.set = function (key, value) {
			     if (!supported) {
				   try {
				     $cookieStore.put(key, value); 
					 return value;
				   } catch (e) {
					 console.log('Local Storage not supported, make sure you have the $cookieStore supported.');
				   }
				  }
					
				  var saver = JSON.stringify(value);
				  storage.setItem(key, saver);
				  return parseValue(saver);
				};
            
	/**
	 * Get - let's you get the value of any pair you've stored
	 * @param key - the string that you set as accessor for the pair
	 * @returns {*} - Object,String,Float,Boolean depending on what you stored
	 */
	this.get = function (key) {
				 if (!supported){
				   try {
				     return parseValue($cookieStore.get(key));
				   } catch (e) {
					 return null;
				   }
				 }

			     var item = storage.getItem(key); 
			     return parseValue(item);
			   };
            
	/**
	 * Remove - let's you nuke a value from localStorage
	 * @param key - the accessor value
	 * @returns {boolean} - if everything went as planned
	 */
	this.remove = function (key) {
				    if (!supported) { 
					  try {
					    $cookieStore.remove(key);
					    return true;
					  } catch (e) {
					    return false;
					  }
					}

					storage.removeItem(key);
					return true;
				  };
            
	/**
   * Bind - let's you directly bind a localStorage value to a $scope variable
   * @param $scope - the current scope you want the variable available in
   * @param key - the name of the variable you are binding
   * @param def - the default value (OPTIONAL)
   * @returns {*} - returns whatever the stored value is
   */
  this.bind = function ($scope, key, def) {
			    def = def || '';
			    if (!self.get(key)) {
			      self.set(key, def);
			    }

			    $parse(key).assign($scope, self.get(key)); 
			    $scope.$watch(key, function (val) {
			      if (val)
			        self.set(key, val);
			      else
			        self.remove(key);
			    }, true);
			    return self.get(key);
			  };

	/**
	 * Pass any type of a string from the localStorage to be parsed so it returns a usable version (like an Object)
	 * @param res - a string that will be parsed for type
	 * @returns {*} - whatever the real type of stored value was
	 */
	function parseValue(res) {
    var val;
	  try {
    	val = JSON.parse(res);
    	if (typeof val == 'undefined') {
    	  val = res;
    	}
    
    	if (val == 'true') {
    	  val = true;
    	}
    
    	if (val == 'false') {
    	  val = false;
    	}
    
    	if (parseFloat(val) == val && !angular.isObject(val)) {
    	  val = parseFloat(val);
    	}
	  } catch (e) {
		 val = res;
	  }
	
	  return val;
	}
});
