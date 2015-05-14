"use strict";

(function ($) {

	// Create UUID
	function guid() {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    	s4() + '-' + s4() + s4() + s4();
	}


	// Default settings
	var defaultSettings = {
		debug: false,
		uid: guid(),
		prefix: 'crosstab',
		storageCallback: function(data) {
			console.log("Storage Event Fired", data);
		}
	};

	var settings = {};


// Public methods
	var methods = {
	init: function(options) {
        var $this = $(this);
        var defaults = defaultSettings;
        settings = $.extend({}, defaults, options);

        $(window).bind('storage', function (e) {
        	var data = e.originalEvent.newValue;
    		settings.storageCallback(data);
  		});

        console.log("Cross Tab Started");
        console.log(settings);

		return $this;
	},
	write: function(value) {
		localStorage.setItem(settings.prefix+'-'+guid(), value);
	},
	read: function() {

	},
	garbageCollect: function() {

	},
	getSettings: function() {
		if(settings.debug) {
			return settings;
		}
	}
}

$.fn.CrossTab = function( options ) {
	var args = arguments;
	var method = arguments[0];

	if(methods[method]) {
		method = methods[method];
		args = Array.prototype.slice.call(arguments, 1);
	} else if(typeof(method) === 'object' || !method) {
		method = methods.init;
	} else {
		// Error if its not a method or parameters
		$.error('Method '+method+' does not exist in Cross-Tab');
		return this;
	}

    return method.apply(this, args);
}
})(jQuery);