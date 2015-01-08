"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Modal window which blocks pointer events and shows the wait cursor.
 */
module.exports = function(body) {
    var mask = body
	    .append("div")
	    .style("display", "none")
	    .style("opacity", 0)
	    .style("cursor", "wait")
	    .style("z-index", 999)
	    .style("position", "fixed")
	    .style("top", 0)
	    .style("bottom", 0)
	    .style("left", 0)
	    .style("right", 0)
	    .style("margin", 0);
    
    return {
	waiting: function() {
	    mask.style("display", "block");
	},

	ready: function() {
	    mask.style("display", "none");
	}
    };
};
