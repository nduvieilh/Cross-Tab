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
		clear: true,
		clearEvent: true,
		checkOff: true,
		uid: guid(),
		prefix: 'crosstab',
		storageCallback: function(data, kind, key, e) {
			if(this.debug !== 'undefined') {
				console.log("Storage Event Fired.", kind, ": ", data);
			}
		},
		openCallback: function(id, selector) {
			if(this.debug !== 'undefined') {
				console.log("A new tab has joined id: "+selector+" with id: "+id);
			}
		},
		garbageCollectCallback: function() {
			if(this.debug !== 'undefined') {
				console.log("Storage Garbage Collected");
			}
		},
		clearCallback: function(removed) {
			if(this.debug !== 'undefined') {
				console.clear();
				console.log("Storage cleared.  These items removed: ", removed);
			}
		}
	};

	var settings = {};


// Public methods
	var methods = {
	init: function(options) {
		var _this = this;
        var $this = $(this);
        var defaults = defaultSettings;
        settings = $.extend({}, defaults, options);

        this.CrossTab('open');

        $(window).bind('storage', function (e) {
        	var origEvent = e.originalEvent;
        	var data = e.originalEvent.newValue;
        	var key = e.originalEvent.key;
        	var kind = 'update';
        	if(origEvent.newValue !== null && origEvent.oldValue === null) {
        		kind = 'new';
        	} else if(origEvent.newValue === null && origEvent.oldValue !== null) {
        		kind = 'delete';
        		data = e.originalEvent.oldValue;
        	}
        	var processed = _this.CrossTab("readData", data);
        	
        	if(settings.checkOff && typeof processed.checkOff !== 'undefined' && typeof processed.checkOff[settings.uid] === 'undefined') {
        		processed = _this.CrossTab('checkOff', key);
        	}

        	console.log("processed", processed);

        	settings.storageCallback(processed, kind, key, e);
  		});

        console.log("Cross Tab Started");
        console.log(settings);

		return $this;
	},
	open: function() {
		var windowObject = localStorage[settings.prefix+'-windows'];
		if(typeof windowObject === 'object') {
			JSON.parse(windowObject);
			console.log('Window object found: ');
		} else {
			console.log('No window object found, must create a new one.');
			if(settings.clear) {
				this.CrossTab("clear");
			}
			var windowObject = {
				started: new Date(),
			}
		}
		settings.openCallback(settings.uid, settings.selector);
	},
	close: function() {

	},
	write: function(value, type, to, key) {
		var _this = this;
		var created = new Date();
		var update = false;
		if(typeof key !== 'undefined' && typeof localStorage[key] !== 'undefined') {
			created = _this.CrossTab('readKey', key).created;
			update = true;
		}
		if(typeof key === 'undefined') {
			key = settings.prefix+'-'+guid()
		}
		// Add prefix if none exists
		if(key.indexOf(settings.prefix) !== 0) {
			key = settings.prefix+'-'+key;
		}
		value = {
			id: key,
			value: value,
			from: {
				id: settings.uid,
				selector: settings.selector
			},
			created: created,
			modified: created
		}
		if(settings.checkOff) {
			if(typeof value.checkOff === 'undefined') {
				value.checkOff = {};
			}
			value.checkOff[settings.uid] = {
				id: settings.uid,
				selector: settings.selector,
				time: new Date()
			};
		}
		if(typeof type !== 'undefined') {
			value.type = type;
		} else {
			value.type = 'write';
		}
		if(typeof to !== 'undefined') {
			value.to = {
				selector: to
			}
		}
		value = JSON.stringify(value);
		localStorage.setItem(key, value);
	},
	checkOff: function(key) {
		var _this = this;
		if(settings.checkOff) {
			var data = _this.CrossTab('readKey', key);

			data.checkOff[settings.uid] = {
    			id: settings.uid,
    			selector: settings.selector,
    			time: new Date()
    		}

    		var json = JSON.stringify(data);

    		localStorage.setItem(key, json);

    		return data;
		}
	},
	readKey: function(key) {
		var entry = {};
		if(typeof localStorage[key] !== 'undefined') {
			entry = localStorage[key];
		} else {
			console.log("Cannot find a entry with key: ", key);
			return false;
		}
		return this.CrossTab("readData", entry);
	},
	readData: function(data) {
		var processed = JSON.parse(data);
		var now = new Date()
		if(typeof processed.modified !== 'undefined') {
			processed.responseTime = now - new Date(processed.modified);	
		} else {
			processed.responseTime = false;
		}
		return processed;
	},
	garbageCollect: function() {
		settings.garbageCollectCallback();
	},
	clear: function() {
		console.log("Clearing all values that start with: "+settings.prefix);
		var all = Object.keys(localStorage);
		var removed = [];
		for(var i in all) {
			if(all[i].indexOf(settings.prefix) > -1) {
				removed.push(all[i]);
				localStorage.removeItem(all[i]);
			}
		}
		settings.clearCallback(removed);
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