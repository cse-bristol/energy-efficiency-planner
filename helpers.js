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
	})
};