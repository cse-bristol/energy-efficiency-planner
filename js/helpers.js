"use strict";

/*global require, module*/

var d3 = require("d3");

module.exports = {
    toArray: function(pseudoArray) {
	return Array.prototype.slice.call(pseudoArray, 0);
    },
    isNum: function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
    },
    asNum: function(n) {
	if (module.exports.isNum(n)) {
	    return (+n);
	} else {
	    throw new Error("Not a number " + n);
	}
    },
    isInt: function(n) {
	var i = parseInt(n);
	
	return !isNaN(i) && (parseFloat(n) == i); 
    },
    rounded: function(maybeNumber, precision) {
	if (module.exports.isNum(maybeNumber)) {
	    // parseFloat eliminates scientific e notation.
	    return parseFloat(
		// the leading + coerces numbers from strings
		(+maybeNumber)
		    .toPrecision(precision ? precision : 5)
	    );
	} else {
	    return maybeNumber;
	}
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

	f.clear = function() {
	    while (callbacks.length > 0) {
		callbacks.pop();
	    }
	};

	return f;
    },
    identity: function(x) {
	return x;
    },
    origin: function() {
	var a = document.createElement("a");
	a.href = "/";
	return a.href;
    },
    noDrag: d3.behavior.drag()
	.on("dragstart", function(d, i) {
	    d3.event.sourceEvent.stopPropagation();
	})
	.on("drag", function(d, i) {
	    d3.event.sourceEvent.stopPropagation();
	})
	.on("dragend", function(d, i) {
	    d3.event.sourceEvent.stopPropagation();
	}),
    noop: function() {}
};
