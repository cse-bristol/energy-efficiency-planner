"use strict";

/*global require, module*/

module.exports = {
    /*
     Modifies a function such that when it is called multiple times in a short space of time, only the final call will actually happen.

     Delay specified in milliseconds.
     */
    defer: function(action, delay) {
	var lastOccurance = new Date(),
	    lastArgs;

	return function() {
	    lastArgs = arguments;
	    var savedArgs = arguments;

	    window.setTimeout(
		function() {
		    if (savedArgs === lastArgs) {
			action(savedArgs);
		    }
		}, 
		delay);
	};
    },
    toArray: function(pseudoArray) {
	return Array.prototype.slice.call(pseudoArray, 0);
    },
    isNum: function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
    },
    callbackHandler: function() {
	var callbacks = [];
	
	var f = function() {
	    var args = arguments;
	    callbacks.forEach(function(c) {
		c.apply(this, args);
	    });
	};
	f.add = function(c) {
	    callbacks.push(c);
	};

	f.remove = function(c) {
	    var i = callbacks.indexOf(c);
	    if (i >= 0) {
		callbacks.splice(i, 1);
	    }
	};

	return f;
    },
    identity: function(x) {
	return x;
    }
};